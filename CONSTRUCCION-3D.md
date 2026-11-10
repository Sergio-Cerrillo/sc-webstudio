# Apertura arquitectónica de Germans Moya

Ruta: `/propuestas/construccions-germans-moya#construccion-3d`. La construcción 3D es la segunda sección, después de la portada de casa y pared. Se integra con el acceso privado existente y conserva proyectos, servicios, formulario y administración. Véase [PORTADA-MOYA.md](PORTADA-MOYA.md) para la primera pantalla.

## Verla localmente

```sh
pnpm dev
```

Abre `http://localhost:3000/propuestas/construccions-germans-moya` e introduce tu `PROPOSALS_ACCESS_KEY` habitual. La palabra permanece en `.env` y se comprueba en servidor.

Si el disco está casi lleno, puedes evitar la caché persistente de Webpack sin cambiar la configuración normal:

```sh
SC_BUILD_MEMORY_CACHE=1 pnpm dev
```

## Dónde personalizar

| Archivo | Qué modificar |
| --- | --- |
| `lib/proposals/construction/config.ts` | Textos de las cinco fases, sus puntos de entrada, colores `ART` y composición responsive `fitView`. |
| `lib/proposals/construction/model.ts` | Arquitectura, materiales, jardín y grupos de ensamblaje. Cada `part(nombre, inicio, duración, desplazamiento, crecer, inclinación)` usa el reloj normalizado 0–1. |
| `lib/proposals/construction/scene.ts` | Cámara, luces, evolución del atardecer, partículas, límites de resolución y timeline GSAP. |
| `components/proposals/moya-opening.tsx` | Narrativa HTML y llamadas a la acción de la segunda sección. |
| `components/proposals/construction-fallback.tsx` | Ilustración SVG estática sin WebGL o con movimiento reducido. |
| `app/propuestas/moya-opening.css` | Tipografía, márgenes, controles, progreso y adaptación a móvil. |

La arquitectura es una maqueta conceptual contemporánea: dos niveles, galería superior en voladizo, ala de jardín, acristalamientos, lamas, terraza, pérgola y acceso escalonado. No representa una obra real de la empresa.

## Cómo funciona

Una única escena Three.js contiene el terreno y todas las piezas. La cámara ortográfica conserva su posición, orientación y zoom durante la construcción; únicamente se recalcula la proyección al cambiar el viewport para mantener el edificio completo en pantalla. El paisaje no se sustituye ni se funde con otras imágenes.

GSAP coordina posiciones, escalas e inclinaciones de los grupos. ScrollTrigger ancla la escena con `pin` y utiliza `scrub: 0.45`: los 450 ms son amortiguación del desplazamiento, no reproducción autónoma. Tras esa breve estabilización, la construcción permanece detenida. Al subir, la misma timeline reconstruye todos los estados en sentido inverso. No se usan fotogramas discretos ni búsquedas de tiempo en un vídeo.

El tramo de scroll mide 4,4 pantallas en escritorio y 3,45 en móvil, además del viewport visible. Modifica el multiplicador de `end` en `scene.ts` para cambiar la duración. Los últimos instantes dejan contemplar el resultado. Después se desancla hacia proyectos. «Saltar animación» lleva directamente a proyectos con foco accesible.

El renderizado se solicita durante el scrub, al redimensionar o al volver a la pestaña. No hay un bucle de render permanente en reposo. Se reutilizan geometrías y materiales; el buffer se limita a unos 2,6 millones de píxeles, con DPR máximo 1,65 en escritorio y 1,4 en móvil. En móvil se reducen partículas, mapa de sombras y sombras de detalles pequeños. Se liberan geometrías, materiales, texturas, render targets, listeners, timeline y pin al desmontar.

Con movimiento reducido no se importa el motor 3D ni se crea el pin: se muestra una ilustración terminada y se conserva el scroll normal. La misma alternativa cubre la falta de WebGL. Si se pierde el contexto durante la visita, se recupera la portada estática. La portada inicial SVG está incluida en el HTML y permanece visible mientras descarga el motor.

## Sustituir por GLB/GLTF

`mountConstruction` acepta `modelFactory`. El contrato `ConstructionModel` separa el modelo del motor: `root`, `parts`, `blueprint`, `excavation`, `warmMaterials` y `dispose`. Un adaptador puede cargar un GLB, agrupar sus nodos por fases y devolver ese contrato; la cámara, la narrativa, el pin y el resto de la landing no necesitan reescribirse. El código actual no referencia un GLB inexistente.

## Comprobar

```sh
pnpm typecheck
pnpm test:construction
pnpm test:proposals
pnpm build
pnpm test:proposals:http
```

La prueba HTTP utiliza una clave efímera y cierra su servidor al terminar. No modifica `.env`. Para compilar con poco espacio: `SC_BUILD_MEMORY_CACHE=1 pnpm build`.

La revisión visual debe incluir scroll lento y rápido en ambas direcciones, parada en mitad del ensamblaje, entrada por URL directa, giro de pantalla, pérdida de WebGL y movimiento reducido. La emulación móvil no sustituye una revisión en teléfono físico; no se fija una promesa de FPS para todo hardware.
