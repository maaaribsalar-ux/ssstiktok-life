import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { autolinkConfig } from "./plugins/rehype-autolink-config";
import rehypeSlug from "rehype-slug";
import alpinejs from "@astrojs/alpinejs";
import solidJs from "@astrojs/solid-js";
import AstroPWA from "@vite-pwa/astro";
import icon from "astro-icon";
import vercel from "@astrojs/vercel/serverless";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Keep server for your TikTok API functionality
  output: "server",
  site: "https://ssstiktok-life-eight.vercel.app",
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    speedInsights: {
      enabled: true
    }
  }),
  
  // Build optimizations for performance
  build: {
    // Inline stylesheets smaller than 4kb
    inlineStylesheets: "auto",
    // Split chunks for better caching
    split: true,
    // Optimize assets
    assets: "_astro",
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
    
    // Enhanced build optimizations
    build: {
      // Reduce bundle size
      target: 'es2020',
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize chunks
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks(id) {
            // Vendor chunk for node_modules
            if (id.includes('node_modules')) {
              // Create separate chunks for large libraries
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
            // Separate chunk for components
            if (id.includes('/src/components/')) {
              return 'components';
            }
            // Separate chunk for layouts
            if (id.includes('/src/layouts/')) {
              return 'layouts';
            }
          },
          // Optimize chunk file names
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'vendor') {
              return '_astro/vendor.[hash].js';
            }
            return '_astro/[name].[hash].js';
          },
          assetFileNames: '_astro/[name].[hash][extname]'
        }
      },
      // Minification settings
      minify: 'esbuild',
      // Source maps for production debugging (disable if not needed)
      sourcemap: false,
      // Remove console logs in production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        // Pre-bundle frequently used deps
        'solid-js',
        'alpinejs'
      ],
      
    },
    
    // SSR configuration
    ssr: {
      external: ["@tobyg74/tiktok-api-dl"],
      // Optimize SSR performance
      noExternal: ['solid-js', 'alpinejs']
    },
    
    // Development server optimizations
    server: {
      hmr: {
        overlay: false
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
    
    // Alpine.js with optimization
    alpinejs(),
    
    // Solid.js with optimization
    solidJs(),
    
    // Optimized PWA configuration
    AstroPWA({
      mode: "production",
      base: "/",
      scope: "/",
      includeAssets: ["favicon.ico"],
      registerType: "autoUpdate",
      strategies: "generateSW",
      
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
        // Increase file size limit to handle larger bundles
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB
        
        // Optimize caching strategy
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
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
        ],
        navigateFallback: "/404",
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp}',
        ],
        // Exclude large or dynamic files from precaching
        globIgnores: [
          '**/node_modules/**/*',
          '**/admin/**/*',
          '**/_astro/vendor*.js', // Exclude large vendor bundles
          '**/_astro/*vendor*.js', // Exclude any vendor-like files
        ]
      },
      
      devOptions: {
        enabled: false,
        suppressWarnings: true,
      },
    }),
    
    icon({
      // Optimize icon loading
      iconDir: "src/icons",
    }),
  ],
  
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, autolinkConfig],
    ],
    // Optimize markdown processing
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  
  // Enhanced security configuration
  security: {
    csp: {
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'", 
          "'unsafe-inline'", // Only for critical inline scripts
          "https://www.googletagmanager.com",
          "https://pagead2.googlesyndication.com",
          // Remove acscdn.com or load it conditionally
        ],
        "connect-src": [
          "'self'", 
          "https://tikwm.com",
          "https://www.google-analytics.com",
          "https://analytics.google.com"
        ],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "img-src": [
          "'self'", 
          "data:", 
          "https:",
          "https://www.googletagmanager.com"
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    },
  },
});
