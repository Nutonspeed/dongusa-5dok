/** @type {import('next').NextConfig} */
const fallbackConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Disable image optimization if causing issues
  },
  compress: false, // Disable compression to speed up builds
  poweredByHeader: false,
  swcMinify: false, // Use Terser instead of SWC if SWC fails
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/login',
        permanent: false,
      },
    ]
  }
}

export default fallbackConfig
