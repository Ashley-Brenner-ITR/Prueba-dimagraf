export type Role = 'operator' | 'director' | 'commercial' | 'treasury' | 'warehouse' | 'admin' | 'dispatcher';
export type DespachoTipo = 'Despacho Directo' | 'ZFI' | 'ZFE';
export type CanalAduana = 'Verde' | 'Rojo' | 'Pendiente';
export type MedioTransporte = 'Marítimo' | 'Terrestre' | 'Aéreo';
export type TipoDocumento = 'Factura Comercial' | 'Bill of Lading / CRT' | 'Packing List' | 'Certificado de Origen';
export type TipoIncidencia = 'Faltante de Producto' | 'Mercadería Dañada / Rota' | 'Error de SKU / Producto Equivocado';
export type EstadoCarpeta = 'Activa' | 'En Tránsito' | 'En Aduana' | 'Oficializado' | 'Cerrada' | 'Con Incidencia';
export type TipoPago = 'Factura Proveedor Exterior' | 'Flete Internacional / Forwarder' | 'Impuestos AFIP / VEP' | 'Gastos de Terminal Portuaria';

export interface Proveedor {
  id: string;
  nombre: string;
  pais: string;
  incoterm: string;
  condPago: string;
  diasProd: number;
  diasTransito: number;
  diasTransitoTerrestre: number;
  despachante: string;
  moneda: 'USD' | 'EUR';
}

export interface Despachante {
  id: string;
  nombre: string;
  saldoFavor: number;
}

export interface Articulo {
  id: string;
  codigoSAP: string;
  descripcion: string;
  linea: string;
  cantidadSolicitada: number;
  um: string;
  ume?: string;
  equivalencia?: number;
  precioUnitario: number;
  cantidadAsignada: number;
  origenCarga?: 'Manual' | 'Carga masiva';
  estadoValidacion?: 'Válido' | 'Con advertencia' | 'Con error' | 'Duplicado';
  observacionesImportacion?: string;
  loteImportacion?: string;
}

export interface Documento {
  id: string;
  nombre: string;
  tipo: TipoDocumento;
  tamano: string;
  fecha: string;
}

export interface Incidencia {
  id: string;
  tipo: TipoIncidencia;
  cantidadAfectada: number;
  comentario: string;
  fecha: string;
  resuelta: boolean;
}

export interface ArticuloEmbarque {
  articuloId: string;
  cantidad: number;
}

export interface Subcarpeta {
  id: string;
  numero: string;
  facturaNum: string;
  fechaFactura: string;
  importeTotal: number;
  pesoNeto: number;
  pesoBruto: number;
  ume: number;
  umeUnidad: string;
  transporte: MedioTransporte;
  buqueForwarder: string;
  blCrtAwb: string;
  contenedores: number;
  despachante: string;
  estado: string;
  canalAduana: CanalAduana;
  duaNum: string;
  eta: string;
  fechaEmbarqueReal: string;
  documentos: Documento[];
  articulosEmbarque: ArticuloEmbarque[];
  incidencias: Incidencia[];
  pedidoSAP55: string;
  ingresoSAP18: string;
  // Despachante fields
  gastosARS?: number;
  vepUSD?: number;
  fechaOficializacion?: string;
  fechaSalidaPuerto?: string;
  despachoTipo?: DespachoTipo;
}

export interface Carpeta {
  id: string;
  numero: string;
  fechaOC: string;
  proveedorId: string;
  pedidoSAP45: string;
  montoTotal: number;
  moneda: 'USD' | 'EUR';
  estado: EstadoCarpeta;
  incoterm: string;
  condPago: string;
  referenciaProveedor: string;
  controlConforme: boolean;
  observaciones: string;
  fechaEmbarqueEst: string;
  coeficienteEst: number;
  coeficienteReal: number | null;
  vep: number;
  gastosTerminal: number;
  honorariosDespachante: number;
  articulos: Articulo[];
  subcarpetas: Subcarpeta[];
  ultimoHito: string;
  lastUpdate: string;
}

export interface ObligacionPago {
  id: string;
  carpetaNumero: string;
  subcarpetaNumero: string;
  proveedor: string;
  vencimiento: string;
  tipo: TipoPago;
  moneda: string;
  importe: number;
  importeARS: number;
  estado: 'Pendiente de Pago' | 'Transferencia Emitida';
  referenciaTransferencia: string;
}

export const DESPACHANTES: Despachante[] = [
  { id: 'd1', nombre: 'Romero & Asoc.', saldoFavor: 125000 },
  { id: 'd2', nombre: 'Giménez Comex SRL', saldoFavor: 0 },
  { id: 'd3', nombre: 'Ratto & Partners', saldoFavor: 48500 },
];

export const PROVEEDORES: Proveedor[] = [
  { id: 'p1', nombre: 'Europacel Ibérica S.A.', pais: 'Bélgica', incoterm: 'CIF', condPago: '60 días desde BL', diasProd: 45, diasTransito: 28, diasTransitoTerrestre: 0, despachante: 'd1', moneda: 'EUR' },
  { id: 'p2', nombre: 'Nordic Etiquetas OY', pais: 'Finlandia', incoterm: 'FOB', condPago: '90 días desde BL', diasProd: 30, diasTransito: 35, diasTransitoTerrestre: 0, despachante: 'd2', moneda: 'EUR' },
  { id: 'p3', nombre: 'Rheinland Film GmbH', pais: 'Alemania', incoterm: 'CIF', condPago: '60 días desde BL', diasProd: 60, diasTransito: 32, diasTransitoTerrestre: 0, despachante: 'd1', moneda: 'EUR' },
  { id: 'p4', nombre: 'Meridional Etichette S.r.l.', pais: 'Italia', incoterm: 'CIF', condPago: '45 días desde BL', diasProd: 35, diasTransito: 30, diasTransitoTerrestre: 0, despachante: 'd3', moneda: 'EUR' },
  { id: 'p5', nombre: 'Andino Insumos S.A.', pais: 'Chile', incoterm: 'DAP', condPago: '30 días desde CRT', diasProd: 15, diasTransito: 0, diasTransitoTerrestre: 5, despachante: 'd2', moneda: 'USD' },
];

export const CARPETAS: Carpeta[] = [
  {
    id: 'c1',
    numero: '2026/437',
    fechaOC: '2026-02-10',
    proveedorId: 'p1',
    pedidoSAP45: '4500012847',
    montoTotal: 142500,
    moneda: 'EUR',
    estado: 'En Aduana',
    incoterm: 'CIF',
    condPago: '60 días desde BL',
    referenciaProveedor: 'EPI-2026-DGF-ARG-437',
    controlConforme: true,
    observaciones: '',
    fechaEmbarqueEst: '2026-03-27',
    coeficienteEst: 1.85,
    coeficienteReal: 1.92,
    vep: 1250000,
    gastosTerminal: 85000,
    honorariosDespachante: 45000,
    ultimoHito: 'DUA presentada — Canal Asignado: VERDE',
    lastUpdate: '2026-05-22',
    articulos: [
      { id: 'a1', codigoSAP: '1000234', descripcion: 'Papel Estucado Brillante 115g/m2', linea: 'LCA', cantidadSolicitada: 50000, um: 'Kg', precioUnitario: 1.42, cantidadAsignada: 50000 },
      { id: 'a2', codigoSAP: '1000235', descripcion: 'Papel Estucado Mate 130g/m2', linea: 'LCA', cantidadSolicitada: 30000, um: 'Kg', precioUnitario: 1.58, cantidadAsignada: 30000 },
      { id: 'a3', codigoSAP: '1000287', descripcion: 'Papel Offset 80g A4', linea: 'LDA', cantidadSolicitada: 20000, um: 'Kg', precioUnitario: 0.98, cantidadAsignada: 20000 },
    ],
    subcarpetas: [
      {
        id: 's1',
        numero: '2026/437-A',
        facturaNum: 'INV-2026-4831',
        fechaFactura: '2026-03-25',
        importeTotal: 85500,
        pesoNeto: 47200,
        pesoBruto: 49100,
        ume: 47200,
        umeUnidad: 'Kg',
        transporte: 'Marítimo',
        buqueForwarder: 'MSC AURORA',
        blCrtAwb: 'MSCUBU1234567',
        contenedores: 2,
        despachante: 'd1',
        estado: 'En Aduana',
        canalAduana: 'Verde',
        duaNum: '26001-CUSBA-2026-124753',
        eta: '2026-06-02',
        fechaEmbarqueReal: '2026-04-01',
        pedidoSAP55: '5500009321',
        ingresoSAP18: '',
        documentos: [
          { id: 'doc1', nombre: 'INV-2026-4831.pdf', tipo: 'Factura Comercial', tamano: '1.2 MB', fecha: '2026-03-25' },
          { id: 'doc2', nombre: 'BL_MSCUBU1234567.pdf', tipo: 'Bill of Lading / CRT', tamano: '0.8 MB', fecha: '2026-04-01' },
          { id: 'doc3', nombre: 'PackingList_4831.pdf', tipo: 'Packing List', tamano: '0.5 MB', fecha: '2026-03-25' },
          { id: 'doc4', nombre: 'CertOrigen_UE_4831.pdf', tipo: 'Certificado de Origen', tamano: '0.4 MB', fecha: '2026-03-20' },
        ],
        articulosEmbarque: [
          { articuloId: 'a1', cantidad: 50000 },
          { articuloId: 'a2', cantidad: 30000 },
        ],
        incidencias: [],
      },
      {
        id: 's2',
        numero: '2026/437-B',
        facturaNum: 'INV-2026-4892',
        fechaFactura: '2026-04-08',
        importeTotal: 33500,
        pesoNeto: 12100,
        pesoBruto: 13200,
        ume: 12100,
        umeUnidad: 'Kg',
        transporte: 'Marítimo',
        buqueForwarder: 'CMA CGM NERVAL',
        blCrtAwb: 'CMDUARG0192847',
        contenedores: 1,
        despachante: 'd1',
        estado: 'En Tránsito',
        canalAduana: 'Pendiente',
        duaNum: '',
        eta: '2026-06-15',
        fechaEmbarqueReal: '2026-04-18',
        pedidoSAP55: '',
        ingresoSAP18: '',
        documentos: [
          { id: 'doc5', nombre: 'INV-2026-4892.pdf', tipo: 'Factura Comercial', tamano: '1.1 MB', fecha: '2026-04-08' },
          { id: 'doc6', nombre: 'BL_CMDUARG0192847.pdf', tipo: 'Bill of Lading / CRT', tamano: '0.9 MB', fecha: '2026-04-18' },
        ],
        articulosEmbarque: [
          { articuloId: 'a3', cantidad: 12000 },
        ],
        incidencias: [],
      },
      {
        id: 's9',
        numero: '2026/437-C',
        facturaNum: 'INV-2026-4978',
        fechaFactura: '2026-04-22',
        importeTotal: 23500,
        pesoNeto: 8000,
        pesoBruto: 8600,
        ume: 8000,
        umeUnidad: 'Kg',
        transporte: 'Aéreo',
        buqueForwarder: 'LATAM CARGO 771',
        blCrtAwb: 'LAAR7719045632',
        contenedores: 0,
        despachante: 'd1',
        estado: 'En Tránsito',
        canalAduana: 'Pendiente',
        duaNum: '',
        eta: '2026-06-20',
        fechaEmbarqueReal: '2026-04-24',
        pedidoSAP55: '',
        ingresoSAP18: '',
        documentos: [
          { id: 'doc7', nombre: 'INV-2026-4978.pdf', tipo: 'Factura Comercial', tamano: '0.9 MB', fecha: '2026-04-22' },
          { id: 'doc8', nombre: 'AWB_LAAR7719045632.pdf', tipo: 'Bill of Lading / CRT', tamano: '0.6 MB', fecha: '2026-04-24' },
        ],
        articulosEmbarque: [
          { articuloId: 'a3', cantidad: 8000 },
        ],
        incidencias: [],
      },
    ],
  },
  {
    id: 'c2',
    numero: '2026/441',
    fechaOC: '2026-02-24',
    proveedorId: 'p2',
    pedidoSAP45: '4500013102',
    montoTotal: 98300,
    moneda: 'EUR',
    estado: 'En Aduana',
    incoterm: 'FOB',
    condPago: '90 días desde BL',
    referenciaProveedor: 'NEO-26-DGF-0441',
    controlConforme: true,
    observaciones: 'Desvío en gramaje del vinilo Lote #2240. Se solicitó reposición parcial al proveedor.',
    fechaEmbarqueEst: '2026-03-26',
    coeficienteEst: 1.78,
    coeficienteReal: null,
    vep: 980000,
    gastosTerminal: 72000,
    honorariosDespachante: 45000,
    ultimoHito: 'DUA en canal ROJO — Inspección física programada',
    lastUpdate: '2026-05-26',
    articulos: [
      { id: 'a4', codigoSAP: '2000115', descripcion: 'Vinilo Autoadhesivo Blanco Mate 80µm', linea: 'LCA', cantidadSolicitada: 15000, um: 'M2', precioUnitario: 3.20, cantidadAsignada: 15000 },
      { id: 'a5', codigoSAP: '2000118', descripcion: 'Vinilo Transparente Gloss 100µm', linea: 'LCA', cantidadSolicitada: 8000, um: 'M2', precioUnitario: 4.10, cantidadAsignada: 8000 },
    ],
    subcarpetas: [
      {
        id: 's3',
        numero: '2026/441-A',
        facturaNum: 'UPM-INV-26-0887',
        fechaFactura: '2026-03-22',
        importeTotal: 98300,
        pesoNeto: 8650,
        pesoBruto: 9200,
        ume: 23000,
        umeUnidad: 'M2',
        transporte: 'Marítimo',
        buqueForwarder: 'MAERSK STOCKHOLM',
        blCrtAwb: 'MAEU7483920165',
        contenedores: 1,
        despachante: 'd2',
        estado: 'En Aduana',
        canalAduana: 'Rojo',
        duaNum: '26001-CUSBA-2026-127891',
        eta: '2026-06-05',
        fechaEmbarqueReal: '2026-03-28',
        pedidoSAP55: '5500009654',
        ingresoSAP18: '',
        documentos: [
          { id: 'doc7', nombre: 'UPM-INV-26-0887.pdf', tipo: 'Factura Comercial', tamano: '1.4 MB', fecha: '2026-03-22' },
          { id: 'doc8', nombre: 'BL_MAEU7483920165.pdf', tipo: 'Bill of Lading / CRT', tamano: '0.7 MB', fecha: '2026-03-28' },
          { id: 'doc9', nombre: 'PackingList_UPM_0887.pdf', tipo: 'Packing List', tamano: '0.6 MB', fecha: '2026-03-22' },
        ],
        articulosEmbarque: [
          { articuloId: 'a4', cantidad: 15000 },
          { articuloId: 'a5', cantidad: 8000 },
        ],
        incidencias: [],
      },
    ],
  },
  {
    id: 'c3',
    numero: '2026/449',
    fechaOC: '2026-03-15',
    proveedorId: 'p3',
    pedidoSAP45: '4500013445',
    montoTotal: 62000,
    moneda: 'EUR',
    estado: 'Activa',
    incoterm: 'CIF',
    condPago: '60 días desde BL',
    referenciaProveedor: 'RFG-2026-DGF-449',
    controlConforme: false,
    observaciones: 'Esperando confirmación de producción. Fecha de embarque postergada 10 días por el proveedor.',
    fechaEmbarqueEst: '2026-05-14',
    coeficienteEst: 1.82,
    coeficienteReal: null,
    vep: 0,
    gastosTerminal: 0,
    honorariosDespachante: 0,
    ultimoHito: 'Producción en origen — Retraso confirmado +10 días',
    lastUpdate: '2026-05-20',
    articulos: [
      { id: 'a6', codigoSAP: '3000021', descripcion: 'Film Polyéster Metalizado 12µm', linea: 'LDA', cantidadSolicitada: 12000, um: 'M2', precioUnitario: 2.85, cantidadAsignada: 0 },
      { id: 'a7', codigoSAP: '3000028', descripcion: 'Laminado BOPP Mate 20µm', linea: 'LDA', cantidadSolicitada: 25000, um: 'M2', precioUnitario: 1.42, cantidadAsignada: 0 },
    ],
    subcarpetas: [],
  },
  {
    id: 'c4',
    numero: '2026/452',
    fechaOC: '2026-03-28',
    proveedorId: 'p4',
    pedidoSAP45: '4500013701',
    montoTotal: 47800,
    moneda: 'EUR',
    estado: 'En Tránsito',
    incoterm: 'CIF',
    condPago: '45 días desde BL',
    referenciaProveedor: 'MES-2026-0452-DGF',
    controlConforme: true,
    observaciones: '',
    fechaEmbarqueEst: '2026-04-30',
    coeficienteEst: 1.79,
    coeficienteReal: null,
    vep: 0,
    gastosTerminal: 0,
    honorariosDespachante: 0,
    ultimoHito: 'En alta mar — ETA Bs.As. 10-Jun-2026',
    lastUpdate: '2026-05-24',
    articulos: [
      { id: 'a8', codigoSAP: '4000055', descripcion: 'Etiqueta No Label Look 80g', linea: 'LCA', cantidadSolicitada: 18000, um: 'M2', precioUnitario: 1.65, cantidadAsignada: 18000 },
      { id: 'a9', codigoSAP: '4000059', descripcion: 'Etiqueta Resistente al Agua 100g', linea: 'LCA', cantidadSolicitada: 10000, um: 'M2', precioUnitario: 1.83, cantidadAsignada: 10000 },
    ],
    subcarpetas: [
      {
        id: 's4',
        numero: '2026/452-A',
        facturaNum: 'ARC-2026-0199',
        fechaFactura: '2026-04-28',
        importeTotal: 47800,
        pesoNeto: 11200,
        pesoBruto: 12100,
        ume: 28000,
        umeUnidad: 'M2',
        transporte: 'Marítimo',
        buqueForwarder: 'MSC MARGRIT',
        blCrtAwb: 'MSCUBU4821937',
        contenedores: 1,
        despachante: 'd3',
        estado: 'En Tránsito',
        canalAduana: 'Pendiente',
        duaNum: '',
        eta: '2026-06-10',
        fechaEmbarqueReal: '2026-05-02',
        pedidoSAP55: '',
        ingresoSAP18: '',
        documentos: [
          { id: 'doc10', nombre: 'ARC-2026-0199.pdf', tipo: 'Factura Comercial', tamano: '1.0 MB', fecha: '2026-04-28' },
          { id: 'doc11', nombre: 'BL_MSCUBU4821937.pdf', tipo: 'Bill of Lading / CRT', tamano: '0.8 MB', fecha: '2026-05-02' },
          { id: 'doc12', nombre: 'PackingList_ARC_0199.pdf', tipo: 'Packing List', tamano: '0.5 MB', fecha: '2026-04-28' },
          { id: 'doc13', nombre: 'CertOrigen_IT_0199.pdf', tipo: 'Certificado de Origen', tamano: '0.3 MB', fecha: '2026-04-25' },
        ],
        articulosEmbarque: [
          { articuloId: 'a8', cantidad: 18000 },
          { articuloId: 'a9', cantidad: 10000 },
        ],
        incidencias: [],
      },
    ],
  },
  {
    id: 'c5',
    numero: '2026/461',
    fechaOC: '2026-04-20',
    proveedorId: 'p5',
    pedidoSAP45: '4500014112',
    montoTotal: 18500,
    moneda: 'USD',
    estado: 'Con Incidencia',
    incoterm: 'DAP',
    condPago: '30 días desde CRT',
    referenciaProveedor: 'AIN-CH-2026-0461',
    controlConforme: true,
    observaciones: 'Recepción con faltante de 120 rollos. Reclamo abierto con proveedor. Seguro notificado.',
    fechaEmbarqueEst: '2026-05-05',
    coeficienteEst: 1.45,
    coeficienteReal: null,
    vep: 0,
    gastosTerminal: 0,
    honorariosDespachante: 21000,
    ultimoHito: 'INCIDENCIA — Faltante 120 Rollos. Pendiente resolución.',
    lastUpdate: '2026-05-27',
    articulos: [
      { id: 'a10', codigoSAP: '5000088', descripcion: 'Film Bopp Transparente para Laminación', linea: 'LDA', cantidadSolicitada: 8000, um: 'Rollos', precioUnitario: 2.05, cantidadAsignada: 8000 },
    ],
    subcarpetas: [
      {
        id: 's5',
        numero: '2026/461-A',
        facturaNum: 'IMA-INV-2026-0341',
        fechaFactura: '2026-05-02',
        importeTotal: 18500,
        pesoNeto: 6200,
        pesoBruto: 6800,
        ume: 8000,
        umeUnidad: 'Rollos',
        transporte: 'Terrestre',
        buqueForwarder: 'Trans Andino Cargo S.A.',
        blCrtAwb: 'CRT-TAC-2026-0892',
        contenedores: 3,
        despachante: 'd2',
        estado: 'Recibida con Incidencia',
        canalAduana: 'Verde',
        duaNum: '26001-PASO-2026-009821',
        eta: '2026-05-12',
        fechaEmbarqueReal: '2026-05-07',
        pedidoSAP55: '5500010012',
        ingresoSAP18: 'PEND-RECLAMO',
        documentos: [
          { id: 'doc14', nombre: 'IMA-INV-2026-0341.pdf', tipo: 'Factura Comercial', tamano: '0.9 MB', fecha: '2026-05-02' },
          { id: 'doc15', nombre: 'CRT-TAC-2026-0892.pdf', tipo: 'Bill of Lading / CRT', tamano: '0.6 MB', fecha: '2026-05-07' },
        ],
        articulosEmbarque: [
          { articuloId: 'a10', cantidad: 8000 },
        ],
        incidencias: [
          { id: 'inc1', tipo: 'Faltante de Producto', cantidadAfectada: 120, comentario: 'Camión llegó con sello roto. 3 pallets abiertos, 120 rollos faltantes.', fecha: '2026-05-12', resuelta: false },
        ],
      },
    ],
  },
  {
    id: 'c6',
    numero: '2026/428',
    fechaOC: '2026-01-18',
    proveedorId: 'p1',
    pedidoSAP45: '4500012301',
    montoTotal: 115000,
    moneda: 'EUR',
    estado: 'Cerrada',
    incoterm: 'CIF',
    condPago: '60 días desde BL',
    referenciaProveedor: 'EPI-2026-DGF-ARG-428',
    controlConforme: true,
    observaciones: '',
    fechaEmbarqueEst: '2026-03-04',
    coeficienteEst: 1.85,
    coeficienteReal: 1.88,
    vep: 1100000,
    gastosTerminal: 78000,
    honorariosDespachante: 45000,
    ultimoHito: 'Ingreso en Depósito Confirmado — SAP Tx.18: 182600441',
    lastUpdate: '2026-04-30',
    articulos: [
      { id: 'a11', codigoSAP: '1000234', descripcion: 'Papel Estucado Brillante 115g/m2', linea: 'LCA', cantidadSolicitada: 45000, um: 'Kg', precioUnitario: 1.42, cantidadAsignada: 45000 },
      { id: 'a12', codigoSAP: '1000252', descripcion: 'Papel Couché 170g/m2', linea: 'LCA', cantidadSolicitada: 20000, um: 'Kg', precioUnitario: 1.78, cantidadAsignada: 20000 },
    ],
    subcarpetas: [
      {
        id: 's6',
        numero: '2026/428-A',
        facturaNum: 'INV-2026-3901',
        fechaFactura: '2026-03-01',
        importeTotal: 115000,
        pesoNeto: 64800,
        pesoBruto: 67100,
        ume: 65000,
        umeUnidad: 'Kg',
        transporte: 'Marítimo',
        buqueForwarder: 'EVER GOODS',
        blCrtAwb: 'EGLV112600143',
        contenedores: 3,
        despachante: 'd1',
        estado: 'Cerrada',
        canalAduana: 'Verde',
        duaNum: '26001-CUSBA-2026-119823',
        eta: '2026-04-15',
        fechaEmbarqueReal: '2026-03-05',
        pedidoSAP55: '5500008877',
        ingresoSAP18: '182600441',
        documentos: [],
        articulosEmbarque: [
          { articuloId: 'a11', cantidad: 45000 },
          { articuloId: 'a12', cantidad: 20000 },
        ],
        incidencias: [],
      },
    ],
  },
];

const EXTRA_CARPETA_ESTADOS: EstadoCarpeta[] = ['Activa', 'En Tránsito', 'En Aduana', 'Oficializado', 'Cerrada'];
const EXTRA_CARPETA_HITOS = [
  'OC emitida y pendiente de confirmación del proveedor',
  'Producción confirmada en origen',
  'Carga embarcada y en tránsito internacional',
  'Despacho aduanero en gestión documental',
  'Recepción administrativa pendiente de cierre',
];

CARPETAS.push(
  ...Array.from({ length: 15 }, (_, index) => {
    const provider = PROVEEDORES[index % PROVEEDORES.length];
    const estado = EXTRA_CARPETA_ESTADOS[index % EXTRA_CARPETA_ESTADOS.length];
    const sequence = 470 + index;
    const articleId = `a_extra_${index + 1}_1`;
    const canalAduana: CanalAduana = estado === 'En Aduana' ? 'Pendiente' : estado === 'Cerrada' ? 'Verde' : 'Verde';

    return {
      id: `c_extra_${index + 1}`,
      numero: `2026/${sequence}`,
      fechaOC: `2026-05-${String((index % 20) + 1).padStart(2, '0')}`,
      proveedorId: provider.id,
      pedidoSAP45: `4500015${String(200 + index).padStart(3, '0')}`,
      montoTotal: 22000 + index * 3750,
      moneda: provider.moneda,
      estado,
      incoterm: provider.incoterm,
      condPago: provider.condPago,
      referenciaProveedor: `${provider.id.toUpperCase()}-TEST-${sequence}`,
      controlConforme: index % 4 !== 0,
      observaciones: 'Carpeta de prueba generada para validar paginado y ordenamiento.',
      fechaEmbarqueEst: `2026-06-${String((index % 18) + 5).padStart(2, '0')}`,
      coeficienteEst: 1.25 + index * 0.03,
      coeficienteReal: index % 3 === 0 ? 1.32 + index * 0.02 : null,
      vep: 350000 + index * 18000,
      gastosTerminal: 28000 + index * 1400,
      honorariosDespachante: 18000 + index * 900,
      articulos: [
        {
          id: articleId,
          codigoSAP: `90${String(1000 + index).padStart(4, '0')}`,
          descripcion: `Artículo de prueba ${index + 1}`,
          linea: index % 2 === 0 ? 'LCA' : 'LDA',
          cantidadSolicitada: 8000 + index * 450,
          um: 'Kg',
          precioUnitario: 1.1 + index * 0.08,
          cantidadAsignada: 8000 + index * 450,
        },
      ],
      subcarpetas: [
        {
          id: `s_extra_${index + 1}_1`,
          numero: `2026/${sequence}-A`,
          facturaNum: `INV-TEST-${sequence}`,
          fechaFactura: `2026-06-${String((index % 18) + 3).padStart(2, '0')}`,
          importeTotal: 22000 + index * 3750,
          pesoNeto: 7800 + index * 220,
          pesoBruto: 8100 + index * 240,
          ume: 7800 + index * 220,
          umeUnidad: 'Kg',
          transporte: index % 3 === 0 ? 'Marítimo' : index % 3 === 1 ? 'Terrestre' : 'Aéreo',
          buqueForwarder: `Forwarder Test ${index + 1}`,
          blCrtAwb: `BLTEST${sequence}`,
          contenedores: index % 2 === 0 ? 1 : 2,
          despachante: DESPACHANTES[index % DESPACHANTES.length].id,
          estado,
          canalAduana,
          duaNum: `26001-TEST-${sequence}`,
          eta: `2026-07-${String((index % 18) + 8).padStart(2, '0')}`,
          fechaEmbarqueReal: `2026-06-${String((index % 18) + 1).padStart(2, '0')}`,
          documentos: [],
          articulosEmbarque: [{ articuloId: articleId, cantidad: 8000 + index * 450 }],
          incidencias: [],
          pedidoSAP55: `550001${String(100 + index).padStart(3, '0')}`,
          ingresoSAP18: estado === 'Cerrada' ? `18260${String(500 + index).padStart(4, '0')}` : '',
        },
      ],
      ultimoHito: EXTRA_CARPETA_HITOS[index % EXTRA_CARPETA_HITOS.length],
      lastUpdate: `2026-06-${String((index % 20) + 4).padStart(2, '0')}`,
    };
  }),
);

export const OBLIGACIONES_PAGO: ObligacionPago[] = [
  { id: 'op1', carpetaNumero: '2026/437', subcarpetaNumero: '2026/437-A', proveedor: 'Europacel Ibérica S.A.', vencimiento: '2026-06-01', tipo: 'Factura Proveedor Exterior', moneda: 'EUR', importe: 85500, importeARS: 96916500, estado: 'Pendiente de Pago', referenciaTransferencia: '' },
  { id: 'op2', carpetaNumero: '2026/437', subcarpetaNumero: '2026/437-B', proveedor: 'Europacel Ibérica S.A.', vencimiento: '2026-05-30', tipo: 'Factura Proveedor Exterior', moneda: 'USD', importe: 2100, importeARS: 1974000, estado: 'Transferencia Emitida', referenciaTransferencia: 'TRF-20260528-0041' },
  { id: 'op3', carpetaNumero: '2026/437', subcarpetaNumero: '2026/437-C', proveedor: 'Europacel Ibérica S.A.', vencimiento: '2026-06-10', tipo: 'Factura Proveedor Exterior', moneda: 'USD', importe: 1100, importeARS: 1034000, estado: 'Pendiente de Pago', referenciaTransferencia: '' },
  { id: 'op4', carpetaNumero: '2026/441', subcarpetaNumero: '2026/441-A', proveedor: 'Nordic Etiquetas OY', vencimiento: '2026-06-26', tipo: 'Factura Proveedor Exterior', moneda: 'EUR', importe: 98300, importeARS: 111386000, estado: 'Pendiente de Pago', referenciaTransferencia: '' },
  { id: 'op5', carpetaNumero: '2026/441', subcarpetaNumero: '2026/441-B', proveedor: 'Nordic Etiquetas OY', vencimiento: '2026-06-08', tipo: 'Gastos de Terminal Portuaria', moneda: 'USD', importe: 1850, importeARS: 1739000, estado: 'Pendiente de Pago', referenciaTransferencia: '' },
  { id: 'op6', carpetaNumero: '2026/452', subcarpetaNumero: '2026/452-A', proveedor: 'Meridional Etichette S.r.l.', vencimiento: '2026-07-17', tipo: 'Factura Proveedor Exterior', moneda: 'EUR', importe: 47800, importeARS: 54162000, estado: 'Pendiente de Pago', referenciaTransferencia: '' },
  { id: 'op7', carpetaNumero: '2026/461', subcarpetaNumero: '2026/461-A', proveedor: 'Andino Insumos S.A.', vencimiento: '2026-06-11', tipo: 'Factura Proveedor Exterior', moneda: 'USD', importe: 18500, importeARS: 17390000, estado: 'Pendiente de Pago', referenciaTransferencia: '' },
];

export function getProveedor(id: string): Proveedor | undefined {
  return PROVEEDORES.find(p => p.id === id);
}

export function getDespachante(id: string): Despachante | undefined {
  return DESPACHANTES.find(d => d.id === id);
}

export function getEstadoColor(estado: EstadoCarpeta): string {
  const map: Record<EstadoCarpeta, string> = {
    'Activa':        '#1a5c38',
    'En Tránsito':   '#5e5ce6',
    'En Aduana':     '#b45309',
    'Oficializado':  '#1a7a4a',
    'Cerrada':       '#6e6e73',
    'Con Incidencia':'#b84800',
  };
  return map[estado] || '#6e6e73';
}

export function getEstadoBg(estado: EstadoCarpeta): string {
  const map: Record<EstadoCarpeta, string> = {
    'Activa':        'rgba(26,92,56,0.08)',
    'En Tránsito':   'rgba(94,92,230,0.08)',
    'En Aduana':     'rgba(180,83,9,0.08)',
    'Oficializado':  'rgba(26,122,74,0.08)',
    'Cerrada':       'rgba(110,110,115,0.08)',
    'Con Incidencia':'rgba(184,72,0,0.08)',
  };
  return map[estado] || 'rgba(110,110,115,0.08)';
}

// ─── Admin / Notifications / Audit ────────────────────────────────────────

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: Role[];
  designSystemAccess: boolean;
  estado: 'Activo' | 'Inactivo';
  lastLogin: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  role?: Role;
  entityId?: string;
}

export interface ArticuloCatalogo {
  id: string;
  codigoSAP: string;
  descripcion: string;
  linea: string;
  um: string;
  precioRef: number;
  estado: 'Activo' | 'Inactivo';
}

export const ROLE_LABELS: Record<Role, string> = {
  operator:   'Importaciones',
  director:   'Dirección',
  commercial: 'Área Comercial',
  treasury:   'Tesorería',
  warehouse:  'Depósito',
  admin:      'Administrador General',
  dispatcher: 'Despachante',
};

export const USERS: AppUser[] = [
  { id: 'u1', username: 'admin',         password: '', nombre: 'Valentina', apellido: 'Russo',     email: 'vrusso@dimagraf.com',    roles: ['admin'],                            designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-06-03', createdAt: '2025-01-15' },
  { id: 'u2', username: 'importaciones', password: '', nombre: 'Marcos',    apellido: 'Delgado',   email: 'mdelgado@dimagraf.com',  roles: ['operator'],                         designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-06-03', createdAt: '2025-03-01' },
  { id: 'u3', username: 'direccion',     password: '', nombre: 'Carolina',  apellido: 'Vega',      email: 'cvega@dimagraf.com',     roles: ['director'],                         designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-06-02', createdAt: '2025-01-15' },
  { id: 'u4', username: 'comercial',     password: '', nombre: 'Sebastián', apellido: 'Morales',   email: 'smorales@dimagraf.com',  roles: ['commercial'],                       designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-06-01', createdAt: '2025-04-10' },
  { id: 'u5', username: 'tesoreria',     password: '', nombre: 'Patricia',  apellido: 'Ibáñez',    email: 'pibanez@dimagraf.com',   roles: ['treasury'],                         designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-05-30', createdAt: '2025-02-20' },
  { id: 'u6', username: 'deposito',      password: '', nombre: 'Javier',    apellido: 'Ortega',    email: 'jortega@dimagraf.com',   roles: ['warehouse'],                        designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-06-03', createdAt: '2025-06-01' },
  { id: 'u7', username: 'despachante',   password: '', nombre: 'Luciana',   apellido: 'Ferreyra',  email: 'lferreyra@dimagraf.com', roles: ['dispatcher'],                       designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-04-15', createdAt: '2025-05-01' },
  { id: 'u8', username: 'gerencia',      password: '', nombre: 'Paula',     apellido: 'Núñez',     email: 'pnunez@dimagraf.com',    roles: ['director', 'operator'],             designSystemAccess: false, estado: 'Activo',   lastLogin: '2026-06-01', createdAt: '2025-05-12' },
  { id: 'u9', username: 'testing',       password: '', nombre: 'Usuario',   apellido: 'Testing',   email: 'testing@dimagraf.com',   roles: ['admin', 'operator', 'commercial'], designSystemAccess: true,  estado: 'Activo',   lastLogin: '2026-07-13', createdAt: '2026-07-13' },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'al1',  timestamp: '2026-06-03T09:14:22', userId: 'u2', userName: 'Marcos Delgado',    userRole: 'operator',   action: 'Creó embarque parcial',          entity: 'Subcarpeta',     entityId: '2026/461-A', detail: 'Nueva subcarpeta creada en carpeta 2026/461' },
  { id: 'al2',  timestamp: '2026-06-03T08:55:10', userId: 'u2', userName: 'Marcos Delgado',    userRole: 'operator',   action: 'Cambió estado de carpeta',        entity: 'Carpeta',        entityId: '2026/449',   detail: 'Estado: Activa → En Tránsito' },
  { id: 'al3',  timestamp: '2026-06-02T17:30:45', userId: 'u5', userName: 'Patricia Ibáñez',   userRole: 'treasury',   action: 'Marcó transferencia emitida',     entity: 'Pago',           entityId: 'op2',        detail: 'TRF-20260528-0041 · EUR 3.200' },
  { id: 'al4',  timestamp: '2026-06-02T14:05:33', userId: 'u6', userName: 'Javier Ortega',     userRole: 'warehouse',  action: 'Registró incidencia',             entity: 'Subcarpeta',     entityId: '2026/437-A', detail: 'Faltante de Producto · 500 Kg' },
  { id: 'al5',  timestamp: '2026-06-02T11:48:17', userId: 'u2', userName: 'Marcos Delgado',    userRole: 'operator',   action: 'Cargó documento',                 entity: 'Subcarpeta',     entityId: '2026/441-A', detail: 'PackingList_NEO-2026-0311.pdf · 0.7 MB' },
  { id: 'al6',  timestamp: '2026-06-02T09:30:00', userId: 'u3', userName: 'Carolina Vega',     userRole: 'director',   action: 'Visualizó auditoría de costos',   entity: 'Auditoría',      entityId: '',           detail: 'Revisó desvíos en 3 carpetas' },
  { id: 'al7',  timestamp: '2026-06-01T16:10:22', userId: 'u2', userName: 'Marcos Delgado',    userRole: 'operator',   action: 'Creó carpeta',                    entity: 'Carpeta',        entityId: '2026/461',   detail: 'Proveedor: Andino Insumos S.A. · USD 18.500' },
  { id: 'al8',  timestamp: '2026-06-01T13:00:00', userId: 'u4', userName: 'Sebastián Morales', userRole: 'commercial', action: 'Consultó arrivals',               entity: 'Arrivals',       entityId: '',           detail: 'Filtro: LCA · 12 ítems visualizados' },
  { id: 'al9',  timestamp: '2026-05-30T12:31:45', userId: 'u5', userName: 'Patricia Ibáñez',   userRole: 'treasury',   action: 'Cambió horizonte de vista',       entity: 'Flujo de Caja',  entityId: '',           detail: 'Horizonte: 30 días → 7 días' },
  { id: 'al10', timestamp: '2026-05-29T09:15:00', userId: 'u1', userName: 'Valentina Russo',   userRole: 'admin',      action: 'Creó usuario',                    entity: 'Usuario',        entityId: 'u6',         detail: 'Javier Ortega · Rol: Depósito' },
  { id: 'al11', timestamp: '2026-05-28T17:45:00', userId: 'u1', userName: 'Valentina Russo',   userRole: 'admin',      action: 'Modificó proveedor',              entity: 'Proveedor',      entityId: 'p3',         detail: 'Rheinland Film GmbH · días tránsito 30 → 32' },
  { id: 'al12', timestamp: '2026-05-27T10:20:00', userId: 'u2', userName: 'Marcos Delgado',    userRole: 'operator',   action: 'Actualizó coeficiente estimado',  entity: 'Carpeta',        entityId: '2026/452',   detail: 'Coef. Est. 1.72 → 1.78' },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', timestamp: '2026-06-03T09:14:22', type: 'success', title: 'Nuevo embarque parcial',    message: 'Se creó 2026/461-A · Andino Insumos S.A.',              read: false, role: 'operator',   entityId: 'c5' },
  { id: 'n2', timestamp: '2026-06-03T08:55:10', type: 'info',    title: 'Cambio de estado',          message: 'Carpeta 2026/449 pasó a "En Tránsito"',                  read: false, role: 'operator',   entityId: 'c4' },
  { id: 'n3', timestamp: '2026-06-02T17:30:45', type: 'success', title: 'Transferencia emitida',     message: 'TRF-20260528-0041 confirmada · EUR 3.200',               read: false, role: 'treasury'                 },
  { id: 'n4', timestamp: '2026-06-02T14:05:33', type: 'warning', title: 'Incidencia en depósito',   message: 'Faltante 2026/437-A: 500 Kg Papel Estucado',             read: false, role: 'warehouse',  entityId: 'c1' },
  { id: 'n5', timestamp: '2026-06-02T11:48:17', type: 'info',    title: 'Documento cargado',        message: 'PackingList_NEO-2026-0311.pdf → 2026/441-A',             read: true,  role: 'operator',   entityId: 'c2' },
  { id: 'n6', timestamp: '2026-06-01T10:00:00', type: 'success', title: 'Carpeta creada',           message: 'Carpeta 2026/461 abierta · Andino Insumos S.A.',         read: true,  role: 'operator',   entityId: 'c5' },
  { id: 'n7', timestamp: '2026-05-30T08:00:00', type: 'warning', title: 'Vencimiento próximo',      message: 'Pago EUR 85.500 vence el 01/06/2026 (carpeta 2026/437)', read: true,  role: 'treasury'                 },
];

export const ARTICULOS_CATALOGO: ArticuloCatalogo[] = [
  { id: 'ac1', codigoSAP: '1000234', descripcion: 'Papel Estucado Brillante 115g/m2',    linea: 'LCA', um: 'Kg',    precioRef: 1.42,  estado: 'Activo'   },
  { id: 'ac2', codigoSAP: '1000235', descripcion: 'Papel Estucado Mate 130g/m2',         linea: 'LCA', um: 'Kg',    precioRef: 1.58,  estado: 'Activo'   },
  { id: 'ac3', codigoSAP: '1000287', descripcion: 'Papel Offset 80g A4',                 linea: 'LDA', um: 'Kg',    precioRef: 0.98,  estado: 'Activo'   },
  { id: 'ac4', codigoSAP: '1000301', descripcion: 'Etiqueta Adhesiva Térmica 50×30mm',   linea: 'LCA', um: 'Mill.', precioRef: 45.00, estado: 'Activo'   },
  { id: 'ac5', codigoSAP: '1000318', descripcion: 'Film BOPP Transparente 20μm',         linea: 'LDA', um: 'Kg',    precioRef: 2.15,  estado: 'Activo'   },
  { id: 'ac6', codigoSAP: '1000355', descripcion: 'Cartón Duplex 250g/m2',               linea: 'LCA', um: 'Kg',    precioRef: 1.10,  estado: 'Activo'   },
  { id: 'ac7', codigoSAP: '1000388', descripcion: 'Tinta UV Offset Cyan',                linea: 'LDA', um: 'Kg',    precioRef: 18.50, estado: 'Inactivo' },
];
