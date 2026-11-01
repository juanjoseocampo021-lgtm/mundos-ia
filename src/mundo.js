// mundo.js: valida los argumentos, crea el objeto del mundo y lo guarda/lee (JSON)
const fs = require('fs');
const path = require('path');
const objectHash = require('object-hash');

// Ruta de data/ construida desde la ubicación de este archivo (no desde donde se ejecuta)
const CARPETA_DATA = path.join(__dirname, '..', 'data');

const USO =
  'Uso: npm start -- "<situación>" "<mundo>" <color1> <color2> <color3> <color4> <color5>\n' +
  'Ejemplo: npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" ' +
  '"Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta';

// Crea un error de validación con mensaje claro y el ejemplo de uso
function errorDeValidacion(mensaje) {
  const error = new Error(`${mensaje}\n\n${USO}`);
  error.name = 'ValidacionError';
  return error;
}

// paso 1: validar los argumentos y construir el objeto (sin guardarlo todavía)
function crearMundo(args) {
  // 1.1 deben llegar exactamente 7 argumentos
  if (args.length !== 7) {
    throw errorDeValidacion(
      `Debes enviar exactamente 7 argumentos y recibí ${args.length}. ` +
        '¿Olvidaste las comillas en la situación o en el mundo?'
    );
  }

  // 1.2 ningún argumento puede estar vacío o tener solo espacios
  for (const argumento of args) {
    if (argumento.trim() === '') {
      throw errorDeValidacion('Ningún argumento puede estar vacío ni tener solo espacios.');
    }
  }

  const situacion = args[0].trim();
  const mundo = args[1].trim();
  const colores = args.slice(2).map((color) => color.trim());

  // 1.3 los 5 colores deben ser distintos (sin distinguir mayúsculas)
  const sinRepetir = new Set(colores.map((color) => color.toLowerCase()));
  if (sinRepetir.size !== 5) {
    throw errorDeValidacion('Los 5 colores deben ser distintos entre sí.');
  }

  // 1.4 el id se calcula SIN la fecha: los mismos datos dan siempre el mismo id
  const id = objectHash({ situacion, mundo, colores }).slice(0, 8);

  return { id, situacion, mundo, colores, creadoEn: new Date().toISOString() };
}

// Devuelve la ruta del archivo JSON de un mundo
function rutaMundo(id) {
  return path.join(CARPETA_DATA, `mundo_${id}.json`);
}

// Guarda el objeto en data/mundo_<id>.json y devuelve la ruta
function guardarMundo(mundo) {
  fs.mkdirSync(CARPETA_DATA, { recursive: true });
  const ruta = rutaMundo(mundo.id);
  fs.writeFileSync(ruta, JSON.stringify(mundo, null, 2), 'utf-8');
  return ruta;
}

// Lee el JSON guardado y lo convierte en objeto
function leerMundo(ruta) {
  return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
}

module.exports = { crearMundo, guardarMundo, leerMundo, rutaMundo };
