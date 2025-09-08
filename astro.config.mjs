import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { autolinkConfig } from "./plugins/rehype-autolink-config";
import rehypeSlug from "rehype-slug";
import alpinejs from "@astrojs/alpinejs";
import solidJs from "@astrojs/solid-js";
import AstroPWA from "@vite-pwa/astro";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "server", 
  site: "https://stiktokio.com", // Use your actual domain
  adapter: vercel(),
  
  // Build optimizations for better performance
  build: {
    inlineStylesheets: "auto", // Inline critical CSS
  },
  
  // Add Astro's built-in i18n configuration
  i18n: {
    defaultLocale: "en",
    locales: ["en", "it", "ar", "fr", "de", "es", "hi", "id", "ru", "pt", "ko", "tl", "nl", "ms", "tr"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  
  vite: {
    plugins: [tailwindcss()],
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
    
    // SSR configuration for TikTok API
    ssr: {
      external: ["@tobyg74/tiktok-api-dl"],
    },
    
    // Optimize dependencies
    optimizeDeps: {
      exclude: ["@tobyg74/tiktok-api-dl"],
    },
    
    // Build optimizations
    build: {
      minify: 'esbuild',
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('solid-js')) {
                return 'solid';
              }
              if (id.includes('alpinejs')) {
                return 'alpine';
              }
              if (id.includes('@astrojs')) {
                return 'astro-runtime';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  },
  
  integrations: [
    sitemap({
      filter(page) {
        const url = new URL(page, 'https://stiktokio.com');
        const nonEnglishLangs = ['ar', 'it', 'de', 'es', 'fr', 'hi', 'id', 'ko', 'ms', 'nl', 'pt', 'ru', 'tl', 'tr'];
        const shouldExclude =
          nonEnglishLangs.some(lang =>
            url.pathname.startsWith(`/${lang}/blog/`) &&
            url.pathname !== `/${lang}/blog/`
          ) ||
          /\/blog\/\d+\//.test(url.pathname) ||
          url.pathname.includes('/tag/') ||
          url.pathname.includes('/category/');
        return !shouldExclude;
      },
    }),
    
    alpinejs(),
    solidJs(),
    
    // Optimized PWA configuration
    AstroPWA({
      mode: "production",
      base: "/",
      scope: "/",
      includeAssets: ["favicon.ico"],
      registerType: "autoUpdate",
      manifest: {
        name: "Tiktokio - TikTok Downloader - Download TikTok Videos Without Watermark",
        short_name: "Tiktokio",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "pwa-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
          {
            src: "maskable-icon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit
        navigateFallback: "/404",
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp}',
        ],
        globIgnores: [
          '**/node_modules/**/*',
          '**/admin/**/*',
          '**/*vendor*.js'
        ],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        suppressWarnings: true,
      },
    }),
    
    icon(),
  ],
  
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, autolinkConfig],
    ],
  },
  
  // Clean security configuration - no ad domains
  security: {
    csp: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", "https://tikwm.com"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    },
  },
});
