// Parser deterministico best-effort (modo borrador, sin API). Portado a ESM.
"use strict";

const MESES = {enero:"01",febrero:"02",marzo:"03",abril:"04",mayo:"05",junio:"06",julio:"07",agosto:"08",septiembre:"09",setiembre:"09",octubre:"10",noviembre:"11",diciembre:"12"};
function fecha(txt){ // "11 de diciembre de 2025" -> 2025-12-11
  if(!txt) return null;
  const m = txt.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
  if(!m) return null;
  const mes = MESES[m[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")];
  if(!mes) return null;
  return `${m[3]}-${mes}-${m[1].padStart(2,"0")}`;
}
function num(s){ if(s==null) return null; const n=String(s).replace(/[.$\s]/g,"").replace(/,00$/,"").replace(/,/g,""); return /^\d+$/.test(n)?parseInt(n,10):null; }
function clean(s){ return s? s.replace(/\s+/g," ").trim() : null; }
const DANE = {soacha:"25754","bogota":"11001","bogotá d.c.":"11001","bogota d.c.":"11001"};
function daneOf(mun){ if(!mun) return null; const k=mun.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s*\(.*/,"").trim(); return DANE[k]||null; }
const NIIF = {"i":"1","ii":"2","iii":"3","grupo i":"1","grupo ii":"2","grupo iii":"3"};

function partirNombre(nc){
  if(!nc) return {primer_nombre:null,segundo_nombre:null,primer_apellido:null,segundo_apellido:null};
  const p = nc.trim().split(/\s+/);
  // heuristica: 4 tokens = N N A A ; 3 = N A A ; 2 = N A
  if(p.length>=4) return {primer_nombre:p[0],segundo_nombre:p[1],primer_apellido:p[2],segundo_apellido:p.slice(3).join(" ")};
  if(p.length===3) return {primer_nombre:p[0],segundo_nombre:null,primer_apellido:p[1],segundo_apellido:p[2]};
  if(p.length===2) return {primer_nombre:p[0],segundo_nombre:null,primer_apellido:p[1],segundo_apellido:null};
  return {primer_nombre:p[0]||null,segundo_nombre:null,primer_apellido:null,segundo_apellido:null};
}

function sinAcentos(s){ return s.normalize("NFD").replace(/[̀-ͯ]/g,""); }
function tipoCert(T){
  const t=sinAcentos(T.toUpperCase());
  if(/CANCELACION DE MATRICULA|MATRICULA CANCELADA/.test(t)) return "CANCELACION";
  if(/EXISTENCIA Y REPRESENTACION LEGAL/.test(t)) return "EXISTENCIA";
  if(/INSCRIPCIONES? DE LIBROS/.test(t)) return "LIBROS";
  if(/MATRICULA DE ESTABLECIMIENTO DE COMERCIO/.test(t)) return "ESTABLECIMIENTO";
  if(/SIN ANIMO DE LUCRO|ENTIDAD.*INSCRI/.test(t)) return "ESADL";
  if(/MATRICULA DE PERSONA NATURAL/.test(t)) return "PERSONA_NATURAL";
  return "OTRO";
}

function plantilla(){
  return {
    archivo_fuente:null,
    metadata_certificado:{camara_comercio:null,tipo_certificado:null,fecha_expedicion:null,hora_expedicion:null,recibo_numero:null,codigo_verificacion:null,destino:null,firmante:{nombre_completo:null,primer_nombre:null,segundo_nombre:null,primer_apellido:null,segundo_apellido:null,genero:null,tipo_firma:null}},
    datos_matriculado:{nombre:null,tipo_registro:null,tipo_sociedad:null,codigo_tipo_sociedad:null,matricula_numero:null,nit:null,clase_identificacion:null,categoria:null,estado:null,activos_vinculados:null,vigilancia_y_control:null,patrimonio:null,moneda:"COP"},
    informacion_matricula_constitucion:{matricula_numero:null,fecha_matricula:null,fecha_constitucion:null,tipo_documento_constitucion:null,numero_documento:null,entidad_otorgante:null,municipio_origen:null,codigo_dane_origen:null,numero_inscripcion:null,libro_inscripcion:null,fecha_inscripcion:null,descripcion:null,aclaratoria_constitucion:{tipo_documento:null,numero_documento:null,fecha_documento:null,entidad_otorgante:null,municipio_origen:null,codigo_dane_origen:null,numero_inscripcion:null,libro_inscripcion:null,fecha_inscripcion:null,descripcion:null}},
    informacion_renovacion:{ultimo_anio_renovado:null,fecha_renovacion:null},
    informacion_ubicacion:{direccion_comercial:null,direccion_notificacion_judicial:null,municipio:null,departamento:null,codigo_dane:null,correo_electronico:null,correo_electronico_notificacion:null,telefono_comercial_1:null,telefono_comercial_2:null,telefono_comercial_3:null},
    termino_duracion:{es_indefinido:null,fecha_vencimiento:null,texto_literal:null},
    objeto_social:{texto_literal:null},
    representacion_legal:{texto_literal:null},
    facultades_representante_legal:{facultades:null,limitaciones:null,prohibiciones:null},
    historico_reformas:[],reformas_estatutarias:[],
    capital:{capital_autorizado:{valor:null,numero_acciones:null,valor_nominal:null},capital_suscrito:{valor:null,numero_acciones:null,valor_nominal:null},capital_pagado:{valor:null,numero_acciones:null,valor_nominal:null},capital_social:{valor:null,numero_cuotas:null,valor_cuota:null},valor_nominal_accion:null,numero_acciones:null,notas:null,emision_bonos:null},
    capital_eats:{aporte_laboral:null,aporte_laboral_adicional:null,aporte_dinero:null,aporte_activos:null},
    socios:[],representantes_legales:[],junta_directiva:[],revisores_fiscales:[],poderes_apoderados:[],embargos:[],medidas_cautelares:[],procesos_reorganizacion_adjudicacion_liquidacion:[],situaciones_de_control_y_grupos_empresariales:[],
    clasificacion_ciiu_tamano_empresarial:{actividad_principal:{codigo_ciiu:null,descripcion:null},actividad_secundaria:{codigo_ciiu:null,descripcion:null},otras_actividades:[],tamano_empresarial:null,grupo_niif:null,ingresos_actividad_ordinaria:null},
    establecimientos_sucursales_agencias:[],propietarios:[],
    recursos_actos_inscripcion:{recurso_en_curso:null,detalle:null},
    _alertas:[]
  };
}

function bloqueCapital(T, etiqueta){
  const re = new RegExp("CAPITAL\\s+"+etiqueta+"\\s*\\*?([\\s\\S]{0,240})","i");
  const m = T.match(re); if(!m) return {valor:null,numero_acciones:null,valor_nominal:null};
  const b=m[1];
  const v=b.match(/Valor\s*:?\s*\$?\s*([\d.,]+)/i);
  const a=b.match(/No\.?\s*de\s*acciones\s*:?\s*([\d.,]+)/i);
  const vn=b.match(/Valor\s*nominal\s*:?\s*\$?\s*([\d.,]+)/i);
  return {valor:v?num(v[1]):null,numero_acciones:a?num(a[1]):null,valor_nominal:vn?num(vn[1]):null};
}

function parse(text, archivo){
  const raw = text.replace(/\u00a0/g," ");
  const j = plantilla();
  j.archivo_fuente = archivo || null;
  const tipo = tipoCert(raw);

  // metadata (desde el texto crudo, antes de quitar encabezados)
  j.metadata_certificado.camara_comercio = /CAMARA DE COMERCIO DE BOGOTA/i.test(sinAcentos(raw).toUpperCase())?"CAMARA DE COMERCIO DE BOGOTA":null;
  j.metadata_certificado.tipo_certificado = (raw.match(/CERTIFICADO DE [A-ZÁÉÍÓÚÑ ]+/)||[])[0]?.trim().replace(/\s+/g," ")||null;
  const fe = raw.match(/Fecha Expedici[oó]n:\s*([^\n]+?)\s*Hora:\s*([\d:]+)/i);
  if(fe){ j.metadata_certificado.fecha_expedicion=fecha(fe[1]); j.metadata_certificado.hora_expedicion=fe[2]; }
  j.metadata_certificado.recibo_numero = (raw.match(/Recibo No\.?\s*(\d+)/i)||[])[1]||null;
  j.metadata_certificado.codigo_verificacion = (raw.match(/C[OÓ]DIGO DE VERIFICACI[OÓ]N\s*([A-Z0-9]+)/i)||[])[1]||null;
  if(/destino a autoridad competente/i.test(raw)) j.metadata_certificado.destino="AUTORIDAD COMPETENTE";
  if(/Firma mec[aá]nica/i.test(raw)) j.metadata_certificado.firmante.tipo_firma="MECANICA";

  // quitar encabezados/pies repetidos entre paginas para que el contenido fluya continuo
  const T = raw
    .replace(/C[áa]mara de Comercio de Bogot[áa]\s+Departamento De Registros[\s\S]*?-{25,}\s*/gi, "\n")
    .replace(/P[áa]gina\s+\d+\s+de\s+\d+/gi, " ");

  // nombre / nit / matricula
  const rs = T.match(/Raz[oó]n social:\s*([^\n]+)/i) || T.match(/Nombre:\s*([^\n]+)/i);
  const dm = j.datos_matriculado;
  dm.nombre = clean(rs?rs[1]:null);
  const nit = T.match(/Nit:\s*([\d]{5,12})\s*[- ]?\s*(\d)?/i);
  if(nit){ dm.nit = nit[2]?`${nit[1]}-${nit[2]}`:nit[1]; dm.clase_identificacion="NIT"; }
  const mat = T.match(/Matr[ií]cula No\.?\s*([0-9]{4,10})/i);
  const matNum = mat? mat[1].padStart(8,"0") : null;
  dm.matricula_numero = matNum;
  j.informacion_matricula_constitucion.matricula_numero = matNum;
  const fm = T.match(/Fecha de matr[ií]cula:\s*([^\n]+)/i); if(fm) j.informacion_matricula_constitucion.fecha_matricula=fecha(fm[1]);
  const uar = T.match(/[UÚ]ltimo a[ñn]o renovado:\s*(\d{4})/i); if(uar) j.informacion_renovacion.ultimo_anio_renovado=parseInt(uar[1],10);
  const fr = T.match(/Fecha de renovaci[oó]n:\s*([^\n]+)/i); if(fr) j.informacion_renovacion.fecha_renovacion=fecha(fr[1]);
  const niif = T.match(/Grupo NIIF:\s*Grupo\s+([IVX]+)/i); if(niif) j.clasificacion_ciiu_tamano_empresarial.grupo_niif=NIIF[niif[1].toLowerCase()]||null;

  // tipo registro / sociedad
  if(tipo==="EXISTENCIA"||tipo==="ESADL"){ dm.tipo_registro=tipo==="ESADL"?"ENTIDAD SIN ANIMO DE LUCRO":"SOCIEDAD"; }
  else if(tipo==="ESTABLECIMIENTO") dm.tipo_registro="ESTABLECIMIENTO DE COMERCIO";
  else if(tipo==="PERSONA_NATURAL") dm.tipo_registro="PERSONA NATURAL";
  const nom=(dm.nombre||"");
  if(/\bS\.?A\.?S\b|SOCIEDAD POR ACCIONES/i.test(nom)){ dm.tipo_sociedad="SOCIEDAD POR ACCIONES SIMPLIFICADA"; dm.codigo_tipo_sociedad="16"; }
  else if(/\bS\.?A\.?\b/.test(nom)){ dm.tipo_sociedad="SOCIEDAD ANONIMA"; dm.codigo_tipo_sociedad="04"; }
  else if(/\bLTDA|LIMITADA\b/i.test(nom)){ dm.tipo_sociedad="SOCIEDAD LIMITADA"; dm.codigo_tipo_sociedad="03"; }

  // estado
  if(/MATRICULA CANCELADA|matr[ií]cula.*cancel/i.test(T)) dm.estado="MATRICULA CANCELADA";
  else if(/EN LIQUIDACI[OÓ]N/i.test(nom)||/EN LIQUIDACI[OÓ]N/i.test(T)) dm.estado="EN LIQUIDACION";

  // ubicacion
  const U=j.informacion_ubicacion;
  U.direccion_comercial = clean((T.match(/Direcci[oó]n del domicilio principal:\s*([^\n]+)/i)||T.match(/Direcci[oó]n comercial:\s*([^\n]+)/i)||T.match(/Direcci[oó]n:\s*([^\n]+)/i)||[])[1]);
  U.direccion_notificacion_judicial = clean((T.match(/Direcci[oó]n para notificaci[oó]n judicial:\s*([^\n]+)/i)||[])[1]);
  const mun = clean((T.match(/Domicilio principal:\s*([^\n]+)/i)||T.match(/Municipio:\s*([^\n]+)/i)||[])[1]);
  if(mun){ U.municipio = mun.replace(/\s*\(.*/,"").toUpperCase(); const dep=mun.match(/\(([^)]+)\)/); if(dep)U.departamento=dep[1].toUpperCase(); U.codigo_dane=daneOf(mun); }
  U.correo_electronico = (T.match(/Correo electr[oó]nico:\s*([^\s]+@[^\s]+)/i)||[])[1]||null;
  U.correo_electronico_notificacion = (T.match(/notificaci[oó]n:\s*\n?\s*([^\s]+@[^\s]+)/i)||[])[1]||null;
  const tels=[...T.matchAll(/Tel[eé]fono comercial\s*(\d):\s*([^\n]+)/gi)];
  for(const tm of tels){ const v=/no report/i.test(tm[2])?null:clean(tm[2]); U["telefono_comercial_"+tm[1]]=v; }

  // constitucion (existencia)
  const con = T.match(/CONSTITUCI[OÓ]N\s*([\s\S]{0,500}?)(?=T[EÉ]RMINO DE DURACI|OBJETO SOCIAL|Pagina)/i);
  if(con){
    const c=con[1].replace(/\s+/g," ").trim(); // aplanar
    const ci=j.informacion_matricula_constitucion;
    const doc=c.match(/Por\s+([A-Za-zÁÉÍÓÚ]+(?:\s+[A-Za-zÁÉÍÓÚ]+){0,2}?)\s+del?\s+(\d{1,2}\s+de\s+[a-zá-ú]+\s+de\s+\d{4})/i);
    if(doc){ ci.tipo_documento_constitucion=clean(doc[1]).toUpperCase(); ci.fecha_constitucion=fecha(doc[2]); }
    const ins=c.match(/inscrit[oa][^0-9]*?(\d{1,2}\s+de\s+[a-zá-ú]+\s+de\s+\d{4})[^0-9]*?No\.?\s*(\d+)\s*del\s+Libro\s*([IVX0-9]+)/i);
    if(ins){ ci.fecha_inscripcion=fecha(ins[1]); ci.numero_inscripcion=ins[2]; ci.libro_inscripcion=romanToNum(ins[3]); }
    const ent=c.match(/de\s+(Asamblea de Accionistas|Junta de Socios|Junta Directiva|Accionista [UÚ]nico)/i);
    if(ent) ci.entidad_otorgante=clean(ent[1]);
    ci.descripcion = clean(c);
  }

  // duracion
  if(/duraci[oó]n es indefinida|duraci[oó]n.*indefinida/i.test(T)){ j.termino_duracion.es_indefinido=true; }
  const durTxt=T.match(/(La persona jur[ií]dica no se encuentra disuelta[^.]*\.)/i); if(durTxt) j.termino_duracion.texto_literal=clean(durTxt[1]);

  // objeto social
  const obj=T.match(/OBJETO SOCIAL\s*([\s\S]{0,1500}?)(?=CAPITAL|REPRESENTACI[OÓ]N LEGAL|Pagina)/i);
  if(obj) j.objeto_social.texto_literal=clean(obj[1]);

  // capital
  if(tipo==="EXISTENCIA"){
    j.capital.capital_autorizado=bloqueCapital(T,"AUTORIZADO");
    j.capital.capital_suscrito=bloqueCapital(T,"SUSCRITO");
    j.capital.capital_pagado=bloqueCapital(T,"PAGADO");
    j.capital.valor_nominal_accion=j.capital.capital_autorizado.valor_nominal;
    j.capital.numero_acciones=j.capital.capital_autorizado.numero_acciones;
    const cs=T.match(/CAPITAL SOCIAL\s*\*?\s*Valor\s*:?\s*\$?\s*([\d.,]+)/i);
    if(cs) j.capital.capital_social.valor=num(cs[1]);
  }

  // representacion legal / facultades
  const rl=T.match(/REPRESENTACI[OÓ]N LEGAL\s*([\s\S]{0,600}?)(?=FACULTADES|NOMBRAMIENTOS|Pagina)/i);
  if(rl) j.representacion_legal.texto_literal=clean(rl[1]);
  const fac=T.match(/FACULTADES Y LIMITACIONES[^\n]*\n([\s\S]{0,800}?)(?=NOMBRAMIENTOS|RECURSOS|Pagina)/i);
  if(fac) j.facultades_representante_legal.facultades=clean(fac[1]);

  // nombramientos -> representantes legales (columnas partidas: "Representante <nombre> C.C. No <id> Legal [Suplente] <apellido>")
  const nb=T.match(/NOMBRAMIENTOS([\s\S]*?)(?=RECURSOS CONTRA|REVISOR|CLASIFICACI[OÓ]N DE ACTIVIDADES|ESTABLECIMIENTO\(S\)|$)/i);
  if(nb){
    const nf=nb[1].replace(/\s+/g," ");
    // patron principal: cargo dividido por el nombre
    const reps=[...nf.matchAll(/(Representante|Gerente|Presidente|Liquidador|Subgerente)\s+([A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ.]+(?:\s+[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ.]+){0,3}?)\s+C\.?C\.?\s*No\.?\s*(\d{4,12})(?:\s+(Legal(?:\s+Suplente)?|Suplente)\s+([A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ]+))?/gi)];
    const vistos=new Set();
    for(const r of reps){
      if(vistos.has(r[3])) continue; vistos.add(r[3]);
      let cargo=r[1]; if(r[4]) cargo += " " + r[4].replace(/^Legal\s*/i,"Legal ");
      cargo = cargo.replace(/\s+/g," ").trim();
      if(/^Representante$/i.test(cargo)) cargo="Representante Legal";
      let nc=clean(r[2]); if(r[5]) nc=nc+" "+r[5];
      const pn=partirNombre(nc);
      j.representantes_legales.push({calidad:cargo,tipo_calidad:/suplente/i.test(cargo)?"SUPLENTE":"PRINCIPAL",nombre_completo:nc,...pn,genero:null,clase_identificacion:"CC",numero_identificacion:r[3],documento_nombramiento:{tipo_documento:null,numero_documento:null,fecha_documento:null,entidad_otorga:null,municipio_origen:null,codigo_dane_origen:null,numero_inscripcion:null,fecha_inscripcion:null,libro_inscripcion:null}});
    }
    if(!j.representantes_legales.length && /C\.?C\.?\s*No/i.test(nf)) j._alertas.push("Nombramientos presentes pero no se pudieron estructurar automaticamente; revisar representantes legales.");
  }

  // CIIU
  const cp=T.match(/Actividad principal C[oó]digo CIIU:\s*(\d{3,4})/i); if(cp) j.clasificacion_ciiu_tamano_empresarial.actividad_principal.codigo_ciiu=cp[1];
  const csec=T.match(/Actividad secundaria C[oó]digo CIIU:\s*(\d{3,4})/i); if(csec) j.clasificacion_ciiu_tamano_empresarial.actividad_secundaria.codigo_ciiu=csec[1];
  const tam=T.match(/tama[ñn]o\s+de\s+la\s+empresa\s+es\s+([A-Za-zñÑáéíóú]+)/i); if(tam) j.clasificacion_ciiu_tamano_empresarial.tamano_empresarial=clean(tam[1]);
  const ing=T.match(/Ingresos por actividad ordinaria\s*\$?\s*([\d.,]+)/i); if(ing) j.clasificacion_ciiu_tamano_empresarial.ingresos_actividad_ordinaria=num(ing[1]);

  // establecimientos (dentro de existencia)
  const estBloque=T.match(/ESTABLECIMIENTO\(S\) DE COMERCIO([\s\S]*?)(?=SI DESEA OBTENER|TAMA[ÑN]O EMPRESARIAL|Pagina)/i);
  if(estBloque){
    const items=[...estBloque[1].matchAll(/Nombre:\s*([^\n]+)[\s\S]*?Matr[ií]cula No\.?:\s*(\d{4,10})[\s\S]*?Municipio:\s*([^\n]+)/gi)];
    for(const e of items){ const municip=clean(e[3]); j.establecimientos_sucursales_agencias.push({tipo:"ESTABLECIMIENTO DE COMERCIO",nombre:clean(e[1]),matricula_numero:e[2].padStart(8,"0"),municipio:municip,codigo_dane:daneOf(municip),embargos:[]}); }
  }

  // recursos
  if(/NO se encuentra\s*en curso ning[uú]n recurso/i.test(T)) j.recursos_actos_inscripcion.recurso_en_curso=false;

  // ESADL patrimonio / vigilancia
  if(tipo==="ESADL"){
    const patr=T.match(/PATRIMONIO[^\d]*\$?\s*([\d.,]+)/i); if(patr) dm.patrimonio=num(patr[1]);
    const vig=T.match(/(?:ENTIDAD QUE EJERCE (?:LA )?(?:INSPECCI[OÓ]N|VIGILANCIA)[^:]*:|VIGILADA POR)\s*([^\n]+)/i); if(vig) dm.vigilancia_y_control=clean(vig[1]);
  }

  // ALERTA mismatch (para que el frontend avise): matricula de la constitucion interna vs archivo
  return {json:j, tipo, matricula:matNum};
}

function romanToNum(s){ if(/^\d+$/.test(s)) return s; const map={I:1,V:5,X:10,L:50,C:100}; let n=0,prev=0; for(const ch of s.toUpperCase().split("").reverse()){ const v=map[ch]||0; n+= v<prev? -v : v; prev=Math.max(prev,v);} return String(n); }

export { parse, tipoCert };
