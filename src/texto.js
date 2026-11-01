// texto.js: consulta al modelo de lenguaje (fetch) y devuelve la descripción de la imagen

const LIMITE_CARACTERES = 1500;

// Mensaje de sistema: le dice al modelo cómo debe responder
const MENSAJE_SISTEMA =
  'You are an art director who writes prompts for an image generation model. ' +
  'You will receive a JSON object with a situation, a world and five colors. ' +
  'Write ONE single paragraph in English, between 80 and 120 words, that describes an image ' +
  'of that imaginary world. Describe the scene, the main elements, the lighting, the composition ' +
  'and the artistic style. It must be the description of a picture, not a story. ' +
  'Mention all five colors (translate them to English). ' +
  'Do not use titles, markdown or lists, and do not include any written text inside the image. ' +
  'Reply only with the paragraph.';

async function describirMundo(mundo) {
  const apiKey = process.env.TEXTO_API_KEY;
  const url = process.env.TEXTO_URL;
  const modelo = process.env.TEXTO_MODELO;

  if (!apiKey || !url || !modelo) {
    throw new Error('Faltan TEXTO_API_KEY, TEXTO_URL o TEXTO_MODELO en tu archivo .env.');
  }

  // paso 2: enviar el contenido del JSON al modelo de texto
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelo,
      messages: [
        { role: 'system', content: MENSAJE_SISTEMA },
        { role: 'user', content: JSON.stringify(mundo) },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });

  // Si el servicio respondió con error, lo lanzamos con el estado (nunca con la clave)
  if (!respuesta.ok) {
    const error = new Error(`El servicio de texto respondió con estado ${respuesta.status}`);
    error.status = respuesta.status;
    error.retryAfter = respuesta.headers.get('retry-after');
    throw error;
  }

  const datos = await respuesta.json();
  let descripcion = datos?.choices?.[0]?.message?.content;

  // Validar que la respuesta no venga vacía
  if (typeof descripcion !== 'string' || descripcion.trim() === '') {
    throw new Error('El modelo de texto devolvió una respuesta vacía.');
  }

  // Dejarla en un solo párrafo y recortarla si es muy larga
  descripcion = descripcion.replace(/\s+/g, ' ').trim();
  let recortada = false;
  if (descripcion.length > LIMITE_CARACTERES) {
    descripcion = descripcion.slice(0, LIMITE_CARACTERES);
    recortada = true;
  }

  return { descripcion, recortada };
}

module.exports = { describirMundo };
