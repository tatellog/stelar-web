import type { ZodiacSign } from "./types";

/**
 * Archivo del observatorio — un dato astronómico REAL por constelación.
 * Astronomía, nunca astrología: cifras y fenómenos verificables, en el
 * tono del viaje. Se muestran junto al emblema (capítulo XII).
 */
export const FACTS: Record<ZodiacSign, string> = {
  aries:
    "Hamal, el corazón de tu Aries, es una gigante naranja 15 veces más ancha que el Sol, a 66 años luz de aquí.",
  tauro:
    "Aldebarán, el ojo de tu Tauro, brilla con la luz de 400 soles — y las sondas Pioneer viajan hacia él desde 1972.",
  geminis:
    "Pólux, uno de tus gemelos, tiene un planeta gigante girando a su alrededor: Thestias, dos veces Júpiter.",
  cancer:
    "En el pecho de tu Cáncer vive El Pesebre: un enjambre de más de mil estrellas jóvenes que nacieron juntas.",
  leo: "Regulus, el corazón de tu Leo, gira tan rápido que su día dura 16 horas — y su forma es la de una estrella achatada a punto de despedazarse.",
  virgo:
    "Detrás de tu Virgo se esconde un cúmulo de más de mil galaxias: el vecindario cósmico gigante más cercano al nuestro.",
  libra:
    "Las estrellas de tu Libra aún llevan nombres de pinzas — durante siglos fueron las garras del Escorpión, hasta que Roma les dio balanza propia.",
  escorpio:
    "Antares, el corazón de tu Escorpio, es tan inmensa que puesta en el lugar del Sol se tragaría a Mercurio, Venus, la Tierra y Marte.",
  sagitario:
    "La flecha de tu Sagitario apunta al centro exacto de la Vía Láctea: un agujero negro de 4 millones de soles.",
  capricornio:
    "Tu Capricornio es de las constelaciones más antiguas que la humanidad registró: los babilonios ya la dibujaban hace 3,000 años.",
  acuario:
    "En tu Acuario flota la Nebulosa de la Hélice — el ojo dorado que dejó una estrella al morir, a 650 años luz.",
  piscis:
    "Tus dos peces están atados por Alrescha, «la cuerda»: un nudo real de dos estrellas que giran una alrededor de la otra.",
};
