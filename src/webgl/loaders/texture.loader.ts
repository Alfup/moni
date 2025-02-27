import { type SamplerOptions, Texture, Sampler } from "four";
import type { TextureData } from "./texture.types";

// Remove the baseUrl prefix since assets will be in the root
export async function loadTexture(
   path: string,
   width: number,
   height: number,
   samplerOptions?: Partial<SamplerOptions>
) {
   try {
      const imageData = await fetch(`/${path}`);
      if (!imageData.ok) {
         throw new Error(`Failed to load texture: ${path}`);
      }
      const imageBlob = await imageData.blob();
      const bitmap = await createImageBitmap(imageBlob, {
         imageOrientation: "flipY",
      });

      return new Texture(
         bitmap,
         new Sampler({
            wrapS: "repeat",
            wrapT: "repeat",
            ...samplerOptions,
         })
      );
   } catch (error) {
      console.error(`Error loading texture ${path}:`, error);
      throw error;
   }
}

export async function loadTextures(texturesData: TextureData[]) {
   return Promise.all(
      texturesData.map(({ path, width = 2048, height = 1024, options }) =>
         loadTexture(path, width, height, options)
      )
   );
}