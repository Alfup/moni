/// <reference types="astro/client" />

declare module "*.glsl" {
   const shaderSource: string;
   export default shaderSource;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}