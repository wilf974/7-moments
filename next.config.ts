import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Docker
  output: 'standalone',

  // Désactiver la compression (gérée par Nginx)
  compress: false,

  // Désactiver le header X-Powered-By
  poweredByHeader: false,

  // Optimisation des imports de packages
  experimental: {
    optimizePackageImports: ['cookies-next', 'clsx', 'tailwind-merge', 'idb-keyval'],
  },

  // Headers de sécurité et cache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache long pour les assets statiques Next.js (hashés, immutables)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache pour les fichiers statiques publics
        source: '/:path(.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff2|js|css))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Le service worker doit être revérifié à chaque visite (sinon une nouvelle version met 30 jours à arriver)
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
