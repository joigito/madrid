import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

const FONDO = [15, 23, 42];
const LETRA = [248, 250, 252];

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    c = TABLA_CRC[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, datos) {
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

function pngRGBA(ancho, alto, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const filas = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    const origen = y * ancho * 4;
    const destino = y * (ancho * 4 + 1);
    rgba.copy(filas, destino + 1, origen, origen + ancho * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(filas, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function distanciaSegmento(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(
    0,
    Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)),
  );
  return Math.hypot(pax - bax * h, pay - bay * h);
}

function trazosM(escala) {
  const v = [
    [-0.24, -0.26, -0.24, 0.26],
    [-0.24, -0.26, 0, 0.05],
    [0, 0.05, 0.24, -0.26],
    [0.24, -0.26, 0.24, 0.26],
  ];
  return v.map(([ax, ay, bx, by]) => [
    ax * escala,
    ay * escala,
    bx * escala,
    by * escala,
  ]);
}

function generarIcono(tamano, escalaLetra = 1) {
  const px = Buffer.alloc(tamano * tamano * 4);
  const mitad = tamano / 2;
  const segmentos = trazosM(tamano * escalaLetra);
  const grosor = 0.055 * tamano * escalaLetra;

  for (let y = 0; y < tamano; y++) {
    for (let x = 0; x < tamano; x++) {
      const cx = x + 0.5 - mitad;
      const cy = y + 0.5 - mitad;
      let dist = Infinity;
      for (const [ax, ay, bx, by] of segmentos) {
        dist = Math.min(dist, distanciaSegmento(cx, cy, ax, ay, bx, by));
      }
      const tinta = Math.max(0, Math.min(1, grosor - dist + 0.5));
      const i = (y * tamano + x) * 4;
      for (let c = 0; c < 3; c++) {
        px[i + c] = Math.round(
          FONDO[c] + (LETRA[c] - FONDO[c]) * tinta,
        );
      }
      px[i + 3] = 255;
    }
  }
  return pngRGBA(tamano, tamano, px);
}

const salida = join(process.cwd(), "public");
const tamanos = [
  ["icon-192x192.png", 192, 1],
  ["icon-512x512.png", 512, 1],
  ["icon-maskable-512x512.png", 512, 0.7],
  ["apple-touch-icon.png", 180, 1],
];

for (const [nombre, tamano, escala] of tamanos) {
  writeFileSync(join(salida, nombre), generarIcono(tamano, escala));
  console.log(`ok ${nombre} (${tamano}x${tamano})`);
}
