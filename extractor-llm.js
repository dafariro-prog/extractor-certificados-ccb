// Extraccion completa de certificados CCB con Claude, aplicando las 68 reglas
// de PROMPT_FINAL.md — el mismo prompt y el mismo normalizador que usa el
// pipeline local del proyecto de migracion.
//
// Flujo por certificado:
//   1. pdf.js reconstruye el texto con layout (equivalente a `pdftotext -layout`)
//   2. pasada 1  -> extraccion con las 68 reglas
//   3. pasada 2  -> auditoria de completitud contra el mismo texto (opcional)
//   4. normalizar() -> estructura canonica bloqueada, orden y nombres exactos

import Anthropic from "./anthropic.min.mjs";
import { normalizar, cobertura } from "./canonico.js";
import { cargarReglas, bloquesSistema, mensajeCertificado } from "./prompt.js";

export const MODELOS = {
  "claude-opus-5": { etiqueta: "Claude Opus 5 (maxima precision)", in: 5, out: 25 },
  "claude-sonnet-5": { etiqueta: "Claude Sonnet 5 (mas economico)", in: 3, out: 15 },
};

const FALLBACK_BETA = "server-side-fallback-2026-07-01";

function cliente(apiKey) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 3 });
}

/** Extrae el primer objeto JSON balanceado del texto de respuesta. */
export function parseJSON(texto) {
  let t = (texto || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const ini = t.indexOf("{");
  if (ini === -1) throw new Error("La respuesta no contiene un objeto JSON.");
  let prof = 0, enStr = false, esc = false;
  for (let i = ini; i < t.length; i++) {
    const c = t[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { enStr = !enStr; continue; }
    if (enStr) continue;
    if (c === "{") prof++;
    else if (c === "}") { prof--; if (prof === 0) return JSON.parse(t.slice(ini, i + 1)); }
  }
  throw new Error("El JSON de la respuesta quedo incompleto (se corto la salida).");
}

function textoDe(msg) {
  return (msg.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
}

async function llamar(client, { modelo, system, messages, onDelta }) {
  const base = {
    model: modelo,
    max_tokens: 64000,
    system,
    messages,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
  };
  // fallback de servidor: si un clasificador rechaza la peticion, se reencamina solo.
  try {
    const stream = client.beta.messages.stream({
      ...base,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
    });
    if (onDelta) stream.on("text", onDelta);
    return await stream.finalMessage();
  } catch (e) {
    const st = e && e.status;
    if (st && st !== 400 && st !== 404) throw e;   // error real: no lo escondas
    const stream = client.messages.stream(base);   // el beta no esta disponible: sigue sin el
    if (onDelta) stream.on("text", onDelta);
    return await stream.finalMessage();
  }
}

function acumularUso(uso, msg) {
  const u = msg.usage || {};
  uso.entrada += (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
  uso.salida += u.output_tokens || 0;
  return uso;
}

export function costoUSD(uso, modelo) {
  const p = MODELOS[modelo] || MODELOS["claude-opus-5"];
  return (uso.entrada / 1e6) * p.in + (uso.salida / 1e6) * p.out;
}

/**
 * Extrae un certificado completo.
 * @param {object} opts
 * @param {string} opts.apiKey      clave de la API de Anthropic (del usuario)
 * @param {string} opts.texto       texto del certificado con layout
 * @param {string} opts.archivo     nombre del PDF de origen
 * @param {string} opts.modelo      id del modelo
 * @param {boolean} opts.auditar    segunda pasada de completitud
 * @param {function} opts.onEstado  callback de progreso
 */
export async function extraerCertificado({ apiKey, texto, archivo, modelo = "claude-opus-5", auditar = true, onEstado = () => {} }) {
  const reglas = await cargarReglas();
  const client = cliente(apiKey);
  const system = bloquesSistema(reglas);
  const uso = { entrada: 0, salida: 0 };

  const peticion = mensajeCertificado(texto, archivo);

  onEstado("extrayendo (1/" + (auditar ? "2" : "1") + ")");
  let msg = await llamar(client, { modelo, system, messages: [{ role: "user", content: peticion }] });
  acumularUso(uso, msg);
  if (msg.stop_reason === "refusal") {
    throw new Error("El modelo declino procesar este documento" + (msg.stop_details?.explanation ? ": " + msg.stop_details.explanation : "."));
  }

  let salida = textoDe(msg);
  let json;
  try {
    json = parseJSON(salida);
  } catch (e) {
    // reintento de reparacion: mismo contexto, se le pide solo el JSON
    onEstado("reparando salida");
    msg = await llamar(client, {
      modelo, system,
      messages: [
        { role: "user", content: peticion },
        { role: "assistant", content: salida.slice(0, 4000) },
        { role: "user", content: "La salida anterior no fue JSON valido (" + e.message + "). Devuelve de nuevo UNICAMENTE el objeto JSON canonico completo, sin markdown ni texto adicional." },
      ],
    });
    acumularUso(uso, msg);
    json = parseJSON(textoDe(msg));
  }

  if (auditar) {
    onEstado("auditando completitud (2/2)");
    const auditoria =
      `Audita la extraccion siguiente contra el texto del certificado y las 68 reglas.\n` +
      `Busca especificamente: grupos completos que quedaron vacios teniendo datos en el certificado; ` +
      `registros unidos que debian separarse por numero de inscripcion (regla 44); ` +
      `capital, socios, cuotas y valores en null o en 0 cuando el certificado los reporta (reglas 40 y 52); ` +
      `nombramientos, reformas, embargos, medidas y poderes faltantes; ` +
      `codigos de acto, tipos de documento, clases de identificacion y libros mal asignados (reglas 20-25, 30, 33); ` +
      `fechas fuera de ISO, importes con separador de miles (reglas 8 y 38); ` +
      `tildes y N perdidas (regla 50); descripciones que copian el certificado completo en vez del acto (reglas 29 y 45); ` +
      `y datos inventados que no estan en el documento (regla 48).\n` +
      `Devuelve UNICAMENTE el JSON canonico completo YA CORREGIDO. Si algo estaba bien, consérvalo tal cual.\n\n` +
      `<<<TEXTO_DEL_CERTIFICADO\n${texto}\nTEXTO_DEL_CERTIFICADO>>>\n\n` +
      `<<<JSON_A_AUDITAR\n${JSON.stringify(json)}\nJSON_A_AUDITAR>>>`;
    try {
      const msg2 = await llamar(client, { modelo, system, messages: [{ role: "user", content: auditoria }] });
      acumularUso(uso, msg2);
      const json2 = parseJSON(textoDe(msg2));
      json = json2;
    } catch (e) {
      // si la auditoria falla, se conserva la pasada 1 y se avisa
      onEstado("auditoria fallida, se conserva la pasada 1");
    }
  }

  json.archivo_fuente = archivo;
  const canonico = normalizar(json);
  return { json: canonico, uso, cobertura: cobertura(canonico) };
}
