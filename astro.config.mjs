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
  site: "https://ssstiktok-life-eight.vercel.app",
  // REMOVED: analytics and speedInsights to eliminate Google Analytics
  adapter: vercel(),
  
  // Build optimizations for better performance
  build: {
    inlineStylesheets: "always", // Force inline all CSS to prevent render blocking
  },
  
  // Add Astro's built-in i18n configuration
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
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
    
    // Enhanced build optimizations
    build: {
      target: 'es2020',
      minify: 'esbuild',
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
      cssCodeSplit: false, // Keep CSS together to reduce requests
      rollupOptions: {
        output: {
          manualChunks: {
            // Group critical scripts together
            'critical': ['solid-js'],
            'ui': ['alpinejs'],
            'vendor': ['@astrojs/solid-js']
          }
        }
      }
    }
  },
  
  integrations: [
    sitemap({
      filter(page) {
        const url = new URL(page, 'https://ssstiktok-life-eight.vercel.app');
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
    
    // Simplified PWA configuration
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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        navigateFallback: "/404",
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp}',
        ],
        globIgnores: [
          '**/node_modules/**/*',
          '**/admin/**/*'
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
  
  // Clean security configuration
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
