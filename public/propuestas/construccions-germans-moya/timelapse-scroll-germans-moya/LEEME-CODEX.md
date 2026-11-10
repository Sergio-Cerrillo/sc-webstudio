# Construccions Germans Moya · Del terreno a la firma

El MP4 dura 6 segundos. Los JPEG 000–143 son sus fotogramas en orden, a 960 × 540. Los cuatro PNG son los planos originales separados. La secuencia está compuesta mediante máscaras animadas, fundido y acercamiento a partir de estos planos.

Integra esta apertura en /propuestas/construccions-germans-moya. Usa una sección sticky con scroll nativo y un canvas. Calcula el progreso de 0 a 1 con la posición de la sección y dibuja round(progreso * 143). Al invertir el scroll, invierte la secuencia. Actualiza solo al cambiar el índice y usa requestAnimationFrame para agrupar actualizaciones. Precarga primero una muestra repartida y después los fotogramas vecinos, con concurrencia limitada. Si falta uno, conserva el más cercano disponible. Evita retener simultáneamente todos los bitmaps decodificados en móvil.

Usa el MP4 como vista previa o alternativa y evita cargar ambas versiones a la vez. Pon el titular en HTML sobre la escena. En móvil, encuadra la obra y ajusta el foco hacia el grabado al final. Ofrece «Saltar animación» y una fachada estática con prefers-reduced-motion. Al desanclar la escena, da paso a proyectos. Comprueba el avance, retroceso y la carga con una conexión lenta.
