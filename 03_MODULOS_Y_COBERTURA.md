# Módulos del negocio y cobertura actual

Este documento no asume que quien lee ya conoce la estructura funcional del proyecto. En vez de listar módulos como etiquetas técnicas, explica qué se necesita resolver en cada parte del negocio y qué tan cubierto está hoy por el prototipo.

## Lectura rápida

- `Bien cubierto`: embarques y subcarpetas, tránsito y arribos, parte de despacho aduanero, parte de recepción en depósito, parte de pagos y parte de reportería/seguridad.
- `Cobertura parcial`: órdenes de compra, artículos y saldos, documentación, costeo y referencias SAP.
- `Cobertura baja o ausente`: seguimiento de producción y pre-embarque, y validación automática documental visible para el usuario.

## Qué se busca lograr en cada parte del negocio

### Órdenes de Compra

Acá se debería poder iniciar el proceso, crear la carpeta de importación, registrar la información comercial básica de la OC y mantenerla como punto de partida del resto del flujo. Hoy esto está cubierto de forma parcial en `Carpetas (OCs)` y `Nueva Carpeta`: `~~la carga masiva inicial de artículos como faltante base~~` ya quedó resuelta, pero todavía faltan piezas importantes como contrato marco, validaciones previas, referencias operativas más completas y una administración más rica de la OC.

### Artículos y saldos

Acá se debería poder ver qué artículos componen cada OC, cuánto se compra, cuánto llegó, cuánto queda pendiente y cuándo una carpeta puede considerarse cerrada por saldo cero. Hoy existe una base en `Detalle de Carpeta > Artículos`; `~~el saldo básico por asignación a embarques y el cierre automático por saldo cero como faltantes iniciales~~` ya quedaron resueltos, pero todavía no alcanza para seguir equivalencias y control operativo con la profundidad que pide el proceso real.

### Embarques y subcarpetas

Esta parte debería permitir dividir una carpeta madre en aperturas como `A`, `B` o `C`, seguir cada embarque por separado y también contemplar casos donde un mismo despacho mezcle más de una OC. Conceptualmente está bastante bien representado en `Detalle de Carpeta > Embarques` y en `Despachante`, aunque todavía no se ve bien el caso de embarques compuestos.

### Producción y pre-embarque

Acá se debería poder seguir qué prometió el proveedor, si ya confirmó el pedido, cómo avanza la producción, si hay demoras y cuándo una carga está lista para embarcar. Hoy casi no está representado en el prototipo: falta una pantalla clara para seguimiento, alertas y validaciones de esta etapa.

### Documentación de importaciones

Esta parte debería concentrar facturas, packing lists, conocimientos de embarque, certificados y otros anexos, dejando claro qué documento pertenece a cada OC o subembarque y quién puede verlo. Hoy aparece en `Detalle de Carpeta > Anexos / Documentos`, pero más como consulta simple que como un módulo documental completo.

### Tránsito y arribos

Acá se debería poder entender qué está viajando, cuándo llega, qué proveedor está involucrado y cómo evolucionan las fechas de arribo. Es una de las áreas mejor resueltas del prototipo actual, especialmente en `Matriz de Arrivals` y en los estados visibles dentro de `Carpetas`.

### Nacionalización y despacho aduanero

Esta parte debería permitir seguir qué pasa con cada embarque al llegar a aduana: quién es el despachante, qué canal tocó, qué gastos hay, qué VEP corresponde y qué fechas son críticas. La pantalla de `Despachante` cubre bastante de esto, aunque todavía faltan señales operativas del proceso real como OK despachante, OK cruce/carga, pedido de fondos y trazabilidad de intercambios informales.

### Recepción en depósito

Acá se debería poder avisar que llega un embarque, verificar físicamente artículos y cantidades, registrar incidencias y confirmar la recepción. `Recepciones` y `Check-in` resuelven bien la parte operativa, aunque todavía falta reflejar mejor lo que pasa después en SAP y en la administración del proceso.

### Costeo y referencia SAP

Esta parte debería conectar el seguimiento operativo con las referencias manuales de SAP, incluyendo Tx 45, Tx 55, Tx 18 y los coeficientes de costeo. Hoy hay indicios de esa lógica, pero todavía no está claramente expresado que el coeficiente pertenece a la apertura o subcarpeta, no a la carpeta madre.

### Pagos y proyección financiera

Acá se debería poder anticipar vencimientos, organizar pagos, distinguir lo estimado de lo real y dar visibilidad a Tesorería e Importaciones. `Flujo de Caja` ya muestra una base útil, pero todavía no cubre toda la complejidad financiera del proceso actual.

### Reportes y consulta para áreas

Esta capa debería resolver qué necesita ver cada área sin obligarla a entrar en el detalle operativo completo. El prototipo ya ofrece vistas útiles como `Matriz de Arrivals`, `Flujo de Caja`, `Control Gerencial` y `Auditoría Costos`, pero todavía falta representar mejor los reportes concretos que hoy se producen manualmente.

### Seguridad, perfiles y auditoría

Acá se debería poder definir quién entra, qué puede ver, qué puede editar y cómo queda trazado lo que hizo cada usuario. El prototipo ya deja ver perfiles, administración de usuarios y auditoría; `~~la base multirol como faltante estructural~~` ya quedó resuelta, aunque todavía falta la parte más avanzada de configuración documental y reglas por proveedor.

### Validación automática contra OC

Esta capacidad debería ayudar a comparar documentos del proveedor contra la OC cargada, detectar diferencias y pedir confirmación cuando algo no coincide. Hoy no aparece como experiencia visible dentro del prototipo, aunque si forma parte del alcance debería integrarse en los puntos de confirmación, pre-embarque y configuración por proveedor.

## Impacto sobre la arquitectura actual

- La arquitectura actual está más cerca de una solución operativa de seguimiento de carpetas y embarques que de un mapa completo del proceso end-to-end.
- Para alinearse mejor con el proceso real, habría que reforzar especialmente producción/pre-embarque, documentación, costeo/SAP, pagos y validación automática.
- Embarques, arribos, despacho y recepción ya tienen una base útil sobre la que conviene evolucionar, no reemplazar.