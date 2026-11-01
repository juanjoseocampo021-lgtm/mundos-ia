// imagen.js: consulta al modelo de imágenes (Cloudflare FLUX.1-schnell) y devuelve los bytes

async function generarImagen(descripcion) {
  const apiKey = process.env.IMAGEN_API_KEY;
  const url = process.env.IMAGEN_URL;

  if (!apiKey || !url) {
    throw new Error('Faltan IMAGEN_API_KEY o IMAGEN_URL en tu archivo .env.');
  }

  // paso 3: enviar la descripción al modelo de imágenes (máximo 2048 caracteres)
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt: descripcion, steps: 4 }),
    signal: AbortSignal.timeout(60000),
  });

  if (!respuesta.ok) {
    const error = new Error(`El servicio de imágenes respondió con estado ${respuesta.status}`);
    error.status = respuesta.status;
    error.retryAfter = respuesta.headers.get('retry-after');
    throw error;
  }

  const datos = await respuesta.json();
  const base64 = datos?.result?.image;

  if (typeof base64 !== 'string' || base64 === '') {
    throw new Error('La respuesta del servicio de imágenes no trae ninguna imagen.');
  }

  // La imagen llega como texto base64: se convierte a bytes con Buffer.from
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.length === 0) {
    throw new Error('La imagen recibida está vacía.');
  }

  return bytes;
}

module.exports = { generarImagen };