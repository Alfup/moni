import type { WebGLRenderer } from "four";
import type { CustomUniforms } from "../webgl/settings/uniforms";

export type ControlsOptions = {
   expanded?: boolean;
   planet?: {
     geometry?: boolean;
     terrain?: boolean;
     clouds?: boolean;
   };
};

export async function setupControls(
   {
      canvas: _canvas,
      uniforms: _uniforms,
      renderer: _renderer,
      defaultQuality: _defaultQuality
   }: {
      canvas: HTMLCanvasElement;
      uniforms: CustomUniforms;
      renderer?: WebGLRenderer;
      defaultQuality?: any;
   },
   _options?: ControlsOptions
) {
   // No controls needed anymore
   // This function is kept for compatibility
}