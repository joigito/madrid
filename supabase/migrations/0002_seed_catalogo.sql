-- Catálogo canónico del ciclo de importación (validado con la experta de dominio).
-- plazo_dias = días desde el inicio de la operación hasta el vencimiento de la etapa.
-- Estos valores son un punto de partida editable: las normativas cambian seguido.

insert into public.catalogo_etapas
  (tipo_operacion, orden, nombre, organismo, url, plazo_dias, descripcion)
values
  ('importacion', 1, 'Pedido al proveedor / negociación', null, null, 5,
   'Solicitud de cotización, proforma y cierre de condiciones comerciales (INCOTERM).'),
  ('importacion', 2, 'Pago / medio de pago', 'BCRA', 'https://www.bcra.gob.ar', 20,
   'Definición del medio de pago y cumplimiento de la normativa cambiaria.'),
  ('importacion', 3, 'Preparación y embarque', null, null, 50,
   'Booking, consolidación, emisión del documento de transporte (BL/AWB) y salida de origen.'),
  ('importacion', 4, 'Arribo y despacho aduanero', 'ARCA', 'https://www.arca.gob.ar', 55,
   'Presentación del despacho y gestión de la destinación de importación.'),
  ('importacion', 5, 'Intervenciones de organismos', 'VUCE', 'https://www.vuce.gob.ar', 65,
   'Autorizaciones y certificaciones previas según la mercadería (SENASA, ANMAT, etc.).'),
  ('importacion', 6, 'Nacionalización / tributos', 'ARCA', 'https://www.arca.gob.ar', 70,
   'Pago de derechos, IVA, tasas e impuestos internos. Libramiento a plaza.'),
  ('importacion', 7, 'Entrega / logística interna', null, null, 77,
   'Traslado de la mercadería al destino final y cierre de la operación.')
on conflict (tipo_operacion, orden) do update
  set nombre = excluded.nombre,
      organismo = excluded.organismo,
      url = excluded.url,
      plazo_dias = excluded.plazo_dias,
      descripcion = excluded.descripcion;
