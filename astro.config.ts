import glsl from "vite-plugin-glsl";
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
   redirects: {
      "/": "/pol",
   },
   integrations: [tailwind()],
   vite: {
      plugins: [glsl()],
      build: {
         target: 'esnext',
         assetsDir: '.',  // Put assets in root of dist
         rollupOptions: {
            output: {
               assetFileNames: '[name][extname]'  // Keep original filenames
            }
         }
      },
      optimizeDeps: {
         exclude: ['four']
      },
      // Explicitly enable environment variables
      envPrefix: 'VITE_'
   },
   output: 'static',
   base: '/' // Serve from root path
});
