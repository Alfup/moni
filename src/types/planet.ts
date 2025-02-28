export interface PlanetConfig {
  name: string;
  texturePath: string;
  position: [number, number, number];
  atmosphere: {
    color: [number, number, number];
    density: number;
  };
  bumpStrength?: number;
  colo: "yes" | "no"; // New parameter to indicate if planet is colonized
}