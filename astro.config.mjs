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
  // Keep your original server setup - this works!
  output: "server", 
  site: "https://ssstiktok-life-eight.vercel.app",
  adapter: vercel(),
  
  // Add Astro's built-in i18n configuration (keep as-is)
  i18n: {
    defaultLocale: "en",
    locales: ["en", "it", "ar", "fr", "de", "es", "hi", "id", "ru", "pt", "ko", "tl", "nl", "ms", "tr"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  
  // Conservative Vite optimizations - minimal changes
  vite: {
    plugins: [tailwindcss()],
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
    
    // Keep your existing SSR config - this works!
    ssr: {
      external: ["@tobyg74/tiktok-api-dl"],
    },
    
    // Keep your existing optimizeDeps - this works!
    optimizeDeps: {
      exclude: ["@tobyg74/tiktok-api-dl"],
    },
    
    // Add minimal build optimizations only
    build: {
      // Basic minification
      minify: 'esbuild',
      // Remove console logs in production
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
      // Simple chunk splitting - don't break server code
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Only split client-side libraries
            if (id.includes('node_modules')) {
              if (id.includes('solid-js')) {
                return 'solid';
              }
              if (id.includes('alpinejs')) {
                return 'alpine';
              }
              // Don't split server-side dependencies
              return 'vendor';
            }
          }
        }
      }
    }
  },
  
  integrations: [
    // Keep your existing sitemap config
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
    
    // Keep your existing integrations
    alpinejs(),
    solidJs(),
    
    // Simplified PWA - fix the bundle size issue only
    AstroPWA({
      mode: "production",
      base: "/",
      scope: "/",
      includeAssets: ["favicon.ico"],
      registerType: "autoUpdate",
      manifest: {
        name: "Tiktokio - TikTok Downloader - Download TikTok Videos Without Watermark",
        short_name: "Tiktokio", // Fixed the short_name
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.webp",
            sizes: "192x192",
            type: "image/webp", // Fixed the type
          },
          {
            src: "pwa-512x512.webp",
            sizes: "512x512",
            type: "image/webp", // Fixed the type
          },
          {
            src: "maskable-icon-512x512.webp", // Use the correct maskable icon
            sizes: "512x512",
            type: "image/webp", // Fixed the type
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Fix the main issue - exclude large files from precaching
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        navigateFallback: "/404",
        globPatterns: ["*.js"], // Keep simple
        // Exclude large bundles from precaching
        globIgnores: [
          '**/node_modules/**/*',
          '**/admin/**/*',
          '**/*vendor*.js' // Exclude vendor bundles if they're large
        ]
      },
      devOptions: {
        enabled: false,
        navigateFallbackAllowlist: [/^\/404$/],
        suppressWarnings: true,
      },
    }),
    
    icon(),
  ],
  
  // Keep your existing markdown config
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, autolinkConfig],
    ],
  },
  
  // Keep your existing security config
  security: {
    csp: {
      directives: {
        "script-src": ["'self'", "https://acscdn.com", "https://pagead2.googlesyndication.com"],
        "connect-src": ["'self'", "https://tikwm.com", "https://acscdn.com"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://acscdn.com"],
      },
    },
  },
});
