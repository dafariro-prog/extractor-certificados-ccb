# Tablas de códigos y normalización

Estas tablas son OBLIGATORIAS y aplican a **cualquier grupo de datos** del JSON, salvo que la regla indique un grupo específico.

## Tipo de documento (regla 20) — campo `tipo_documento`
Siempre en MAYÚSCULAS (regla 9).

| Documento | Código |
|---|---|
| Documento privado | DP |
| Escritura pública | EP |
| Oficio | OF |
| Acta | AC |
| Formulario | FR |
| Acto administrativo | AA |
| Auto | AU |
| Aviso | AV |
| Comunicación | CO |
| Artículo 31 de la Ley 1727 | L1727 |
| Decreto | DC |
| Acta aclaratoria | ACA |
| Los demás | OT |

## Clase de identificación (regla 21) — campo `clase_identificacion`

| Identificación | Código |
|---|---|
| Cédula de ciudadanía | CC |
| NIT | NI |
| Cédula de extranjería | CE |
| Pasaporte | PA |
| Documento extranjero | DE |
| Permiso especial de permanencia | PEP |
| Permiso de protección temporal | PPT |
| Otros | OT |

## Código de acto (regla 22) — campo `codigo_acto`
Aplica en `historico_reformas` y `reformas_estatutarias`.

| Acto | Código |
|---|---|
| Constitución | 0040 |
| Transformación | 0400 |
| Cambio de domicilio | 0042 |
| Reforma | 0710 |
| Fusión | 0500 |
| Disolución | 0510 |
| Liquidación | 0520 |
| Embargos | 0900 |
| Desembargos | 0990 |
| Demandas | 1000 |
| Levantamiento de demanda | 1060 |
| Cancelación de demanda | 1090 |
| Nombramiento de junta directiva | 1100 |
| Nombramiento de representantes legales | 1120 |
| Nombramiento de revisores fiscales | 1730 |
| Inscripción de página web o sitio de internet (Art. 91 Ley 633 de 2000) | 4000 |
| Otros | 9999 |

## Código de acto — procesos de reorganización, adjudicación y liquidación judicial (regla 30)
Campo `codigo_acto` en `procesos_reorganizacion_adjudicacion_liquidacion`.

| Acto | Código |
|---|---|
| Adjudicación de bienes | 0779 |
| Admisión o inicio del proceso de reorganización | 0781 |
| Celebración del acuerdo | 0782 |
| Terminación del acuerdo | 0784 |
| Aviso de inicio del proceso de liquidación judicial | 0785 |
| Archivo del expediente en procesos de liquidación | 0786 |
| Nombramiento del promotor | 0788 |
| Inicio del proceso de liquidación | 0789 |
| Confirmación del acuerdo | 5001 |
| Admisión del proceso de validación de acuerdo extracontractual | 5003 |
| Terminación del proceso de intervención bajo medida de liquidación judicial | 5004 |
| Reapertura del proceso de liquidación | 5005 |
| Disposición del archivo del expediente terminada la liquidación | 5006 |
| Aceptación de la solicitud de negociación de deudas | 5011 |
| Otros actos relacionados | 0787 |

## Código de acto — medidas cautelares y órdenes, cuando LIBRO = 9 (regla 33)
Campo `codigo_acto` en `medidas_cautelares` **solo cuando `libro_inscripcion` = 9**.

| Acto | Código |
|---|---|
| Sorteo para designación del promotor | 0195 |
| Aviso de promoción del acuerdo y nombramiento del promotor | 0752 |
| Designación del promotor | 0754 |
| Aviso convocatoria reunión determinación de derechos y acreencias | 0757 |
| Aviso de celebración del acuerdo | 0760 |
| Aviso de convocatoria para reformar el acuerdo | 0770 |
| Aviso de terminación del acuerdo de reestructuración | 0780 |
| Sorteo de designación del promotor en proceso de reorganización | 0795 |

## Campo `detalle` en embargos / medidas / procesos (reglas 28 y 29)
En `embargos`, `medidas_cautelares` y `procesos_reorganizacion_adjudicacion_liquidacion`, el campo `detalle` debe contener **solo el objeto** del embargo/medida/acción (qué se embarga, qué se ordena, qué dispone el proceso) **sin describir el documento** (oficio/auto/acta/juzgado/número) que lo origina — esos datos ya van en sus campos propios (`tipo_documento`, `numero_documento`, `autoridad`, etc.).

## Regla 32 — embargos/medidas sobre establecimientos de comercio
Si el embargo o la medida cautelar recae **sobre un establecimiento de comercio**, NO se lista en `embargos` ni en `medidas_cautelares`; queda asociado únicamente al establecimiento en `establecimientos_sucursales_agencias`.

## Regla 34 — facultades con limitaciones literales
Si en el grupo de facultades las limitaciones ya están **contenidas literalmente** dentro del texto de `facultades`, NO las repitas en el campo `limitaciones` (déjalo en null para no duplicar).

## Grupo NIIF (regla 42) — campo `grupo_niif` en `clasificacion_ciiu_tamano_empresarial`

| Grupo NIIF | Código |
|---|---|
| Plenas | 1 |
| Medianas y pequeñas | 2 |
| Microempresa | 3 |

## Valores numéricos (regla 38)
Todos los importes y cantidades (capital autorizado/suscrito/pagado/social, valor de cuota/acción, número de cuotas/acciones, aportes, `ingresos_actividad_ordinaria`, límites de medida, activos) van como **número**, sin separador de miles, con punto decimal. `1.152.618` y `1,152,618` → `1152618`.

## Código de tipo de sociedad (regla 17) — campo `codigo_tipo_sociedad`
Solo en `datos_matriculado` (y, por extensión, en cada `propietarios[]` que sea sociedad).

| Tipo de sociedad | Código |
|---|---|
| Por acciones simplificada (SAS) | 16 |
| Anónima (S.A.) | 04 |
| Limitada (Ltda) | 03 |
| Otro / no aplica / establecimiento | null |

## Libro de inscripción (reglas 23 y 25) — campo `libro_inscripcion`
- Convertir números romanos a arábigos: I→1, II→2, III→3, IV→4, V→5, VI→6, VII→7, VIII→8, IX→9, X→10, XI→11, ... , XV→15, ... , XIX→19.
- Si no se identifica el libro, usar el código `91`.

## Acto genérico (regla 14) — campo `acto_generico` en `historico_reformas`
Constitución, reforma, transformación, nombramientos, disolución, liquidación, fusión, escisión, cambio de domicilio, etc.

## Género (regla 16) — campo `genero`
Inferir por el nombre: `Masculino`, `Femenino` o `null` (sin género / persona jurídica).

---

# Códigos DANE (DIVIPOLA) de municipios (reglas 10 y 26)

Adjuntar el código DANE en `codigo_dane` (ubicación) y `codigo_dane_origen` (municipio del documento) en los grupos: historico_reformas, reformas_estatutarias, representantes_legales, junta_directiva, revisores_fiscales, poderes_apoderados, embargos, medidas_cautelares; y en domicilios de personas/propietarios.

Si un municipio no aparece abajo y no estás seguro del código, conserva el nombre y deja `null` en el campo de código (no inventes).

| Municipio | DANE |
|---|---|
| Bogotá D.C. | 11001 |
| Medellín | 05001 |
| Cali | 76001 |
| Barranquilla | 08001 |
| Cartagena | 13001 |
| Cúcuta | 54001 |
| Bucaramanga | 68001 |
| Pereira | 66001 |
| Santa Marta | 47001 |
| Ibagué | 73001 |
| Manizales | 17001 |
| Villavicencio | 50001 |
| Pasto | 52001 |
| Montería | 23001 |
| Neiva | 41001 |
| Armenia | 63001 |
| Popayán | 19001 |
| Sincelejo | 70001 |
| Valledupar | 20001 |
| Tunja | 15001 |
| Riohacha | 44001 |
| Florencia | 18001 |
| Quibdó | 27001 |
| Yopal | 85001 |
| Mocoa | 86001 |
| Arauca | 81001 |
| San José del Guaviare | 95001 |
| Leticia | 91001 |
| Mitú | 97001 |
| Inírida | 94001 |
| Puerto Carreño | 99001 |
| Soacha | 25754 |
| Chía | 25175 |
| Zipaquirá | 25899 |
| Facatativá | 25269 |
| Fusagasugá | 25290 |
| Cáqueza | 25151 |
| Sibaté | 25740 |
| Silvania | 25743 |
| Ubaté (Villa de San Diego) | 25843 |
| Guatavita | 25326 |
| Girardot | 25307 |
| Mosquera | 25473 |
| Madrid | 25430 |
| Funza | 25286 |
| Cajicá | 25126 |
| Envigado | 05266 |
| Itagüí | 05360 |
| Bello | 05088 |
| Sabaneta | 05631 |
| Rionegro | 05615 |
| Caldas (Antioquia) | 05129 |
| Palmira | 76520 |
| Buenaventura | 76109 |
| Tuluá | 76834 |
| Yumbo | 76892 |
| Floridablanca | 68276 |
| Girón | 68307 |
| Piedecuesta | 68547 |
| Puerto Boyacá | 15572 |
| Sogamoso | 15759 |
| Duitama | 15238 |
| Dosquebradas | 66170 |
| Puerto Gaitán | 50568 |
| Apartadó | 05045 |

---

# Estructura sugerida de los elementos de arreglo

Para que la salida sea uniforme, cada elemento de los arreglos debe seguir estas formas (agrega sub-campos extra si el PDF trae más datos; nunca borres claves canónicas).

## socios[] (reglas 38, 39)
Nombres de campo FIJOS. `tipo_socio` (no `calidad`). Valores numéricos sin formato (regla 38).
```json
{ "nombre_completo": null, "primer_nombre": null, "segundo_nombre": null, "primer_apellido": null, "segundo_apellido": null, "genero": null, "tipo_socio": null, "clase_identificacion": null, "numero_identificacion": null, "numero_cuotas": null, "valor_cuota": null, "valor_aporte": null, "porcentaje_participacion": null }
```

## representantes_legales[] (regla 18 calidad; regla 19 PRINCIPAL/SUPLENTE; regla 41 documento_nombramiento)
```json
{ "calidad": null, "cargo": null, "tipo_calidad": null, "tipo_representacion": null, "nombre_completo": null, "primer_nombre": null, "segundo_nombre": null, "primer_apellido": null, "segundo_apellido": null, "genero": null, "clase_identificacion": null, "numero_identificacion": null, "documento_nombramiento": { "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "entidad_otorga": null, "municipio_origen": null, "codigo_dane_origen": null, "numero_inscripcion": null, "fecha_inscripcion": null, "libro_inscripcion": null } }
```

## junta_directiva[] (regla 41)
Cada miembro incluye `documento_nombramiento` (mismo formato que representantes legales / primera versión).
```json
{ "tipo_calidad": null, "renglon": null, "nombre_completo": null, "primer_nombre": null, "segundo_nombre": null, "primer_apellido": null, "segundo_apellido": null, "genero": null, "clase_identificacion": null, "numero_identificacion": null, "documento_nombramiento": { "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "entidad_otorga": null, "municipio_origen": null, "codigo_dane_origen": null, "numero_inscripcion": null, "fecha_inscripcion": null, "libro_inscripcion": null } }
```

## revisores_fiscales[] (regla 41 documento_nombramiento como primera versión)
```json
{ "tipo_calidad": null, "nombre_completo": null, "primer_nombre": null, "segundo_nombre": null, "primer_apellido": null, "segundo_apellido": null, "genero": null, "clase_identificacion": null, "numero_identificacion": null, "tarjeta_profesional": null, "documento_nombramiento": { "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "entidad_otorga": null, "municipio_origen": null, "codigo_dane_origen": null, "numero_inscripcion": null, "fecha_inscripcion": null, "libro_inscripcion": null } }
```

## poderes_apoderados[] (regla 27 — facultades/limitaciones/modificaciones literales; cada modificación en un párrafo distinto)
```json
{ "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "municipio_origen": null, "codigo_dane_origen": null, "numero_inscripcion": null, "libro_inscripcion": null, "apoderado": { "nombre_completo": null, "primer_nombre": null, "segundo_nombre": null, "primer_apellido": null, "segundo_apellido": null, "genero": null, "clase_identificacion": null, "numero_identificacion": null }, "facultades": null, "limitaciones": null, "modificaciones": [] }
```

## historico_reformas[] (reglas 14, 22, 24, 26, 29, 35, 36, 43)
Incluye TODO lo que antes iba en reformas_especiales (ya NO existe ese grupo). `descripcion` = noticia/acto literal. `detalle` = lo fundamental del acto que se inscribe, sin describir el documento ni su origen (regla 29). `entidad_otorgante` (no siempre notaría). NO incluir embargos ni medidas cautelares aquí (regla 43).
```json
{ "acto_generico": null, "codigo_acto": null, "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "entidad_otorgante": null, "autoridad": null, "municipio_origen": null, "codigo_dane_origen": null, "numero_inscripcion": null, "libro_inscripcion": null, "fecha_inscripcion": null, "detalle": null, "descripcion": null }
```

## reformas_estatutarias[] (reglas 15, 37, 43 — solo reformas de estatutos)
Todos los renglones aunque el documento se repita. Solo reformas de estatutos; NO embargos, nombramientos ni medidas. Incluye `entidad_otorgante` y `fecha_inscripcion` (fecha de inscripción en el libro, distinta de `fecha_documento`).
```json
{ "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "entidad_otorgante": null, "descripcion": null, "municipio_origen": null, "codigo_dane_origen": null, "numero_inscripcion": null, "fecha_inscripcion": null, "libro_inscripcion": null, "codigo_acto": null }
```

## embargos[] y medidas_cautelares[] (reglas 22, 24, 26, 28, 32, 33)
`detalle` = objeto del embargo/medida sin describir el documento (regla 28). En medidas con libro 9, `codigo_acto` según regla 33. NO incluir aquí embargos que recaen sobre establecimientos de comercio (regla 32).
```json
{ "tipo_acto": null, "codigo_acto": null, "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "autoridad": null, "municipio_origen": null, "codigo_dane_origen": null, "fecha_inscripcion": null, "numero_inscripcion": null, "libro_inscripcion": null, "detalle": null, "descripcion": null, "proceso_numero": null, "demandante": null, "demandado": null, "limite_medida": null }
```

## procesos_reorganizacion_adjudicacion_liquidacion[] (reglas 29, 30, 31)
`detalle` = objeto de la medida sin describir el documento (regla 29). `codigo_acto` según regla 30. Si es nombramiento del promotor, llenar `promotor` (regla 31).
```json
{ "tipo_acto": null, "codigo_acto": null, "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "autoridad": null, "municipio_origen": null, "codigo_dane_origen": null, "fecha_inscripcion": null, "numero_inscripcion": null, "libro_inscripcion": null, "detalle": null, "promotor": { "nombre_completo": null, "primer_nombre": null, "segundo_nombre": null, "primer_apellido": null, "segundo_apellido": null, "genero": null, "clase_identificacion": null, "numero_identificacion": null } }
```

## situaciones_de_control_y_grupos_empresariales[] (reglas 58–62)
Estructura enriquecida (Confecámaras). `presupuesto_de_control`: `GE` (grupo empresarial) o `SC` (situación de control). `es_matriz_o_subordinada`: `MATRIZ` o `SUBORDINADA`. `tipo_movimiento`: `CONFIGURACION` o `MODIFICACION`. `otorgante_o_declarante` = quien declara/inscribe (normalmente la matriz). `descripcion_registro` = resumen del acto. En `empresas_relacionadas`, `clase_identificacion`/`numero_identificacion` solo si se identifican explícitamente (si no, null). Un registro por número de inscripción.
```json
{ "tipo_documento": null, "numero_documento": null, "fecha_documento": null, "otorgante_o_declarante": null, "libro_inscripcion": null, "numero_inscripcion": null, "fecha_inscripcion": null, "descripcion_registro": null, "fecha_configuracion": null, "presupuesto_de_control": null, "es_matriz_o_subordinada": null, "tipo_movimiento": null, "empresas_relacionadas": [ { "tipo_relacion": null, "nombre": null, "domicilio": null, "clase_identificacion": null, "numero_identificacion": null, "pais": null, "ciiu": [ { "codigo": null, "descripcion": null } ] } ] }
```

## establecimientos_sucursales_agencias[]
```json
{ "tipo": null, "nombre": null, "matricula_numero": null, "municipio": null, "codigo_dane": null }
```

## propietarios[] (para certificados de establecimiento)
```json
{ "nombre": null, "tipo_persona": null, "codigo_tipo_sociedad": null, "clase_identificacion": null, "numero_identificacion": null, "nit": null, "primer_nombre": null, "segundo_nombre": null, "primer_apellido": null, "segundo_apellido": null, "genero": null, "domicilio": null, "codigo_dane_domicilio": null, "matricula_numero": null, "fecha_matricula": null, "ultimo_anio_renovado": null, "fecha_renovacion": null }
```

> El grupo `reformas_especiales` **ya no existe** (regla 35): todo su contenido va en `historico_reformas`.
