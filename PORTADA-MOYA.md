# Casa y pared · Primera pantalla de Germans Moya

Orden de la página, según la aclaración del propietario: **casa + pared → construcción 3D → proyectos**. Ambas animaciones permanecen en la misma URL. «Saltar animación» lleva directamente a proyectos y le da el foco; el scroll normal recorre la construcción 3D como segunda sección.

La apertura anterior montaba la maqueta 3D antes de la fotografía y mostraba después otra sección estática del grabado. No era la composición fotográfica solicitada. La nueva portada precede a la maqueta y elimina esa repetición posterior de la firma.

## Recursos y composición

Originales conservados en `public/propuestas/construccions-germans-moya/casa-y-pared-germans-moya/`. Los PNG tienen el mismo lienzo, 1672 × 941. Las versiones WebP se usan para reducir la transferencia: casa de unos 555 KB y pared de unos 925 KB. La pared conserva el canal alfa sin pérdidas. La foto original de referencia no se descarga en la landing.

`components/proposals/moya-wall-opening.tsx` contiene la portada. La casa se sirve como imagen HTML eager de prioridad alta, sin esperar a JavaScript, WebGL, vídeo ni precarga de una secuencia. Se superpone el lienzo transparente completo, no un logo separado ni una pared recortada y reposicionada a ojo. Ambos recursos tienen alternativa al PNG original si falla el WebP.

`app/propuestas/moya-wall-opening.css` define **un solo marco** con el aspect ratio original. Ambas imágenes ocupan exactamente ese marco. Únicamente el contenedor transparente se traslada en vertical. La máscara de la luz usa el mismo lienzo y se mueve con la piedra. La imagen base, el recorte y la escala no cambian al hacer scroll.

En vertical el marco se centra en el grabado, siempre conjuntamente para ambas capas. Se conserva `cover`, sin franjas ni deformación. En pantallas especialmente estrechas y largas, la proporción del viewport puede recortar los extremos del grabado; los tamaños comprobados por la prueba geométrica incluyen 320×640, 375×667, 390×844, 440×956 y 768×1024.

## Ritmo y accesibilidad

La primera sección mide 240svh en escritorio y 195svh en móvil. El contenedor de 100svh usa `position: sticky` y recorta la pared que entra desde abajo. Su borde superior parte exactamente del borde inferior del viewport, incluso si la fotografía tiene recorte vertical.

`lib/proposals/wall-opening.ts` define el recorrido: el primer scroll desplaza la piedra y esta encaja al 76 % del progreso. El último 24 % es una pausa de contemplación. No hay reproducción temporal, suavizado autónomo ni redondeo a fotogramas: detener o invertir el scroll detiene o invierte el desplazamiento. `requestAnimationFrame` agrupa las escrituras de estilo y no mantiene un bucle en reposo. Tras encajar, aparece una luz cálida muy tenue. El titular permanece en HTML y se retira gradualmente.

Con `prefers-reduced-motion`, las dos capas aparecen ya compuestas por CSS desde el inicio, sin esperar al efecto React. La portada se reduce a una pantalla y la escena 3D también utiliza su alternativa estática. El cambio de tamaño vuelve a encuadrar ambas capas simultáneamente y conserva el progreso si la portada está activa.

## Comprobar y personalizar

```sh
SC_BUILD_MEMORY_CACHE=1 pnpm dev
pnpm test:wall-opening
pnpm typecheck
pnpm test:construction
pnpm test:proposals
pnpm build
pnpm test:proposals:http
```

Abre `/propuestas/construccions-germans-moya` con la palabra habitual de `.env`. Para ajustar el tiempo, cambia las alturas CSS o el valor `.76` de `wallAt`. Los textos están en el componente, el punto de encuadre vertical en `.moya-wall-frame` y la intensidad de luz en `wallAt`.

Las pruebas cubren continuidad, reversibilidad, inicio sin zona muerta, pausa final, lienzos, transparencia y registro geométrico en siete tamaños. La prueba HTTP revisa que la foto se incluya de forma eager en HTML, que exista un solo H1, el orden de las tres secciones y la protección de los dos WebP.

Completadas en esta revisión: TypeScript (`--incremental false` para evitar escribir caché con el disco lleno), las tres pruebas de portada y las cuatro de construcción 3D, compilación de producción y comprobaciones HTTP sobre esa compilación. La revisión HTTP incluye el acceso a ambos WebP con sesión y su bloqueo sin sesión. No se modificó `.env`.

En la sesión inicial el control nativo devolvió `Sky Computer Use native pipe startup failed` y el host de navegador no estaba disponible. En la revisión posterior del header y de la cocina se pudo abrir Chrome: se vieron la primera pantalla fotográfica, la entrada de la pared en escritorio y el encaje final con el grabado completo en iPhone SE emulado (375×667), con el nuevo header fijo superpuesto. Sigue pendiente la revisión de carga lenta de esta portada fotográfica. Las verificaciones de la apertura 3D anterior no validan automáticamente esta composición nueva.
