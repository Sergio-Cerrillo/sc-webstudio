/** @type {import('next').NextConfig} */

// Asumimos que si NODE_ENV es 'production', es para el despliegue con dominio personalizado
// donde los assets se sirven desde la raíz.
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // Para GitHub Pages con un dominio personalizado apuntando a la raíz,
  // basePath y assetPrefix típicamente deberían estar vacíos.
  basePath: isProduction ? '' : '', // Cambiado de '/sc-webstudio'
  assetPrefix: isProduction ? '' : '', // Cambiado de '/sc-webstudio/'
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
