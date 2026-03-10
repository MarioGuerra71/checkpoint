/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Necesario para cargar las portadas de RAWG con <Image />
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;