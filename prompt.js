// Construccion del prompt de extraccion: las 68 reglas + tablas de codigos +
// el texto del certificado. Lo usan los dos caminos:
//   - modo Claude (sin clave): se copia/descarga para pegarlo en Claude
//   - modo API (con clave): va como system + user en la llamada

let REGLAS = null;

/** Carga PROMPT_FINAL.md + tablas_codigos.md (mismo origen, sin CDN). */
export async function cargarReglas() {
  if (REGLAS) return REGLAS;
  const leer = async (ruta) => {
    const r = await fetch(ruta);
    if (!r.ok) throw new Error("No se pudo cargar " + ruta + " (" + r.status + ")");
    return r.text();
  };
  const [prompt, tablas] = await Promise.all([
    leer("./reglas/PROMPT_FINAL.md"),
    leer("./reglas/tablas_codigos.md"),
  ]);
  REGLAS = { prompt, tablas };
  return REGLAS;
}

export const SALIDA = `
## Formato de salida (obligatorio)

Devuelve UNICAMENTE el objeto JSON canonico completo, sin markdown, sin explicaciones
y sin texto antes ni despues. Incluye SIEMPRE todas las claves de la estructura
canonica, en el mismo orden; las que no apliquen van en null, [] o {}.
No inventes datos que no esten en el certificado (regla 48).`;

/** Bloques del system prompt para la llamada por API (el prefijo se cachea). */
export function bloquesSistema({ prompt, tablas }) {
  return [
    { type: "text", text: prompt + "\n\n" + SALIDA },
    { type: "text", text: tablas, cache_control: { type: "ephemeral" } },
  ];
}

/** Mensaje de usuario con el certificado a extraer. */
export function mensajeCertificado(texto, archivo) {
  return (
    `Certificado a extraer. \`archivo_fuente\` = "${archivo}".\n` +
    `Aplica las 68 reglas y devuelve el JSON canonico completo.\n\n` +
    `<<<TEXTO_DEL_CERTIFICADO\n${texto}\nTEXTO_DEL_CERTIFICADO>>>`
  );
}

/**
 * Documento unico, autocontenido, para pegar o adjuntar en Claude.
 * Lleva las 68 reglas, las tablas de codigos, la estructura canonica y el texto.
 */
export function promptCompleto({ prompt, tablas }, texto, archivo) {
  return [
    "# Tarea",
    "",
    "Extrae el certificado de la Camara de Comercio que esta al final de este documento",
    "y devuelve el JSON canonico completo aplicando TODAS las reglas de abajo.",
    SALIDA.trim(),
    "",
    "---",
    "",
    prompt,
    "",
    "---",
    "",
    tablas,
    "",
    "---",
    "",
    "# Certificado a extraer",
    "",
    "`archivo_fuente` = \"" + archivo + "\"",
    "",
    "<<<TEXTO_DEL_CERTIFICADO",
    texto,
    "TEXTO_DEL_CERTIFICADO>>>",
  ].join("\n");
}
