// index.js: orquesta los pasos 1 a 3
const fs = require('fs');
const path = require('path');
const { crearMundo, guardarMundo, leerMundo, rutaMundo } = require('./mundo');
const { describirMundo } = require('./texto');
const { generarImagen } = require('./imagen');

// Rutas construidas desde la ubicación de este archivo
const RAIZ = path.join(__dirname, '..');
const CARPETA_DESCRIPCIONES = path.join(RAIZ, 'descripciones');
const CARPETA_IMAGENES = path.join(RAIZ, 'imagenes');

// Convierte un error técnico en un mensaje claro en español (sin mostrar claves)
function explicarError(error) {
  if (error.name === 'ValidacionError') return error.message;

  const estado = error.status;
  if (estado === 401 || estado === 403) {
    return 'La API key no es válida. Revisa tu archivo .env.';
  }
  if (estado === 402 || estado === 429) {
    const espera = error.retryAfter ? ` El servicio pide esperar ${error.retryAfter} segundos.` : '';
    return `Superaste el límite gratuito. Espera un momento y vuelve a intentarlo.${espera}`;
  }
  if (estado === 404 || estado === 410) {
    return 'El modelo o la URL no existen. Revisa tu configuración.';
  }
  if (error.name === 'TimeoutError') {
    return 'El servicio tardó demasiado en responder.';
  }
  if (error instanceof TypeError) {
    return 'No se pudo conectar. Revisa tu internet o la URL.';
  }
  return `Ocurrió un problema: ${error.message}`;
}

async function main() {
  let paso = 0;
  try {
    // 0. cargar las variables del archivo .env
    const rutaEnv = path.join(RAIZ, '.env');
    if (!fs.existsSync(rutaEnv)) {
      throw new Error('No existe el archivo .env. Copia .env.example a .env y pon tus claves.');
    }
    process.loadEnvFile(rutaEnv);

    // paso 1: validar argumentos, crear el mundo y guardarlo en data/
    paso = 1;
    const nuevo = crearMundo(process.argv.slice(2));
    const rutaJson = rutaMundo(nuevo.id);
    if (!fs.existsSync(rutaJson)) {
      guardarMundo(nuevo); // si ya existe se conserva el original (con su fecha)
    }
    console.log(`Paso 1: mundo guardado en data/mundo_${nuevo.id}.json`);

    // Se consulta lo guardado en el archivo, no el objeto en memoria
    const mundo = leerMundo(rutaJson);

    // paso 2: descripción con el modelo de texto (si el .txt ya existe, no se llama a la API)
    paso = 2;
    const rutaTxt = path.join(CARPETA_DESCRIPCIONES, `mundo_${mundo.id}.txt`);
    if (fs.existsSync(rutaTxt)) {
      console.log('Paso 2: la descripción ya existía, no se llamó al modelo de texto.');
    } else {
      const resultado = await describirMundo(mundo);
      if (resultado.recortada) {
        console.log('Aviso: la descripción era muy larga y se recortó a 1500 caracteres.');
      }
      fs.mkdirSync(CARPETA_DESCRIPCIONES, { recursive: true });
      fs.writeFileSync(rutaTxt, resultado.descripcion, 'utf-8');
      console.log(`Paso 2: descripción guardada en descripciones/mundo_${mundo.id}.txt`);
    }

    // paso 3: imagen con el modelo de imágenes (si el .jpg ya existe, no se llama a la API)
    paso = 3;
    const rutaImagen = path.join(CARPETA_IMAGENES, `mundo_${mundo.id}.jpg`);
    if (fs.existsSync(rutaImagen)) {
      console.log('Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.');
    } else {
      const descripcion = fs.readFileSync(rutaTxt, 'utf-8'); // se lee desde el .txt
      const bytes = await generarImagen(descripcion);
      fs.mkdirSync(CARPETA_IMAGENES, { recursive: true });
      fs.writeFileSync(rutaImagen, bytes); // bytes tal cual, SIN 'utf-8'
      console.log(`Paso 3: imagen guardada en imagenes/mundo_${mundo.id}.jpg`);
    }

    console.log('Listo. Revisa la carpeta imagenes/');
  } catch (error) {
    const donde = paso > 0 ? `Error en el paso ${paso}: ` : 'Error: ';
    console.error(`${donde}${explicarError(error)}`);
    process.exitCode = 1;
  }
}

main();
