# Roles y flujos de uso

Esta sección explica cada rol como si fuera la primera vez que alguien se acerca al proyecto. La idea es responder tres preguntas simples: por dónde entra cada usuario, qué debería poder resolver y qué resultado espera obtener al recorrer su flujo.

## Importaciones / Comex

- `Dónde ingresa`: entra por `Carpetas (OCs)`. También consulta `Matriz de Arrivals`, `Panel de Notificaciones` y debería acceder a calendario de vencimientos.
- `Qué debe lograr`: transformar una orden de compra en una carpeta trazable de punta a punta, con sus artículos, aperturas, documentos, hitos logísticos, referencias SAP y compromisos financieros.
- `Qué debe hacer`: abrir carpetas, cargar datos generales de la OC, mantener artículos y saldos, abrir subcarpetas/embarques, registrar documentación, hacer seguimiento de producción, coordinar despacho, avisar a depósito, cargar referencias SAP y monitorear pagos y vencimientos.
- `Flujo principal`:
  `Carpetas` -> `Nueva Carpeta` -> `Carga manual o masiva de artículos` -> `~~Revisión manual pesada dentro del modal~~` -> `Detalle de carpeta / Artículos` -> `Validación de confirmación proveedor` -> `Seguimiento de producción` -> `Apertura de embarque/subcarpeta` -> `Anexos / documentación` -> `Tránsito / Arrivals` -> `Aduana / SAP` -> `Recepción / aviso a depósito` -> `Costeo SAP` -> `Pagos` -> `Cierre de carpeta`.
- `Objetivo de negocio`: tener trazabilidad end-to-end de cada carpeta madre y de cada apertura, sin depender de Excel y correo como eje operativo.

## Comercial

- `Dónde ingresa`: por necesidad de negocio debería entrar a `Matriz de Arrivals` como vista principal. Hoy el prototipo entra a `Carpetas`.
- `Qué debe lograr`: saber qué artículos vienen en camino, cuándo podrían estar disponibles y qué cambios logísticos podrían impactar al equipo comercial.
- `Qué debe hacer`: consultar fechas de llegada por artículo, revisar tránsito, ver estado de carpetas relacionadas y anticipar disponibilidad comercial sin exponer importes sensibles.
- `Flujo principal`:
  `Matriz de Arrivals` -> `Filtros por artículo / línea / fecha` -> `Consulta de carpeta vinculada` -> `Detalle de carpeta en solo lectura sin importes`.
- `Objetivo de negocio`: planificar ventas y disponibilidad a partir de arribos confirmados y próximos eventos logísticos.

## Dirección

- `Dónde ingresa`: `Control Gerencial`.
- `Qué debe lograr`: tener una lectura ejecutiva del negocio de importaciones, identificando riesgos, desvíos de costo, alertas y próximos compromisos relevantes.
- `Qué debe hacer`: revisar KPIs ejecutivos, alertas críticas, desvíos de coeficientes, estado general de carpetas y próximos compromisos relevantes.
- `Flujo principal`:
  `Control Gerencial` -> `Alertas críticas` -> `Detalle de carpeta solo lectura` -> `Auditoría Costos` -> `Calendario / vencimientos clave`.
- `Objetivo de negocio`: supervisión ejecutiva, desvíos y toma de decisiones sin entrar al detalle operativo cotidiano.

## Tesorería

- `Dónde ingresa`: `Flujo de Caja`.
- `Qué debe lograr`: anticipar necesidades de fondos, entender qué pagos se acercan y registrar lo efectivamente pagado para no perder trazabilidad financiera.
- `Qué debe hacer`: ver vencimientos, compromisos por proveedor, VEP y flete, identificar criticidad, registrar pagos ejecutados y coordinar fondos.
- `Flujo principal`:
  `Flujo de Caja` -> `Calendario de vencimientos` -> `Detalle por carpeta/subcarpeta` -> `Registro de pago real` -> `Estado de pagos`.
- `Objetivo de negocio`: administrar previsión financiera y ejecución de pagos sobre información confiable y anticipada.

## Depósito

- `Dónde ingresa`: `Recepciones`.
- `Qué debe lograr`: validar que lo que llega físicamente coincide con lo esperado y dejar asentadas conformidades o diferencias de manera operativa.
- `Qué debe hacer`: recibir preaviso, controlar físicamente artículos, comparar cantidades teóricas vs reales, registrar incidencias y confirmar recepción.
- `Flujo principal`:
  `Recepciones` -> `Agenda de embarques entrantes` -> `Check-in de recepción` -> `Control físico` -> `Incidencias` -> `Conformidad de recepción`.
- `Objetivo de negocio`: asegurar ingreso físico correcto y dejar evidencia operativa de discrepancias y conformidades.

## Despachante

- `Dónde ingresa`: `Carpetas` del perfil despachante.
- `Qué debe lograr`: completar la información aduanera de cada apertura para que el resto del circuito tenga visibilidad clara del estado de nacionalización.
- `Qué debe hacer`: completar datos de nacionalización por apertura, informar canal, despacho, VEP, gastos y fechas críticas de oficialización y salida.
- `Flujo principal`:
  `Carpetas activas` -> `Detalle operativo por subcarpeta` -> `Canal` -> `Despacho ZFI/ZFE` -> `Gastos y VEP` -> `Fechas clave`.
- `Objetivo de negocio`: centralizar la información aduanera operativa en cada apertura/embarque.

## Administrador General

- `Dónde ingresa`: `Usuarios`.
- `Qué debe lograr`: asegurar que el sistema esté correctamente parametrizado, con accesos controlados, datos maestros consistentes y trazabilidad de acciones.
- `Qué debe hacer`: administrar usuarios, roles, permisos, auditoría, catálogos maestros y configuración extendida por proveedor para análisis documental. `~~Asignación multirol como faltante base~~` ya quedó resuelta en el ABM del prototipo.
- `Flujo principal`:
  `Usuarios` -> `Roles y permisos` -> `Auditoría` -> `Artículos` -> `Proveedores` -> `Configuración documental / VAL`.
- `Objetivo de negocio`: sostener seguridad, parametrización y gobernanza de la operación.