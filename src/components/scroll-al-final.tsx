"use client";

import { useEffect } from "react";

/**
 * Lleva la página al final al terminar de montarse.
 * Respeta `prefers-reduced-motion`: en ese caso salta sin animación.
 */
export function ScrollAlFinal() {
  useEffect(() => {
    let timeoutId: number | undefined;

    // Se espera un frame + un instante para que las imágenes del bloque
    // de la institución ya tengan su altura definitiva.
    const frame = requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        const sinMovimiento = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: sinMovimiento ? "auto" : "smooth",
        });
      }, 120);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
