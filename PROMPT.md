# PROMPT.md: Proceso de construcción de mundos-ia

Taller integrador "Mundos imaginarios" · Node.js · Sesiones 0 a 5

---

## A. Declaración

**Usé IA: sí.**

La IA me ayudó a planificar el trabajo, escribir el código base, diagnosticar errores y organizar la entrega. Las decisiones finales, la configuración de mis cuentas y claves, las pruebas, las capturas y los commits los hice yo.

## B. Herramienta y modelo

- **Herramienta:** Claude (Anthropic), en la aplicación de chat.
- **Modelo:** Claude Sonnet 5.5.

## C. Prompt inicial

Adjunté el enunciado completo del taller y escribí, literalmente:

> necesito que me realices el siguiente aplicativo deacuerdo a las siguintes instrucciones pero antes deme contextualizacion del trabajo y dime que vas a realizar para hacerlo realidad

Elegí empezar pidiendo contexto y un plan, antes del código, para entender el taller y confirmar las decisiones técnicas.

## D. Prompts siguientes

| N.º | Mi prompt (resumen fiel) | Qué respondió la IA | Qué hice con la respuesta |
|---|---|---|---|
| 1 | Pedí el plan antes de programar | Resumió el flujo (parámetros → JSON → texto → imagen), propuso CommonJS, Groq (texto) y NVIDIA (imagen), y listó los archivos a entregar | Acepté CommonJS y Groq. Más adelante cambié el servicio de imagen (ver E) |
| 2 | Pregunté qué debía adelantar yo para no tener problemas | Priorizó: verificar Node ≥ 20.12, crear cuentas y claves, confirmar créditos, elegir dos mundos de prueba y preparar las evidencias | Seguí la lista: verifiqué mis versiones (Node v24, npm 11, Git 2.53) y creé las cuentas |
| 3 | Pregunté cómo generar las claves de Groq y NVIDIA | Dio los pasos y advirtió no compartir las claves en ningún chat | Generé ambas y las guardé solo en mi `.env`, sin pegarlas en el chat |
| 4 | Pedí que empezara el proyecto | Entregó `package.json`, `.gitignore`, `.env.example`, los cuatro módulos de `src/`, README y una plantilla de PROMPT.md | Descomprimí el proyecto, ejecuté `npm install` y configuré mi `.env` |
| 5 | Pegué el `TimeoutError` del paso 3 y los resultados de las pruebas | Propuso descartar la clave con una prueba sin costo y consultar el estado del servicio | Ejecuté `probar-clave.js` (estado 200) y comprobé que mis compañeros tenían el mismo fallo |
| 6 | Pedí el paso a paso para usar Cloudflare | Dio la guía de cuenta, Account ID, token, `.env` y el nuevo `imagen.js` | Lo apliqué y el programa funcionó |
| 7 | Pregunté por los commits y su orden | Propuso un commit por parte, `git add` por nombre de archivo y revisar `git status` antes de cada uno | Hice los commits siguiendo ese orden |

## E. Cambios que hice sobre lo entregado por la IA

1. **Cambié el servicio de imágenes de NVIDIA a Cloudflare Workers AI.** La versión inicial usaba NVIDIA FLUX.1-schnell, pero el paso 3 siempre terminaba en `TimeoutError`. Edité `imagen.js`, `.env` y `.env.example` para usar la Opción B de la sección 5.2 del taller, y actualicé el README.
2. **Corregí la ubicación del proyecto.** Había ejecutado `git init` y los comandos en una carpeta que no contenía los archivos. Moví mi trabajo a la carpeta que tiene el `package.json` y comprobé que el repositorio estuviera allí.
3. **Configuré mi propio entorno.** Creé el `.env` con mis claves y mi Account ID de Cloudflare, y adapté `.env.example` con valores de ejemplo, sin claves reales.
4. **Personalicé el `package.json`** con mi nombre como autor, y eliminé los scripts de prueba (`probar-clave.js`, `probar-imagen.js`) que no forman parte de la entrega.

## F. Una línea de código que no entendía al principio

```js
const bytes = Buffer.from(base64, 'base64');
```

**Con mis palabras:** la API de imágenes no devuelve el archivo directamente, sino un texto muy largo llamado base64, que es una forma de escribir bytes usando solo letras y números para poder enviarlos dentro de un JSON. `Buffer.from(..., 'base64')` decodifica ese texto y recupera los bytes reales de la imagen. Si guardara el texto con `'utf-8'`, el archivo `.jpg` contendría letras y no una imagen válida, y no se abriría.

## G. Un error y cómo lo resolví

**Error 1: timeout del paso 3 (NVIDIA)**

```
Error en el paso 3: El servicio tardó demasiado en responder.
```

Cómo lo resolví:

1. Comprobé que los pasos 1 y 2 funcionaron y que sus archivos se conservaron, como pide la Parte 5.
2. Descarté un error de clave con una prueba que listaba modelos de NVIDIA: respondió `Estado: 200`, así que la clave era válida.
3. Una prueba directa con 180 s de espera también terminó en `TimeoutError`, y mis compañeros reportaron el mismo fallo con sus propias claves.
4. Concluí que el problema estaba en el servicio de imágenes de NVIDIA, no en mi código. Cambié a Cloudflare Workers AI y el programa funcionó.

**Error 2: `npm install` con `ENOENT` (no encuentra `package.json`)**

Había ejecutado el comando en una carpeta sin los archivos del proyecto. Lo resolví entrando a la carpeta que contiene el `package.json`.

---

## Nota de seguridad

En este documento y en el chat no se escribió ninguna clave ni token. Las claves están solo en mi `.env`, que está en el `.gitignore` y no forma parte del repositorio.