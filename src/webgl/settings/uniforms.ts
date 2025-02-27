export const defaultUniforms = {
   uTime: 0,
   uQuality: Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.5), // Lower quality on mobile
   uRotationSpeed: window.innerWidth < 768 ? 2 : 3, // Slower rotation on mobile
   uResolution: [window.innerWidth, window.innerHeight],
   uPlanetPosition: [0, 0, -10],
   uCameraPosition: [0, 0, window.innerWidth < 768 ? 7 : 6], // Adjust camera distance for mobile
   uRotationOffset: 0.6,
   uPlanetRadius: window.innerWidth < 768 ? 0.9 : 1, // Slightly smaller on mobile
   uBumpStrength: window.innerWidth < 768 ? 0.008 : 0.01, // Reduced bump mapping on mobile
   uNoiseStrength: 0.2,
   uTerrainScale: 0.8,
   uCloudsDensity: 0.5,
   uCloudsScale: 1,
   uCloudsSpeed: window.innerWidth < 768 ? 1 : 1.5, // Slower clouds on mobile
   uAtmosphereColor: [0.05, 0.3, 0.9],
   uAtmosphereDensity: window.innerWidth < 768 ? 0.25 : 0.3, // Reduced atmosphere on mobile
   uAmbientLight: 0.05,
   uSunIntensity: window.innerWidth < 768 ? 3 : 4, // Reduced sun intensity on mobile
   sunDirectionXY: [1, 1],
};