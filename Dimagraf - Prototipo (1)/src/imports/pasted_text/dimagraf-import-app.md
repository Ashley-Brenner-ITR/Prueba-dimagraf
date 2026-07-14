Actúa como un Diseñador UX/UI Senior, Líder de Producto y Arquitecto de Software Experto. [cite_start]Tu objetivo es diseñar e implementar la interfaz de usuario funcional (Frontend SPA en Next.js) y definir los requerimientos lógicos del Backend (Java/PostgreSQL) para una aplicación web independiente de gestión de importaciones destinada a Dimagraf S.A. [cite: 641, 642, 647, 649, 651] [cite_start]El sistema debe digitalizar y reemplazar por completo una planilla Excel maestra de 56 columnas (A-BD), planillas auxiliares dispersas y cuadernos físicos de seguimiento, funcionando de forma complementaria y paralela a SAP ERP (sin integraciones automáticas directas en esta fase)[cite: 640, 642, 643, 644, 1616, 1617, 1621, 1631, 1632].

---

### 1. REGLA ESTRUCTURAL DE DISEÑO: EL CONCEPTO DE "CARPETA"
1. [cite_start]El elemento central e indivisible de tracking en todo el ecosistema es la "Carpeta", la cual representa una Orden de Compra (OC) de importación[cite: 659, 660, 1629, 1641].
2. [cite_start]Formato de Identificación Única: Toda Carpeta debe llevar obligatoriamente una nomenclatura con el formato estricto "Año/Secuencia" (Ejemplo: 2026/437)[cite: 714, 1243, 1642].
3. [cite_start]Consistencia Visual End-to-End: Este número identificador y la estructura de la Carpeta deben presentarse de forma idéntica, consistente y visible en la cabecera, subpantallas, modales y secciones de tracking de todas las interfaces del sistema, sin importar el perfil que navegue[cite: 704].
4. [cite_start]Jerarquía de Navegación Obligatoria: El diseño web debe estructurarse jerárquicamente respetando el flujo: Carpeta (OC) -> Subcarpeta / Embarque Parcial (Nomenclatura: Carpeta + sufijo alfabético, ej: 2026/437-A, 2026/437-B) -> Desglose de Artículos individuales[cite: 648, 664, 699, 1205, 1664, 1685, 1686].

---

### 2. ARQUITECTURA DE MÓDULOS DE NEGOCIO RESPALDADOS
La interfaz general debe estructurarse visualmente para soportar las siguientes capacidades operativas del sistema:
- [cite_start]MOD-001 (Administración de OCs): Alta, consulta y mantenimiento de las Carpetas[cite: 658, 659, 660].
- [cite_start]MOD-002 (Gestión de Artículos y Saldos): Desglose a nivel ítem con cálculo automático de saldos pendientes[cite: 661, 662, 663].
- [cite_start]MOD-003 (Gestión de Embarques y Subcarpetas): Despachos parciales, embarques multi-OC y consolidaciones[cite: 664, 665].
- [cite_start]MOD-004 (Seguimiento de Producción y Pre-Embarque): Monitoreo de fabricación en origen, reemplazando el cuaderno físico[cite: 666].
- [cite_start]MOD-005 (Gestión Documental): Legajo digital embebido por subcarpeta (soporte drag-and-drop, categorización por tipo y previsualización de PDFs)[cite: 667, 668, 708].
- [cite_start]MOD-006 (Tránsito y Arribos): Tracking de tiempos logísticos y provisión en tiempo real de la planilla de arribos[cite: 669, 670].
- [cite_start]MOD-007 (Nacionalización y Despacho Aduanero): Control de despachantes, asignación de canales aduaneros, VEP y costos[cite: 671].
- [cite_start]MOD-008 (Recepción en Depósito): Notificación a almacén, control físico de ingreso y registro ágil de discrepancias[cite: 672].
- [cite_start]MOD-009 (Costeo y Referencia SAP): Registro referencial manual de transacciones del ERP (45, 55 y 18) y coeficientes de costo[cite: 673].
- [cite_start]MOD-010 (Pagos y Proyección Financiera): Condiciones de pago, vencimientos y flujo de caja para Tesorería[cite: 674].
- [cite_start]MOD-011 y MOD-012 (Reportes, Seguridad y Auditoría): Perfiles, logs y reportes automatizados de autoservicio[cite: 675, 677, 678].

---

### 3. REQUERIMIENTOS DE IDENTIDAD VISUAL Y COMPORTAMIENTO (UX/UI)
- Estilo Estético: Interfaz minimalista, futurista y de inspiración "Sci-Fi". Fondo oscuro (Dark Mode nativo) o blanco pulido de alto contraste, con una paleta de colores predominantemente fría: Azul profundo, Violeta eléctrico y Celeste neón.
- Indicadores de Estado y Alertas Neón: Los estados críticos deben utilizar efectos de iluminación o colores neón parpadeantes/resplandecientes:
  * [cite_start]Alertas de demoras en producción o desvíos de fechas: Color Ámbar/Naranja Neón[cite: 700, 1206].
  * [cite_start]Vencimientos de pago inmediatos (Tesorería): Rojo Neón[cite: 700, 1206].
  * [cite_start]Canal de Aduana (MOD-007): Canal Verde (Verde brillante) o Canal Rojo (Rojo Neón destellante)[cite: 671, 700, 1206, 1376].
- [cite_start]Rendimiento y Accesibilidad: El diseño debe garantizar que las búsquedas y visualizaciones de arribos carguen en menos de 3 segundos (RNF-002)[cite: 372, 1338]. [cite_start]Debe ser operable por personal PyME sin conocimientos técnicos avanzados[cite: 1611].

---

### 4. ESPECIFICACIÓN DETALLADA POR ROLES Y PANTALLAS

Diseña la distribución de las vistas y componentes segmentando estrictamente el acceso y visibilidad según estos cinco perfiles funcionales:

#### PERFIL 1: OPERADOR DE IMPORTACIONES (Comex - Johana y Julián)
- [cite_start]Objetivo: Gestión operativa total, carga de datos históricos y activos (aproximadamente 20 embarques concurrentes y 500 carpetas históricas)[cite: 690, 1175, 1612].

PANTALLA 1.1: Dashboard Centralizado de Carpetas (Vista de Control)
- Componentes:
  * [cite_start]Barra de búsqueda rápida universal (Filtros: N° Carpeta, Proveedor, Código de Artículo, Estado del Proceso)[cite: 701, 1207].
  * [cite_start]Grilla de Carpetas Activas con columnas interactivas mostrando: ID Carpeta (Año/Secuencia), Proveedor, Línea (LCA, LDA, etc.), Estado Actual y Último Hito[cite: 1641, 1642, 1643, 1645].

PANTALLA 1.2: Alta de Carpeta (OC) y Desglose de Artículos (MOD-001 / MOD-002)
- Campos de Cabecera requeridos:
  * [cite_start]N° Carpeta (Manual, formato Año/Secuencia)[cite: 714, 1243, 1642].
  * [cite_start]Fecha O/C (Carga por selector de fecha, por defecto fecha actual)[cite: 1642].
  * [cite_start]Proveedor (Menú desplegable del Maestro de Proveedores)[cite: 688, 1173].
  * [cite_start]Contrato Marco / N° de Pedido SAP Tx 45 (Campo numérico de referencia interna SAP)[cite: 656, 1652, 1654].
  * [cite_start]Monto OC Total (Numérico) y Moneda (Dropdown: USD, EUR, etc.)[cite: 1648].
- [cite_start]Comportamiento UX Automático (Carga Asistida - RUX-008): Al seleccionar el Proveedor, la interfaz debe precargar automáticamente desde el maestro: Incoterm habitual (FOB, CIF, etc.), Condición de Pago del Proveedor, Días estimados de producción, Días estimados de tránsito y Despachante habitual[cite: 706, 1283].
- Tabla de Desglose de Artículos (Apertura Ítem por Ítem):
  * [cite_start]Columnas: Código de Artículo SAP, Descripción/Línea de Producto, Cantidad Solicitada, Unidad de Medida (Kilos, M2, Litros, Toneladas), Precio Unitario, Importe Total por Ítem[cite: 1638, 1645, 1647, 1648, 1660].
  * [cite_start]Regla de Negocio Visual: Mostrar una columna dinámica e inalterable de "Saldo Pendiente" por ítem, calculada automáticamente restando las cantidades ya asignadas a Subcarpetas de embarque[cite: 662, 663, 719, 1248].

PANTALLA 1.3: Confirmación de Proveedor y Seguimiento de Producción (MOD-004)
- Componentes:
  * [cite_start]Campo para "Referencia Proveedor" (Código alfanumérico enviado por el fabricante)[cite: 1305, 1661].
  * [cite_start]Checkbox de verificación: "Control Conforme Artículo por Artículo"[cite: 339, 1305, 1660].
  * [cite_start]Área de Texto: Observaciones de Desvíos o registro de reclamos si hay diferencias[cite: 339, 340, 1305, 1306].
  * [cite_start]Cálculo de Fecha de Embarque Estimada: Fecha O/C + Días de Producción del Maestro de Proveedores (Solo lectura)[cite: 1648, 1673].

PANTALLA 1.4: Apertura de Subcarpetas y Legajo Documental (MOD-003 / MOD-005)
- Componentes:
  * Botón "Crear Subcarpeta / Embarque Parcial". [cite_start]Al accionarse genera automáticamente el sufijo (Ej: 2026/437-A)[cite: 664, 1664, 1685].
  * [cite_start]Selector de Artículos: Permite arrastrar o seleccionar ítems de la OC madre y especificar qué cantidad se embarca en este parcial, recalculando los saldos de la pantalla 1.2[cite: 662, 664].
  * [cite_start]Campos del Embarque: Factura N°, Fecha Factura, Importe Total Factura, Peso Neto Kgs, Peso Bruto Kgs, Unidad de Medida Estadística (UME) y Unidad UME[cite: 1693, 1695, 1697].
  * [cite_start]Datos de Logística: Medio de Transporte (Dropdown: Marítimo, Terrestre, Aéreo), Vapor/Buque o Empresa Logística/Forwarder, Identificador del Documento (BL / CRT / AWB) y Cantidad de Contenedores o Camiones[cite: 1699, 1700, 1701, 1702, 1703, 1704].
  * [cite_start]Zona Drag-and-Drop (Legajo Digital): Espacio interactivo para soltar archivos PDF de hasta 20 MB[cite: 1470, 1491]. [cite_start]Cada archivo debe clasificarse obligatoriamente mediante un tag: [Factura Comercial], [Bill of Lading / CRT], [Packing List] o [Certificado de Origen][cite: 708, 1678, 1679, 1680]. [cite_start]Incluir visor de PDF embebido para validación rápida sin descarga[cite: 708].

PANTALLA 1.5: Nacionalización, Despacho Aduanero y Hitos SAP (MOD-007 / MOD-009)
- Componentes:
  * [cite_start]Dropdown: Selección de Despachante Aduanero (asigna uno de los tres operadores habituales)[cite: 1719, 1720].
  * [cite_start]Componente de Estado Aduanero AFIP: Selector manual para marcar "OK Documental Despachante", campo para ingresar el número de Declaración Detallada (DUA) y selector de Canal Aduanero: [Verde] o [Rojo] con su respectivo indicador neón[cite: 671, 1376].
  * Formulario de Costos e Impuestos: Campo numérico para Volante Electrónico de Pago (VEP en AR$), Gastos de Terminal Portuaria y Honorarios del Despachante.
  * [cite_start]Sección "Hay Fondos" (Gestión de Despachantes): Indicador visual que consulta el saldo a favor de Dimagraf con el despachante seleccionado[cite: 342, 1308]. [cite_start]Si el despachante pide fondos, muestra un botón para aplicar el saldo existente antes de emitir un nuevo pago[cite: 1309].
  * [cite_start]Referencias Cruzadas Manuales para SAP: Campo para ingresar el N° de Pedido en Tránsito (Tx 55) y el N° de Ingreso de Mercadería (Tx 18)[cite: 656, 1687, 1705].
  * Campo Coeficiente de Costo Real: Input numérico para asentar el costo final calculado.
  * [cite_start]Botón de acción: "Exportar Estructura para SAP" (Descarga un CSV/Excel formateado para asistir la carga manual en el ERP)[cite: 644, 649, 710].

#### PERFIL 2: DIRECCIÓN / KEY USER (José Uranga)
- [cite_start]Objetivo: Monitoreo ejecutivo de alto nivel, auditoría de costos y aprobación de desvíos operativos[cite: 1611].
- [cite_start]Restricciones: Acceso completo de lectura a todo el historial (hasta 500 carpetas)[cite: 690, 1175]. No realiza carga operativa diaria, solo interviene en desviaciones o auditorías.

PANTALLA 2.1: Dashboard de Control Gerencial y KPIs
- Componentes:
  * Panel de control macro con indicadores de salud de las importaciones: Total de contenedores/camiones activos en tránsito, volumen total monetario comprometido en aduana y contador de alertas operativas.
  * [cite_start]Módulo de Alertas Críticas (Efecto Neón destellante): Tarjetas de acceso directo que listan las Carpetas específicas estancadas en Canal Rojo, retrasos confirmados en la Fecha Estimada de Embarque por parte del proveedor o Carpetas con saldo a favor inmovilizado con despachantes[cite: 700, 1206].

PANTALLA 2.2: Panel de Auditoría de Costos y Desviaciones (ZMR21 Referencial)
- Componentes:
  * [cite_start]Grilla comparativa orientada a Carpetas/Subcarpetas cerradas que cruza: Coeficiente de Costo Estimado (según parámetros maestros del proveedor) vs. Coeficiente de Costo Real (cargado por el operador en el MOD-009)[cite: 44, 673, 1621].
  * Control de Variación Visual: Si la diferencia supera un umbral parametrizable (ej. +/- 5%), la fila se resalta en Violeta o Ámbar Neón.
  * Campo de Visualización de Justificación: Muestra el cuadro de texto donde el operador fundamentó obligatoriamente el motivo del desvío de costos.

#### PERFIL 3: ÁREA COMERCIAL (Mateo y Nicolás)
- [cite_start]Objetivo: Consulta autónoma de disponibilidad de stock futuro y proyecciones de arribo para planificación de ventas[cite: 142, 1612].
- Restricciones: Acceso exclusivo de **SÓLO LECTURA**. [cite_start]Queda totalmente oculto cualquier dato de índole financiera confidencial (costo de artículos, honorarios, VEPs, gastos aduaneros y datos bancarios)[cite: 676]. No tiene permisos para editar campos o cambiar estados.

PANTALLA 3.1: Matriz de Arrivals (Cargas Entrantes en Tiempo Real)
- Componentes:
  * [cite_start]Grilla optimizada orientada a Artículos y Líneas de Producto (Filtros prioritarios por tipo de insumo gráfico: papel estucado, vinilos, LCA, LDA)[cite: 676, 1644, 1645].
  * Columnas visibles obligatorias:
    * [cite_start]Código de Artículo SAP[cite: 1638].
    * [cite_start]Descripción del Producto / Línea[cite: 1644, 1645].
    * [cite_start]N° de Carpeta Madre Asociada (Año/Secuencia) y Subcarpeta[cite: 1642, 1664, 1685].
    * [cite_start]Nombre del Proveedor Internacional[cite: 1643].
    * [cite_start]Cantidad de Mercadería en Viaje y Unidad de Medida[cite: 1647, 1648].
    * [cite_start]Fecha de Arribo Estimada (ETA): Fecha calculada de forma dinámica en base a la Fecha de Embarque Real registrada + los días de tránsito específicos según la vía (Marítima o Terrestre) parametrizada para ese proveedor[cite: 1699, 1704].
  * [cite_start]Botón destacado de un solo clic: "Exportar Planilla de Arrivals a Excel" (Genera la descarga inmediata de la vista comercial filtrada)[cite: 710].

#### PERFIL 4: TESORERÍA
- [cite_start]Objetivo: Previsión financiera a corto y mediano plazo para asegurar la liquidez en los pagos de comercio exterior[cite: 674, 1612, 1631].
- Restricciones: Permiso de lectura detallada sobre aspectos económicos de las carpetas. Permiso de escritura limitado estrictamente al registro de confirmaciones de transferencias emitidas. No edita datos de aduana o depósito.

PANTALLA 4.1: Panel de Proyección de Flujo de Caja (Cash Flow de Importaciones)
- Componentes:
  * [cite_start]Línea de tiempo interactiva o vista de calendario financiero filtrable por horizontes (Próximos 7, 15, 30 días)[cite: 674].
  * Tabla cronológica de obligaciones de pago desglosada por fila, conteniendo de forma mandatoria:
    * [cite_start]ID de Carpeta / Subcarpeta de origen[cite: 1642, 1664, 1685].
    * [cite_start]Proveedor Beneficiario[cite: 1643].
    * [cite_start]Fecha de Vencimiento Estimada (calculada según la condición de pago del proveedor vinculada al hito logístico correspondiente)[cite: 674].
    * [cite_start]Tipo de Obligación (Dropdown/Etiqueta: [Factura Proveedor Exterior], [Flete Internacional / Forwarder], [Impuestos AFIP / VEP], [Gastos de Terminal Portuaria])[cite: 1693, 1702, 1713].
    * [cite_start]Moneda de Pago e Importe Original[cite: 1695, 1696].
    * Equivalencia Estimada en Pesos Argentinos (AR$).
  * Estado Financiero del Ítem: Botón tipo Switch para marcar como [Pendiente de Pago] o [Transferencia Emitida] (con campo adjunto para asentar el número de referencia bancaria o comprobante).
  * [cite_start]Botón de acción: "Exportar Reporte de Vencimientos a Excel"[cite: 710, 1631].

#### PERFIL 5: DEPÓSITO (Estación Logística en Garín)
- [cite_start]Objetivo: Recepción y control de ingreso físico de la mercadería, cotejo contra la documentación de aduana y reporte rápido de novedades logísticas[cite: 672, 1612].
- [cite_start]Restricciones de UX Críticas (Diseño Mobile/Tablet-First): Interfaz optimizada obligatoriamente para pantallas táctiles y tablets de uso industrial en almacenes[cite: 686, 205, 1171]. Botones grandes (mínimo 48x48px utilizables), fuentes de alta legibilidad, menús simplificados al extremo y eliminación de scrolls horizontales. El operador de depósito no tiene acceso a módulos de costos, proveedores internacionales ni datos financieros de la empresa.

PANTALLA 5.1: Agenda de Recepciones y Pre-Avisos Entrantes
- Componentes:
  * Listado limpio de Subcarpetas en estado de tránsito final o aprobadas por aduana que estén próximas a ingresar físicamente al predio.
  * Criterio de Identificación Visual: Cada registro de pre-aviso debe mostrar en un tamaño de fuente destacado el número de "Transacción 18 SAP" o remito asociado que fue cargado previamente por el operador de Comex, sirviendo como llave de validación para el chofer del camión o contenedor que arriba a la dársena.

PANTALLA 5.2: Check-In de Mercadería y Control de Bultos
- Componentes:
  * Al pulsar sobre una recepción entrante, se despliega el listado cerrado de los artículos que componen dicho embarque específico.
  * Tabla de Control de Stock Físico:
    * Fila por Artículo: Código SAP, Nombre del Insumo, Cantidad Teórica Esperada (extraída de la documentación del MOD-003) y un campo numérico editable de "Cantidad Real Recibida".
  * Botón de Acción Rápida: "Confirmación de Entrega Conforme sin Discrepancias" (Establece con un solo toque que las cantidades reales coinciden al 100% con las esperadas, agilizando el flujo diario).

PANTALLA 5.3: Formulario Flotante de Registro de Incidencias / Discrepancias
- Comportamiento: Si el operario modifica la "Cantidad Real Recibida" y esta resulta menor o diferente a la esperada, o si pulsa el botón secundario "Reportar Daño", se despliega obligatoriamente este formulario ágil.
- Campos requeridos:
  * Selector del Tipo de Incidencia (Dropdown táctil con opciones: [Faltante de Producto], [Mercadería Dañada / Rota], [Error de SKU / Producto Equivocado]).
  * Input numérico para fijar la Cantidad Afectada.
  * Campo de texto opcional para comentarios rápidos de la condición de los bultos.
  * Acción de Guardado: Al enviar, el sistema debe cambiar el estado operativo interno, gatillar una alerta visual de alta prioridad en el Dashboard de Importaciones (Perfil 1) y mantener la Carpeta de la OC abierta, impidiendo el cierre lógico de la misma hasta que Comex resuelva el reclamo con el proveedor o seguro.

---

### 5. VALIDACIONES LÓGICAS Y REGLAS DE NEGOCIO TRANSVERSALES (BACKEND)
El agente debe programar las siguientes validaciones automatizadas tras la interfaz:
- [cite_start]Cierre Automatizado de Carpeta (RF-014): El sistema debe evaluar constantemente los saldos de los artículos de una OC madre[cite: 314, 1280]. [cite_start]Una Carpeta pasará automáticamente a estado "Cerrada" únicamente cuando el saldo pendiente de la totalidad de sus ítems asociados sea exactamente igual a cero y la confirmación de depósito no registre incidencias abiertas[cite: 314, 1280].
- [cite_start]Flujo Único de Transporte: No programar pantallas separadas para embarques marítimos o terrestres[cite: 692, 1177]. [cite_start]Las variaciones en la documentación obligatoria (exigir BL para marítimo o CRT/MIC para terrestre) o las diferencias en los plazos logísticos se deben resolver dinámicamente inyectando los parámetros configurados en el Maestro de Proveedores según corresponda[cite: 693, 1699].

Genera la arquitectura de código correspondiente, el mapa detallado de rutas del frontend y la maqueta visual de los componentes descritos aplicando estrictamente las directrices estéticas Sci-Fi/Neón y las restricciones de segregación de cada rol.