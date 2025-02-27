import type { Pane } from "tweakpane";
import type { CustomUniforms } from "../webgl/settings/uniforms";

export function addLightControls(pane: Pane, uniforms: CustomUniforms) {
   const light = pane.addFolder({
      title: "Light",
      expanded: window.innerHeight > 800,
   });

   light
      .addBinding({ pos: { x: 1, y: 1 } }, "pos", {
         label: "Sun position",
         picker: "inline",
         expanded: true,
         y: { inverted: true, min: -1, max: 1 },
         x: { min: -1, max: 1 },
      })
      .on("change", ({ value: { x, y } }) => {
         uniforms.sunDirectionXY = [x, y];
      });

   // Set sun intensity to maximum and make it non-adjustable
   uniforms.uSunIntensity = 5; // Maximum value
   light.addBinding(
      { value: 1 }, // Always at maximum
      "value",
      {
         label: "Sun intensity",
         min: 1,
         max: 1,
         readonly: true, // Make it non-adjustable
      }
   );

   light
      .addBinding(
         { value: round(Math.pow(uniforms.uAmbientLight, 1 / 5)) },
         "value",
         {
            label: "Ambient light",
            min: 0,
            max: 1,
         }
      )
      .on("change", ({ value }) => {
         uniforms.uAmbientLight = Math.pow(value, 5);
      });
}

function round(n: number) {
   return Math.round(n * 100) / 100;
}