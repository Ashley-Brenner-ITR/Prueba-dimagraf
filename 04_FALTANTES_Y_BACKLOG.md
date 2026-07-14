# Faltantes y backlog de trabajo

Este documento resume el pendiente actual y también deja asentados los cambios relevantes que ya quedaron implementados para no seguir tratándolos como deuda abierta.

## Historial de cambios ya realizados

### 2026-07-13

- `Login inicial por usuario`: el prototipo ahora arranca con una pantalla de acceso donde el usuario ingresa un nombre simple, por ejemplo `importaciones`, `direccion` o `tesoreria`.
- `Contraseña opcional en este ejemplo`: la UI ya representa el campo contraseña, pero el acceso puede resolverse sin validarla en esta etapa del prototipo.
- `Restricción de roles por usuario`: cada usuario solo puede alternar entre los roles que tiene asignados. Ya no puede navegar libremente hacia otros perfiles.
- `Base multirol en el ABM`: el ABM de usuarios ya permite asignar más de un rol por usuario y usar eso como base del acceso.
- `Usuario de testing`: se agregó el usuario `testing`, visible en el ABM, con multirol y acceso asignable a Design System para probar qué ve un usuario cuando combina perfiles.
- `Carga masiva en Nueva Carpeta`: el alta de carpeta ya soporta flujo guiado con carga manual o masiva, descarga de plantilla, subida de archivo o pegado desde Excel y validación previa antes de crear la carpeta.
- `Revisión detallada en Artículos`: la validación pesada dejó de vivir en el modal. La carpeta creada abre directamente en `Artículos`, donde quedan visibles observaciones, estados de validación y origen de carga por fila.
- `Persistencia de cambios en carpeta`: las ediciones realizadas dentro del detalle ya impactan el estado principal de la app mediante actualización de la carpeta desde `CarpetaDetail` hacia `App`.
- `Reglas operativas de OC y embarques`: la OC original se puede editar antes del primer embarque, se bloquea después, el saldo se descuenta por asignaciones de embarque y la carpeta se cierra automáticamente cuando todos los saldos llegan a cero.
- `Historial de cambios`: la app ya conserva un registro interno de eventos y cambios relevantes para soportar seguimiento y auditoría del prototipo.
- `Shell responsive inicial`: la navegación superior ya evita mostrar el nombre completo en el header y el panel de notificaciones dejó de romperse en pantallas angostas.

### 2026-07-14

- `Notificaciones`: se reordenó el header del panel para mejorar jerarquía visual (`título`, acción `Marcar todas`, cierre) y se reforzó la distinción entre notificaciones leídas vs no leídas.
- `Tabs en detalle de carpeta`: se ajustó el estilo para que funcionen como navegación de sección (alineado al patrón de sub-nav) y no como botones de acción.
- `Contraste de acciones sobre fondos con trama`: se normalizaron botones de acción con borde para usar fondo sólido (`CANVAS`) en módulos donde quedaban transparentes.
- `Matriz de Arrivals responsive`: la vista mobile pasó de tabla horizontal a cards compactas, conservando toda la información clave (subcarpeta, descripción, proveedor, cantidad, transporte, línea y ETA/estado temporal).
- `Matriz de Arrivals semántica visual`: se reemplazaron emojis de transporte por iconografía consistente y se ajustó la jerarquía de color entre fecha y estado (`Vencido`/`en X días`).
- `Dirección - Alertas críticas`: se corrigió responsive en mobile con wrap/redistribución de bloques y se incrementó opacidad de fondo para evitar apariencia transparente.
- `Configuración de cuenta`: se agregó bloque de `reportes automáticos por correo` (activar/desactivar, destinatarios, frecuencia y hora), dejando el alcance de adjuntos en Excel.
- `Escalabilidad del modal de configuración`: se amplió ancho/alto útil, se agregó scroll interno en contenido y footer persistente para soportar futuras configuraciones sin romper layout.
- `Configuración de cuenta en pantalla dedicada`: la configuración dejó de estar en modal y pasó a una vista propia para soportar crecimiento funcional.
- `Selección de reportes por correo`: se agregó selección explícita de reportes a enviar (`Matriz de Arrivals`, `Vencimientos`, `Flujo de Caja`, `Auditoría de Costos`) dentro de la configuración de correo.

### Notas para siguientes ajustes

- `Seguridad multirol`: la base ya quedó implementada en el prototipo. Lo pendiente a futuro es endurecer reglas, permisos por campo y persistencia real.

## Reglas claras de edición (vigente en prototipo)

### Regla transversal

- `Lectura por defecto`: perfiles en modo solo lectura no editan atributos de carpeta.
- `Importaciones como editor de OC`: la edición de datos de OC original en `General` y `Artículos` corresponde al rol `Importaciones`.
- `Bloqueo por primer embarque`: al crear el primer embarque/subcarpeta, la OC original se bloquea para edición.
- `Bloqueo por cierre`: una carpeta en estado `Cerrada` no permite edición de OC original.

### Matriz por rol y momento

- `Importaciones`:
	- `General (OC original)`: editable solo `antes del primer embarque` y si la carpeta `no está cerrada`.
	- `Artículos (OC original)`: editable solo `antes del primer embarque` y si la carpeta `no está cerrada`.
	- `Mensaje de bloqueo`: si no se puede editar, se informa causa (`solo lectura`, `primer embarque creado`, `carpeta cerrada`).
- `Dirección`: `solo lectura` en detalle de carpeta.
- `Comercial`: `solo lectura` en detalle de carpeta y además `sin importes`.
- `Tesorería`: edición concentrada en flujo de pagos/cashflow (no en OC original de carpeta).
- `Depósito`: edición concentrada en recepción e incidencias físicas (no en OC original de carpeta).
- `Despachante`: edición concentrada en atributos aduaneros por apertura/subcarpeta (no en OC original de carpeta).
- `Admin`: administración de maestros, usuarios, permisos y auditoría; no se define edición operativa de OC original como flujo principal.

## Alta prioridad funcional pendiente

- ~~`Carga masiva de artículos por carpeta`: hoy la carga es manual de a un artículo. Falta importación masiva con `código de artículo`, `cantidad`, `UM`, `UME`, equivalencias y datos adicionales de la OC.~~
- ~~`Revisión detallada de importación en Artículos`: la validación principal ya no vive en el modal y quedó trasladada al detalle operativo de la carpeta.~~
- `Validación automática documento vs OC`: falta función para comparar confirmación de pedido contra OC por descripción, ítems y cantidades, aceptando documentos en inglés, Excel o PDF, con confirmación de diferencias.
- `Validación automática factura vs confirmación`: misma lógica que el punto anterior, comparando factura con confirmación previamente validada.
- `Solapa Pagos en la carpeta`: hoy falta una instancia explícita en el flujo interno de la carpeta para vencimientos, pagos reales, banco, condición facturada, pago marítima y pago aduana.
- `Coeficiente por apertura y no por carpeta madre`: debe reflejarse en modelo y UI que el coeficiente pertenece a `437-A`, `437-B`, etc. La carpeta madre no tiene coeficiente salvo apertura propia.
- `Atributos editables por rol`: falta definir y aplicar qué campos puede editar cada perfil.
- `Responsive pendiente por pantalla`: todavía quedan grillas y módulos desktop-rígidos en `Director`, `Tesorería`, `Depósito`, `Despachante`, `Administrador`, `Matriz de Arrivals` y parte del detalle operativo.

## Ajustes de navegación y perfiles

- ~~`Seguridad multirol`: permitir más de un rol por usuario, por ejemplo `Tesorería + Importaciones`.~~
- `Perfil Comercial`: la vista principal debe ser `Matriz de Arrivals`, no `Carpetas`.
- `Calendario de vencimientos`: agregar vista o widget para `Importaciones`, `Tesorería` y `Dirección`.

## Ajustes de grillas y listados

- `Vista de carpetas con expansión inline`: agregar `+/-` para desplegar artículos sin entrar al detalle.
- `Carpeta madre y aperturas en misma jerarquía visual`: en la grilla principal deben verse al mismo nivel entidades como `437` y `437-A`.
- `Grilla principal con más atributos`: incorporar columnas adicionales y evaluar una grilla dinámica configurable.
- `Grilla principal con mayores filtros`: ampliar filtros por estado, proveedor, línea, fecha, transporte, despachante, canal, etc.
- `Paginado en listas de artículos`: necesario para escalar y no depender de tablas completas en memoria.

## Ajustes específicos por pantalla

- `Matriz de Arrivals`: ordenar por fecha de llegada y también por descripción; agregar más filtros.
- `Depósito`: agregar `UME` y `UM` en recepción/check-in.
- `Terminología`: donde hoy diga `mercadería`, debería normalizarse a `artículo` cuando corresponda al modelo funcional.

## Deuda de UI pendiente por módulo

- `Importaciones`: revisar botones con fondo blanco sobre superficies con trama para que no queden transparentes ni pierdan contraste.
- ~~`Importaciones`: revisar tabs mobile para que funcionen como navegación de sección y no se perciban como botones de acción.~~
- `Importaciones`: mejorar jerarquías visuales dentro de cada tab para separar mejor resumen, edición, estados y bloques secundarios.
- `Importaciones`: revisar el patrón de edición dentro de cada tab para que no compita con la lectura del contenido.
- ~~`Matriz de Arrivals`: ajustar la tabla responsive; hoy sigue dependiendo demasiado del ancho horizontal.~~
- ~~`Matriz de Arrivals`: reemplazar emojis por iconografía consistente en transporte.~~
- `Matriz de Arrivals`: diferenciar semánticamente vencido, próximo a vencer en 5 días y estados con más margen; la cantidad en viaje no debería usar un color semántico aparte.
- `Matriz de Arrivals`: unificar el criterio de chips dentro de la tabla.
- ~~`Notificaciones`: ajustar el bloque superior para que primero aparezca la campana, luego el título y debajo el chip de nuevas; el chip debe reutilizar la campana de la preview cerrada.~~
- `Dirección`: revisar la jerarquía entre `KPIs`, `Auditoría costos` y `Exportar` para que la acción dependa visualmente del bloque correcto.
- ~~`Dirección`: corregir `Alertas críticas` en mobile; hoy no quedaron responsive y además muestran fondo transparente.~~
- `Dirección`: repensar los gráficos en mobile para evitar scroll horizontal dedicado sólo a verlos.
- `Dirección`: ajustar la tabla de `Auditoría costos` para que sus componentes respondan bien en mobile.
- `Dirección`: al ingresar a una carpeta se repiten los mismos problemas de consistencia y responsive que en `Importaciones`.
- `Comercial`: dentro de las carpetas persisten los mismos problemas de consistencia y responsive que en `Importaciones`.
- `Comercial`: aclarar visualmente el chip de `Solo lectura` y el estado `OC cerrada` dentro de la carpeta.
- `Comercial`: ajustar la tabla de `Matriz de Arrivals` para que sea responsive.
- `Tesorería`: revisar las cards porque la que muestra el valor crece más de lo debido en mobile.
- `Tesorería`: revisar el responsive de la tabla porque concentra demasiada información para mobile.
- `Tesorería`: habilitar el marcado como `emitida` en mobile.
- `Tesorería`: agregar feedback tipo snackbar al marcar una emisión, incluyendo opción de revertir el cambio.
- `Depósito`: corregir los círculos grandes en el fondo de las cards mobile, que hoy se leen como chips rotos.
- `Depósito`: revisar cards mobile porque quedaron demasiado grandes, con poca separación entre items y sin acciones útiles visibles.
- `Depósito`: documentar y unificar botones de acción; acá se usa un estilo para confirmar y reportar distinto al de otras pantallas.
- `Despachante`: corregir el mismo problema de círculos grandes en mobile que aparece en `Depósito`.
- `Despachante`: unificar la forma de cargar embarques con el resto de las acciones equivalentes de otros roles.
- `Admin`: revisar filtros en `Auditoría`.
- `Admin`: revisar la ubicación del botón `Nuevo artículo`, porque quedó inconsistente con el resto de los ABM.
- `Admin`: definir como criterio global en qué pantallas se edita inline en la tabla y en cuáles se entra a detalle para editar.
- `Admin`: seguir comprimiendo tablas para reducir densidad sin perder legibilidad.

## Documentación y anexos

- `Clasificación de archivos al subirlos`: cada anexo debería clasificarse por tipo documental y visibilidad por rol.
- `Anexos en una única solapa`: mantener todos los archivos en un mismo punto, pero con visualización condicionada por perfil.

## Alertas y reglas de negocio

- `Alertas para Comex`: próximos a embarcar, confirmaciones pendientes, próximos eventos, demoras de producción, arribos críticos y vencimientos.
- `Próximos eventos`: incorporar lógica temporal visible en dashboards y notificaciones, no solo estados estáticos.

## Ajustes de propuesta y escalabilidad

- `Capacidad operativa`: corregir la propuesta base considerando que pueden existir `20 embarques mensuales` pero `100 activos simultáneos`.
- `Escalabilidad de listas`: la solución debe pensar en volumen, filtros compuestos, paginado y vistas resumidas para no colapsar grillas.

## Relación entre faltantes y áreas funcionales

- `Órdenes de Compra`: ~~carga masiva de artículos asociada a carpeta~~, enriquecimiento de atributos de OC y validación documental automática contra la orden.
- `Artículos y saldos`: saldos por artículo, despliegue inline en grilla, paginado y cierre lógico de saldo cero.
- `Embarques y subcarpetas`: carpeta madre y aperturas al mismo nivel visual; soporte fuerte para embarques compuestos.
- `Producción y pre-embarque`: alertas, seguimiento de producción, confirmaciones pendientes y próximos embarques.
- `Documentación`: clasificación documental, visibilidad por rol y validación documental automática.
- `Tránsito y arribos`: arrivals con orden dinámico, mayores filtros y foco comercial como entrada principal.
- `Despacho aduanero`: más atributos en grilla y detalle para despacho, canal y eventos aduaneros.
- `Recepción en depósito`: UME y UM en depósito.
- `Costeo y SAP`: coeficiente por apertura/subcarpeta y mejora del flujo SAP por instancia.
- `Pagos y finanzas`: solapa Pagos, calendario de vencimientos, pagos reales y mayor visibilidad financiera.
- `Reportes y consulta`: grillas más ricas, vistas por rol y reportes más accionables.
- `Seguridad y perfiles`: ~~multirol por usuario~~, permisos editables por rol y endurecimiento de reglas multirol.
- `Validación automática`: comparación automática `confirmación vs OC` y `factura vs confirmación`, con gestión de diferencias.