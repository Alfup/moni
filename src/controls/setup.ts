import type { WebGLRenderer } from "four";
import type { CustomUniforms } from "../webgl/settings/uniforms";

export type ControlsOptions = {
   expanded?: boolean;
};

export async function setupControls(
   {
      uniforms,
   }: {
      canvas: HTMLCanvasElement;
      uniforms: CustomUniforms;
      renderer?: WebGLRenderer;
      defaultQuality?: any;
   },
   options?: ControlsOptions
) {
   // No controls needed anymore
}