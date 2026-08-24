// Estructura canonica CCB + normalizador determinista.
// Espejo exacto de PROMPT_FINAL.md (68 reglas) y de
// scripts/node/normalizar_estructura.js del pipeline local.
//
// La estructura esta BLOQUEADA: mismo ORDEN y mismos NOMBRES de campos siempre.
// El normalizador rellena faltantes con null/[]/{} y descarta claves NO canonicas.
// No inventa datos: copia el valor existente cuando la clave canonica esta presente.

const PERSONA = {
  nombre_completo: null, primer_nombre: null, segundo_nombre: null,
  primer_apellido: null, segundo_apellido: null, genero: null,
  clase_identificacion: null, numero_identificacion: null,
};

const DOC_NOMBRAMIENTO = {
  tipo_documento: null, numero_documento: null, fecha_documento: null,
  entidad_otorga: null, municipio_origen: null, codigo_dane_origen: null,
  numero_inscripcion: null, fecha_inscripcion: null, libro_inscripcion: null,
};

const EMBARGO = {
  tipo_acto: null, codigo_acto: null, tipo_documento: null, numero_documento: null,
  fecha_documento: null, autoridad: null, municipio_origen: null, codigo_dane_origen: null,
  fecha_inscripcion: null, numero_inscripcion: null, libro_inscripcion: null,
  detalle: null, descripcion: null, proceso_numero: null, demandante: null,
  demandado: null, limite_medida: null,
};

export const TEMPLATE = {
  archivo_fuente: null,
  metadata_certificado: {
    camara_comercio: null, tipo_certificado: null, fecha_expedicion: null, hora_expedicion: null,
    recibo_numero: null, codigo_verificacion: null, destino: null,
    firmante: {
      nombre_completo: null, primer_nombre: null, segundo_nombre: null,
      primer_apellido: null, segundo_apellido: null, genero: null, tipo_firma: null,
    },
  },
  datos_matriculado: {
    nombre: null, tipo_registro: null, tipo_sociedad: null, codigo_tipo_sociedad: null,
    matricula_numero: null, nit: null, clase_identificacion: null, categoria: null, estado: null,
    activos_vinculados: null, vigilancia_y_control: null, patrimonio: null, moneda: "COP",
  },
  informacion_matricula_constitucion: {
    matricula_numero: null, fecha_matricula: null, fecha_constitucion: null,
    tipo_documento_constitucion: null, numero_documento: null, entidad_otorgante: null,
    municipio_origen: null, codigo_dane_origen: null, numero_inscripcion: null,
    libro_inscripcion: null, fecha_inscripcion: null, descripcion: null,
    aclaratoria_constitucion: {
      tipo_documento: null, numero_documento: null, fecha_documento: null, entidad_otorgante: null,
      municipio_origen: null, codigo_dane_origen: null, numero_inscripcion: null,
      libro_inscripcion: null, fecha_inscripcion: null, descripcion: null,
    },
  },
  informacion_renovacion: { ultimo_anio_renovado: null, fecha_renovacion: null },
  informacion_ubicacion: {
    direccion_comercial: null, direccion_notificacion_judicial: null, municipio: null,
    departamento: null, codigo_dane: null, correo_electronico: null,
    correo_electronico_notificacion: null, telefono_comercial_1: null,
    telefono_comercial_2: null, telefono_comercial_3: null,
  },
  termino_duracion: { es_indefinido: null, fecha_vencimiento: null, texto_literal: null },
  objeto_social: { texto_literal: null },
  representacion_legal: { texto_literal: null },
  facultades_representante_legal: { facultades: null, limitaciones: null, prohibiciones: null },
  historico_reformas: [{
    acto_generico: null, codigo_acto: null, tipo_documento: null, numero_documento: null,
    fecha_documento: null, entidad_otorgante: null, autoridad: null, municipio_origen: null,
    codigo_dane_origen: null, numero_inscripcion: null, libro_inscripcion: null,
    fecha_inscripcion: null, detalle: null, descripcion: null,
  }],
  reformas_estatutarias: [{
    tipo_documento: null, numero_documento: null, fecha_documento: null, entidad_otorgante: null,
    descripcion: null, municipio_origen: null, codigo_dane_origen: null, numero_inscripcion: null,
    fecha_inscripcion: null, libro_inscripcion: null, codigo_acto: null,
  }],
  capital: {
    capital_autorizado: { valor: null, numero_acciones: null, valor_nominal: null },
    capital_suscrito: { valor: null, numero_acciones: null, valor_nominal: null },
    capital_pagado: { valor: null, numero_acciones: null, valor_nominal: null },
    capital_social: { valor: null, numero_cuotas: null, valor_cuota: null },
    valor_nominal_accion: null, numero_acciones: null, notas: null, emision_bonos: null,
  },
  capital_eats: {
    aporte_laboral: null, aporte_laboral_adicional: null, aporte_dinero: null, aporte_activos: null,
  },
  socios: [{
    nombre_completo: null, primer_nombre: null, segundo_nombre: null, primer_apellido: null,
    segundo_apellido: null, genero: null, tipo_socio: null, clase_identificacion: null,
    numero_identificacion: null, numero_cuotas: null, valor_cuota: null, valor_aporte: null,
    porcentaje_participacion: null, aporte_laboral: null, aporte_laboral_adicional: null,
    aporte_dinero: null, aporte_activos: null,
  }],
  representantes_legales: [{
    calidad: null, tipo_calidad: null, nombre_completo: null, primer_nombre: null,
    segundo_nombre: null, primer_apellido: null, segundo_apellido: null, genero: null,
    clase_identificacion: null, numero_identificacion: null,
    documento_nombramiento: { ...DOC_NOMBRAMIENTO },
  }],
  junta_directiva: [{
    tipo_calidad: null, renglon: null, nombre_completo: null, primer_nombre: null,
    segundo_nombre: null, primer_apellido: null, segundo_apellido: null, genero: null,
    clase_identificacion: null, numero_identificacion: null,
    documento_nombramiento: { ...DOC_NOMBRAMIENTO },
  }],
  revisores_fiscales: [{
    tipo_calidad: null, nombre_completo: null, primer_nombre: null, segundo_nombre: null,
    primer_apellido: null, segundo_apellido: null, genero: null, clase_identificacion: null,
    numero_identificacion: null, tarjeta_profesional: null,
    documento_nombramiento: { ...DOC_NOMBRAMIENTO },
  }],
  // regla 68: el poder lleva entidad_otorga y fecha_inscripcion
  poderes_apoderados: [{
    tipo_documento: null, numero_documento: null, fecha_documento: null, entidad_otorga: null,
    municipio_origen: null, codigo_dane_origen: null, numero_inscripcion: null,
    fecha_inscripcion: null, libro_inscripcion: null, apoderado: { ...PERSONA },
    facultades: null, limitaciones: null, modificaciones: [],
  }],
  embargos: [{ ...EMBARGO }],
  medidas_cautelares: [{ ...EMBARGO }],
  procesos_reorganizacion_adjudicacion_liquidacion: [{
    tipo_acto: null, codigo_acto: null, tipo_documento: null, numero_documento: null,
    fecha_documento: null, autoridad: null, municipio_origen: null, codigo_dane_origen: null,
    fecha_inscripcion: null, numero_inscripcion: null, libro_inscripcion: null,
    detalle: null, promotor: { ...PERSONA },
  }],
  situaciones_de_control_y_grupos_empresariales: [{
    tipo_documento: null, numero_documento: null, fecha_documento: null,
    otorgante_o_declarante: null, libro_inscripcion: null, numero_inscripcion: null,
    fecha_inscripcion: null, descripcion_registro: null, fecha_configuracion: null,
    presupuesto_de_control: null, es_matriz_o_subordinada: null, tipo_movimiento: null,
    empresas_relacionadas: [{
      tipo_relacion: null, nombre: null, domicilio: null, clase_identificacion: null,
      numero_identificacion: null, pais: null, ciiu: [{ codigo: null, descripcion: null }],
    }],
  }],
  clasificacion_ciiu_tamano_empresarial: {
    actividad_principal: { codigo_ciiu: null, descripcion: null },
    actividad_secundaria: { codigo_ciiu: null, descripcion: null },
    otras_actividades: [{ codigo_ciiu: null, descripcion: null }],
    tamano_empresarial: null, grupo_niif: null, ingresos_actividad_ordinaria: null,
  },
  establecimientos_sucursales_agencias: [{
    tipo: null, nombre: null, matricula_numero: null, municipio: null, codigo_dane: null,
    embargos: [{ ...EMBARGO }],
  }],
  propietarios: [{
    nombre: null, tipo_persona: null, codigo_tipo_sociedad: null, clase_identificacion: null,
    numero_identificacion: null, nit: null, primer_nombre: null, segundo_nombre: null,
    primer_apellido: null, segundo_apellido: null, genero: null, domicilio: null,
    codigo_dane_domicilio: null, matricula_numero: null, fecha_matricula: null,
    ultimo_anio_renovado: null, fecha_renovacion: null,
  }],
  recursos_actos_inscripcion: { recurso_en_curso: null, detalle: null },
};

function isPlainObj(v) { return v && typeof v === "object" && !Array.isArray(v); }

function norm(tmpl, src) {
  if (Array.isArray(tmpl)) {
    const srcArr = Array.isArray(src) ? src : [];
    if (tmpl.length === 0) return srcArr.slice();   // arreglo de escalares (modificaciones)
    const elt = tmpl[0];
    return srcArr.map((e) => norm(elt, e));
  }
  if (isPlainObj(tmpl)) {
    const s = isPlainObj(src) ? src : {};
    const out = {};
    for (const k of Object.keys(tmpl)) out[k] = norm(tmpl[k], s[k]);
    return out;                                     // solo claves canonicas, en orden
  }
  return src === undefined ? tmpl : src;            // escalar: conserva valor si existe
}

/** Reescribe cualquier objeto a la estructura canonica exacta. */
export function normalizar(obj) {
  return norm(TEMPLATE, obj);
}

/** Claves canonicas de primer nivel, en orden. Para el chequeo de completitud. */
export const GRUPOS = Object.keys(TEMPLATE);

/**
 * Cuenta hojas con dato real vs hojas totales, y reporta que grupos quedaron vacios.
 * Sirve como semaforo de completitud, no como validacion juridica.
 */
export function cobertura(json) {
  let hojas = 0, conDato = 0;
  const vacios = [];
  const walk = (v) => {
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (isPlainObj(v)) { Object.values(v).forEach(walk); return; }
    hojas++;
    if (v !== null && v !== undefined && v !== "") conDato++;
  };
  for (const g of GRUPOS) {
    const v = json[g];
    if (Array.isArray(v) && v.length === 0) vacios.push(g);
    walk(v);
  }
  return { hojas, con_dato: conDato, grupos_vacios: vacios };
}

// ---------------------------------------------------------------------------
// Diagnostico del JSON de entrada
// ---------------------------------------------------------------------------

function puntajeCanonico(o) {
  if (!isPlainObj(o)) return 0;
  const ks = Object.keys(TEMPLATE);
  return Object.keys(o).filter((k) => ks.includes(k)).length;
}

/**
 * Si el JSON viene envuelto ({"certificado": {...}}, {"json": {...}}, ...),
 * devuelve el objeto de adentro. Si ya es canonico, lo devuelve tal cual.
 */
export function desenvolver(o) {
  if (!isPlainObj(o)) return o;
  if (puntajeCanonico(o) >= 3) return o;
  for (const k of Object.keys(o)) {
    if (puntajeCanonico(o[k]) >= 3) return o[k];
  }
  return o;
}

/** Rutas presentes en el origen que NO existen en la estructura canonica. */
export function clavesDescartadas(src, tmpl = TEMPLATE, ruta = "", out = []) {
  if (Array.isArray(tmpl)) {
    if (!Array.isArray(src) || tmpl.length === 0) return out;
    src.forEach((e) => clavesDescartadas(e, tmpl[0], ruta + "[]", out));
    return out;
  }
  if (isPlainObj(tmpl)) {
    if (!isPlainObj(src)) return out;
    for (const k of Object.keys(src)) {
      const r = ruta ? ruta + "." + k : k;
      if (!(k in tmpl)) { if (out.length < 40) out.push(r); continue; }
      clavesDescartadas(src[k], tmpl[k], r, out);
    }
  }
  return out;
}

/**
 * Normaliza y ademas explica que paso: claves descartadas y si el JSON venia
 * practicamente vacio (el caso tipico es haber pegado la plantilla de
 * referencia del prompt en vez de la respuesta con datos).
 */
export function normalizarConDiagnostico(crudo) {
  const src = desenvolver(crudo);
  const descartadas = clavesDescartadas(src);
  const json = normalizar(src);
  const cob = cobertura(json);
  // 1 = moneda "COP", que es un valor por defecto de la plantilla
  const vacio = cob.con_dato <= 1 + (json.archivo_fuente ? 1 : 0);
  return { json, cobertura: cob, descartadas, vacio };
}
