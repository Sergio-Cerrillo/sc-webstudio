# Propuestas privadas del portfolio

La integración usa el Next.js App Router existente. La cabecera, menú, tema y página pública del portfolio se conservan; la propuesta tiene estilos propios y el administrador su propio menú. El candado de la navegación pública, visible en escritorio y móvil, abre el login de propuestas. El login y el catálogo reutilizan el logo, cabecera, pie y tema claro/oscuro de SC WebStudio.

## Rutas

| Ruta                                           | Contenido                                                 |
| ---------------------------------------------- | --------------------------------------------------------- |
| `/propuestas`                                  | Catálogo privado, ampliable en `lib/proposals/catalog.ts` |
| `/propuestas/acceso`                           | Acceso privado del propietario                            |
| `/propuestas/construccions-germans-moya`       | Landing de presentación                                   |
| `/propuestas/construccions-germans-moya/admin` | Login de perfiles y administrador demo                    |
| `/propuestas/session`                          | POST para iniciar/cerrar el acceso privado                |

Las URLs profundas conservan su destino al pasar por el acceso. Los recursos de `public/propuestas/`, incluidos los originales, pasan por el middleware privado. Se bloquea su uso a través del optimizador público `/_next/image`; las imágenes de esta propuesta ya están optimizadas como WebP y se cargan directamente. No hay APIs públicas para los datos de la demo ni descargas privadas en otro espacio de rutas. Las exportaciones, adjuntos de muestra e impresiones se generan en el navegador.

## Configurar el acceso

Solo necesitas añadir una palabra clave al archivo `.env`:

```dotenv
PROPOSALS_ACCESS_KEY="tu-palabra-clave"
```

Reinicia el servidor después de cambiarla (`pnpm dev` en desarrollo). Pulsa el candado del menú, escribe esa palabra y entra al catálogo. La comparación distingue mayúsculas y minúsculas. Si es incorrecta, se muestra un aviso y las propuestas siguen protegidas. Si falta la variable, el formulario indica que debes configurarla.

No necesitas Redis, un segundo secreto ni otro servicio. La palabra se comprueba únicamente en el servidor; no uses un prefijo `NEXT_PUBLIC_`. En un alojamiento con panel de variables de entorno, configura allí esa misma variable y vuelve a desplegar.

El servidor crea automáticamente una sesión firmada de ocho horas con cookie `HttpOnly`, `SameSite=Strict` y `Secure` en producción. Cambiar la palabra invalida las sesiones anteriores. «Cerrar acceso privado» elimina la sesión de este navegador. El límite de intentos es automático y local a cada instancia de servidor: seis por dirección en quince minutos y cien globales. Se reinicia al reiniciar esa instancia.

El origen de los formularios y redirecciones se obtiene de la petición. Si usas un proxy propio, conserva la cabecera `Host` pública y sobrescribe `X-Forwarded-Proto` y `X-Forwarded-For` con los valores de la conexión real. Mantén las rutas privadas sin caché; el código envía `private, no-store`.

Los endpoints de sesión verifican el origen, limitan el tamaño del cuerpo y rechazan redirecciones externas. El middleware se complementa con verificaciones de sesión en las páginas protegidas. Next.js se ha actualizado a 15.5.29, dentro de la misma versión mayor. Los dos cambios de tipo `Variants` en animaciones existentes conservan su comportamiento y permiten comprobar TypeScript con la versión instalada de Framer Motion.

## Alojamiento y exportación estática

El `next.config.mjs` actual no usa `output: 'export'`; esta implementación requiere ejecución en servidor. El repositorio contiene también archivos estáticos de una exportación antigua (`index.html`, `_next`, `.nojekyll`). **Publicar solo esos archivos no incluye esta integración ni su autenticación.**

No se ha encontrado una configuración de despliegue que permita confirmar el alojamiento real. Para desplegar la solución, usa un alojamiento compatible con Next.js y middleware, por ejemplo su integración de Vercel o un servidor Node detrás de HTTPS. Configura allí `PROPOSALS_ACCESS_KEY`. No publiques directamente `public/propuestas/` desde un bucket, CDN o servidor estático que omita el middleware: sus archivos deben pasar por la aplicación.

Un alojamiento exclusivamente estático como GitHub Pages no puede ejecutar esta sesión de servidor. En ese caso es necesario trasladar la ejecución de estas rutas a un servidor Next.js, con un proxy para mantenerlas bajo `/propuestas`. Otra protección posible depende del alojamiento —por ejemplo una política de acceso en el proxy que cubra también todos los recursos—, pero no se ha configurado una política externa ni se presenta como sustituto activo de la sesión implementada.

`robots.txt` excluye `/propuestas`; todas sus páginas llevan metadatos y cabeceras `noindex, nofollow`. No existía sitemap generado en el proyecto y no se ha añadido ninguna propuesta a uno. La autenticación es la protección real; las instrucciones de robots solo evitan indexación.

## Entrar y cambiar de perfil demo

1. Pulsa el candado del menú (o abre `/propuestas`), introduce tu palabra clave y abre la tarjeta de Germans Moya.
2. En la landing, «Demo de administración» abre su pantalla de acceso independiente.
3. «Entrar como Dirección» permite explorar todos los módulos. Las otras opciones son Administración, Jefe de obra y Operario.
4. «Cerrar sesión demo» permite escoger otro perfil sin cerrar el acceso privado del portfolio. «Cerrar acceso privado» cierra este último.

No se necesitan credenciales para el login demo: los botones eligen un perfil simulado. Todos los registros son ficticios. No uses datos personales reales. Operario representa a **Júlia Font**: solo ve sus obras asignadas, sus fichajes/partes/ausencias y su propia nómina. No ve módulos financieros, presupuestos ni nóminas ajenas. Jefe de obra puede planificar, asignar equipos y revisar partes; Administración gestiona la operación administrativa; Dirección incluye informes.

Los permisos se comprueban en la interfaz y en cada transacción del motor demo. Son una simulación local para presentar el producto: el navegador guarda el conjunto ficticio completo y no constituye un sistema de autorización multiusuario para datos reales.

## Seis recorridos conectados

1. **Solicitud → obra.** En la landing usa «Rellenar con datos demo», confirma el uso ficticio y envía. Abre CRM: la solicitud aparece en «Nueva». Selecciónala, crea un presupuesto, revisa/guarda capítulos, partidas, mediciones, precios, descuento e impuesto. Acepta la última versión guardada y conviértela en obra. Puedes duplicar una versión antes de modificar un presupuesto aceptado.
2. **Equipo → parte.** En Obras abre esa obra, pestaña Equipo, selecciona una cuadrilla que incluya a Júlia y guarda. Cierra solo la sesión demo y entra como Operario. En Personal ficha entrada, registra un parte con horas, horas extra, dieta e incidencia y ficha salida. Entra como Jefe de obra y revisa/aprueba el parte. El coste de horas y dieta se imputa una sola vez; la incidencia aparece en el diario. Fichar registra presencia y no duplica la imputación de horas del parte.
3. **Factura → cobro.** Como Dirección o Administración, desde una obra crea una factura emitida de muestra. En Facturación registra un cobro inferior al total. Se actualizan el saldo de esa factura, el resumen financiero y la ficha de obra. Consulta los movimientos por periodo en Informes con Dirección.
4. **Vacaciones → agenda.** Como Operario solicita vacaciones desde Personal. Como Administración aprueba la solicitud. En Agenda navega al mes o semana de las fechas elegidas: aparece el evento de vacaciones de Júlia.
5. **Pedido → recepción.** Como Administración crea un pedido vinculado a una obra y material, o usa una oferta ficticia de la comparativa. Recibe solo parte de la cantidad. El pedido pasa a «Parcial», se crea el registro de albarán, aumenta el stock y se imputa el coste recibido a la obra. Puedes completar después la recepción; no permite recibir por encima de lo pendiente.
6. **Nómina → impresión.** En Nóminas selecciona noviembre de 2026. Revisa una nómina en borrador, confirma «Simular pago» y abre «Vista imprimible». La marca «DEMO · SIMULACIÓN» permanece en la impresión. No se calcula una nómina real ni se ejecuta ningún pago.

Los datos iniciales incluyen Casa Olivera (reforma en curso), Casa Patio (obra nueva en planificación) y Espacio Calma (interiorismo entregado). Agenda empieza en noviembre de 2026 para mostrar ese conjunto. Los registros nuevos usan la fecha actual. Fechas en DD/MM/AAAA, importes en euros y formato español.

## Persistencia y restablecimiento

Datos de esta propuesta en `localStorage`, clave `sc:proposal:construccions-germans-moya:v1`. El perfil demo se guarda en `sessionStorage` con el mismo espacio de nombres. Los cambios sobreviven a recargas y se sincronizan al cambiar de pestaña. Cambiar de navegador/dispositivo no comparte los datos. La sección privada no tiene base de datos de negocio en servidor.

Ajustes → Restablecer demo pide confirmación y recupera los datos iniciales. La sesión privada y el perfil actual se conservan. Si el navegador bloquea el almacenamiento, está lleno o detecta datos incompatibles, muestra un aviso en lugar de afirmar que guardó los cambios. Los adjuntos locales se limitan a imágenes/PDF ficticios de 1 MB.

## Alcance de las funciones

- Primera portada de dos capas: casa fija y pared con grabado que asciende con scroll. La construcción 3D se conserva como segunda sección de la misma página y después aparecen los proyectos. Ambas ofrecen salto a proyectos y movimiento reducido. Detalles en [PORTADA-MOYA.md](PORTADA-MOYA.md) y [CONSTRUCCION-3D.md](CONSTRUCCION-3D.md).
- El comparador de cocina utiliza las imágenes `cocina-antes` y `cocina-despues` facilitadas por el propietario, en el mismo marco horizontal 1168 × 657, sin filtros artificiales. El control nativo permite ratón, toque y teclado. Se presentan como imágenes de la propuesta, sin atribuir una obra real a la empresa.
- Las fotos de proyectos y servicios son ilustrativas; no se atribuyen trabajos reales a la empresa. Los proyectos, empleados, clientes, proveedores, direcciones, testimonios y documentos son inventados.
- Correo, facturación fiscal, cobros, pagos y nóminas son simulaciones locales con confirmación explícita. Las vistas imprimibles no tienen validez legal/fiscal/laboral. Las nóminas usan conceptos coherentes fijos; no se recalculan automáticamente desde los partes.
- Cambios de alcance, certificaciones, garantías y posventa se representan mediante registros de seguimiento y listas de entrega. No recalculan contratos ni generan certificados válidos. Los documentos iniciales son esquemas o textos de muestra; los archivos añadidos son locales.
- El calendario permite editar eventos, elegir persona y recurso, asignar cuadrillas desde la obra y detectar solapamientos de persona/vehículo/maquinaria. Las vacaciones aprobadas se añaden automáticamente.
- Informes filtra facturas, cobros/pagos, costes, horas y compras por fechas y obra; identifica por separado las previsiones y acumulados de obra. El CSV contiene solo datos ficticios y neutraliza fórmulas en texto.
- Catálogo, estados iniciales, roles y listas de ejemplo se definen en código. No hay editor general para crear usuarios, redefinir permisos o personalizar todo el sistema; Ajustes permite cambiar preferencias y serie de documentos de muestra.

## Recursos visuales

Los originales del propietario y los WebP están en `public/propuestas/construccions-germans-moya`. La fachada WebP pesa aproximadamente 320 KB; el original se conserva. El logo se mantiene en el pie y se ha retirado del menú superior. Las imágenes nuevas de cocina están en `cocina-antes-despues-horizontal`, con PNG originales y WebP de unos 251 KB y 196 KB.

El header de la propuesta es fijo: arriba conserva la presentación transparente y, al superar 48 px de scroll, se transforma en una barra flotante con desenfoque, reflejos, borde y sombra. Recupera su estado inicial al volver arriba. En móvil adopta una pastilla «Menú» con desplegable; cierra al elegir destino, pulsar fuera o usar Escape. La lógica está en `components/proposals/moya-header.tsx` y el acabado en `app/propuestas/moya-navigation.css`. El modo de movimiento reducido elimina la transición de transformación.

La revisión del header y de las imágenes de cocina pasa TypeScript sin caché incremental, compilación y comprobaciones HTTP de producción. La compilación se ejecutó en una copia temporal con `node_modules` enlazado y sin copiar `.env`, para conservar el servidor de desarrollo abierto en el puerto 3000. La copia y el servidor de prueba se retiran al finalizar.

La primera pantalla usa los dos lienzos del paquete `casa-y-pared-germans-moya`, con versiones WebP y pared con alfa sin pérdidas. No carga la referencia ni los 144 fotogramas. La segunda sección genera la arquitectura, materiales y texturas en código. Los originales de ambos paquetes se conservan. La antigua sección estática del grabado se ha eliminado para no repetir la pared.

Las fotografías adicionales se descargaron para evitar dependencias de red al mostrar la demo. Fuente: Unsplash, uso ilustrativo bajo su [licencia](https://unsplash.com/license). Referencias de los archivos:

- `cocina.webp`: [GoodLifeConstruction](https://unsplash.com/photos/modern-kitchen-with-wood-cabinets-and-large-windows-7PTnAE1DK4k), imagen `photo-1771371282665-545256b20dca`.
- `interior.webp`: `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0`.
- `casa.webp`: `https://images.unsplash.com/photo-1600607687920-4e2a09cf159d`.
- `bano.webp`: `https://images.unsplash.com/photo-1620626011761-996317b8d101`.
- `estructura.webp`: `https://images.unsplash.com/photo-1504307651254-35680f356dfd`.

## Verificación

Con Node 24 para ejecutar directamente los tests TypeScript (sin dependencias adicionales de pruebas):

```sh
pnpm typecheck
pnpm test:proposals
pnpm test:construction
pnpm test:wall-opening
pnpm build
pnpm test:proposals:http
```

Las pruebas de lógica cubren los seis recorridos completos, invariantes de importes/stock, permisos, fechas solapadas, persistencia serializable, restablecimiento inicial, firma/caducidad de sesión y retornos seguros. Las pruebas HTTP arrancan el servidor de producción con una única clave efímera y comprueban acceso directo, recursos privados, manipulación de cookie, CSRF, límites, cierre, robots y funcionamiento del portfolio. No usan servicios de pago ni credenciales reales. El servidor de prueba se cierra al terminar; usa `PROPOSALS_TEST_PORT` si 3310 está ocupado.

Las pruebas de construcción comprueban las fases en ambos sentidos, el encuadre sin deformación en siete tamaños, las transiciones continuas y la liberación de recursos compartidos del modelo. La prueba HTTP comprueba también que la portada incluye la alternativa inicial y ya no referencia la secuencia JPEG.

La revisión del 10/11/2026 completa TypeScript, las cuatro pruebas de construcción, las catorce pruebas de propuestas, la compilación de producción y la prueba HTTP de producción. Para evitar el disco lleno durante esta revisión se desactivó la caché persistente con `SC_BUILD_MEMORY_CACHE=1`; la compilación necesitó acceso a Google Fonts para la tipografía existente.

Revisión visual de la apertura 3D en Chrome: portada, cimientos, estructura de dos niveles, envolvente, edificio terminado, retroceso, giro vertical/horizontal conservando la fase, movimiento reducido y pérdida de contexto WebGL. La revisión móvil utiliza emulación iPhone 16 Pro Max, no un dispositivo físico. La impresión física/PDF de los módulos de administración sigue sin verificarse en navegador.

Con 4G lento y caché desactivada la portada se mantuvo visible durante la descarga; la consola no mostró errores de la escena. Se verificó también el foco del salto a proyectos. La pérdida deliberada de WebGL recuperó la ilustración terminada, el titular final y el acceso a proyectos. Las comprobaciones visuales se hicieron sobre el servidor de desarrollo; la compilación final se comprobó además por HTTP.

La portada de dos capas es posterior a esas comprobaciones visuales del 3D: en su sesión inicial el control de Chrome no pudo arrancar. Durante la revisión posterior del header y de la cocina el navegador volvió a estar disponible: se comprobaron la portada inicial, la entrada de la pared y el grabado completo en móvil, además del menú transparente/flotante, su restauración al volver arriba, el desplegable móvil y el comparador por arrastre y teclado (0, 50 y 100 en escritorio). El móvil se comprobó mediante emulación iPhone SE 375×667. No se repitió la carga lenta de la nueva portada fotográfica.
