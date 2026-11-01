# mundos-ia

Programa de consola en Node.js que convierte una **situación**, un **mundo** y **5 colores** en una imagen:

1. Guarda los datos en `data/mundo_<id>.json`.
2. Lee ese JSON y pide a un modelo de lenguaje la descripción de una imagen (`descripciones/mundo_<id>.txt`).
3. Envía la descripción a un modelo de imágenes y guarda el resultado en `imagenes/mundo_<id>.jpg`.

Si el `.txt` o la imagen ya existen, no se vuelve a llamar a ninguna API (ahorra cuota gratuita).

## Configuración

1. Requisitos: Node.js 20.12 o superior, npm y Git.
2. Instala la dependencia: `npm install`
3. Copia `.env.example` a `.env`:
   - Windows (PowerShell): `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`
4. Abre el `.env` y completa tus datos, sin comillas ni espacios alrededor del `=`:
   - `TEXTO_API_KEY`: tu clave de Groq (empieza por `gsk_`).
   - `IMAGEN_API_KEY`: tu token de Cloudflare Workers AI.
   - `IMAGEN_URL`: reemplaza `TU_ACCOUNT_ID` por tu Account ID de Cloudflare.
5. Nunca subas el `.env` a Git (ya está en `.gitignore`).

## Uso

```
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta
```

Las comillas y el doble guion `--` son necesarios.

Salida esperada:

```
Paso 1: mundo guardado en data/mundo_<id>.json
Paso 2: descripción guardada en descripciones/mundo_<id>.txt
Paso 3: imagen guardada en imagenes/mundo_<id>.jpg
Listo. Revisa la carpeta imagenes/
```

Si repites el mismo comando, el programa reutiliza los archivos y no llama a ninguna API.

## Estructura

```
mundos-ia/
├── src/
│   ├── index.js     # orquesta los pasos 1 a 3 y explica los errores
│   ├── mundo.js     # valida argumentos, crea, guarda y lee el JSON
│   ├── texto.js     # consulta al modelo de lenguaje
│   └── imagen.js    # consulta al modelo de imágenes
├── evidencias/      # capturas de pantalla de la entrega
├── .env             # tus claves (NO va a Git)
├── .env.example
├── .gitignore
├── package.json
├── PROMPT.md
└── README.md
```

Al ejecutar el programa se crean también las carpetas `data/`, `descripciones/` e `imagenes/`, que no se suben a Git.

## Servicios elegidos

- **Texto:** [Groq](https://console.groq.com) con el modelo `openai/gpt-oss-20b`.
- **Imagen:** [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) con el modelo `@cf/black-forest-labs/flux-1-schnell`.

Inicialmente se probó NVIDIA FLUX.1-schnell, pero su servicio de imágenes no respondía y el paso 3 terminaba en timeout, incluso con una clave válida. Por eso se cambió a Cloudflare, que es la Opción B de la guía del taller. Solo hubo que modificar `src/imagen.js` y las variables `IMAGEN_*` del `.env`.

## Experimento: npm publish --dry-run con y sin .gitignore

> 

Ejecuté `npm publish --dry-run` (simulacro: no publica nada, solo lista los archivos que subiría) en dos situaciones. Las capturas están en `evidencias/`.

- **Con `.gitignore`:** npm avisó que, al no existir un `.npmignore`, usaba el `.gitignore` para excluir archivos. La lista tuvo **9 archivos y 8.4 kB**: `package.json`, `README.md`, `PROMPT.md`, `.env.example` y los cuatro archivos de `src/`. No aparecieron `.env`, `data/`, `descripciones/` ni `imagenes/`.
- **Sin `.gitignore` (renombrado a `.gitignore.off`):** la lista subió a **21 archivos y 2.0 MB**. Aparecieron de más el `.env`, los JSON de `data/`, los `.txt` de `descripciones/` y las imágenes de `imagenes/`.
- **Por qué es peligroso:** el `.env` contiene mis claves (Groq y Cloudflare). Si hubiera publicado el paquete en ese estado, cualquier persona que lo descargara de npm podría leer mis claves y usar mis cuentas y mi cuota gratuita. Una vez publicado, borrarlo no basta, porque el paquete ya pudo haber sido descargado; habría que revocar las claves y crear otras. Por eso el `.gitignore` es tan importante.
## Preguntas de reflexión

1. **¿Por qué el id se calcula sin la fecha?** Porque la fecha cambia en cada ejecución. Si entrara en el hash, los mismos datos darían un id distinto cada vez, y nunca se reutilizarían los archivos ya generados ni se ahorraría cuota.

2. **¿Por qué la descripción en inglés?** Los modelos de imágenes se entrenaron sobre todo con texto en inglés y suelen interpretarlo mejor. (Pendiente: probar una descripción en español y comparar las imágenes.)

3. **¿Qué diferencia hay entre una respuesta JSON de texto y los bytes de una imagen? ¿Qué es base64?** La respuesta de texto es un JSON legible. Una imagen es un archivo binario (bytes). Base64 es una forma de escribir bytes usando solo caracteres de texto, para poder enviarlos dentro de un JSON. Cloudflare devuelve la imagen en `result.image` y se convierte de vuelta con `Buffer.from(texto, 'base64')`.

4. **¿Qué pasaría si guardas la imagen con 'utf-8'?** Se guardaría el texto base64 y no los bytes reales, así que el archivo quedaría dañado: el visor no encontraría una cabecera JPEG válida.

5. **¿Qué pasos consumen cuota gratuita y cómo evitaste repetirlos?** El paso 2 (modelo de texto) y el paso 3 (modelo de imágenes). Antes de llamar a cada API, el programa comprueba con `fs.existsSync` si el `.txt` o el `.jpg` ya existen y, si es así, los reutiliza.

6. **Si usaste IA: ¿qué fue lo más difícil de pedirle y qué parte tuviste que corregir tú?**
pues tuve problemas con la api de Nvidia pero pues la solucion fue simplemete cambiar a la segunda opcion
no presente mayores problemas con el desarrollo pero lo que si note dificil es el aprendizaje y conocer de buena manera lo que relice con ella entender bien lo que hice y sentir que trabajo bajo sus terminos y no
desde mi conocimiento