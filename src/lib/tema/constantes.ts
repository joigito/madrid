export const COOKIE_TEMA = "tema";
export type Tema = "claro" | "oscuro";

export const COOKIE_TAMANO = "tamano";
export type Tamano = "normal" | "grande" | "muy-grande";
export const TAMANOS: Tamano[] = ["normal", "grande", "muy-grande"];
export const ETIQUETA_TAMANO: Record<Tamano, string> = {
  normal: "A",
  grande: "A+",
  "muy-grande": "A++",
};
export const ESCALA_TAMANO: Record<Tamano, string> = {
  normal: "100%",
  grande: "112.5%",
  "muy-grande": "125%",
};
