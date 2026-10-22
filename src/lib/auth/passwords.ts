import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const PARAMETROS = { N: 16384, r: 8, p: 1, largo: 64 } as const;

function derivar(
  password: string,
  salt: Buffer,
  largo: number,
  N: number,
  r: number,
  p: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      largo,
      { N, r, p, maxmem: 64 * 1024 * 1024 },
      (error, resultado) => {
        if (error) reject(error);
        else resolve(resultado);
      },
    );
  });
}

/** Formato guardado: scrypt$N$r$p$salt_base64$hash_base64 */
export async function hashearPassword(password: string): Promise<string> {
  const { N, r, p, largo } = PARAMETROS;
  const salt = randomBytes(16);
  const hash = await derivar(password, salt, largo, N, r, p);
  return ["scrypt", N, r, p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verificarPassword(
  password: string,
  guardado: string,
): Promise<boolean> {
  const partes = guardado.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, n, r, p, saltBase64, hashBase64] = partes;
  const salt = Buffer.from(saltBase64, "base64");
  const esperado = Buffer.from(hashBase64, "base64");

  const actual = await derivar(password, salt, esperado.length, Number(n), Number(r), Number(p));
  return timingSafeEqual(actual, esperado);
}
