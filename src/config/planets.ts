import type { PlanetConfig } from '../types/planet';

export const planets: Record<string, PlanetConfig> = {
  arb: {
    name: 'ARB',
    texturePath: '2k_ARB.jpg',
    position: [0, 0, 0],
    atmosphere: {
      color: [0.5, 0.5, 0.5],
      density: 0.2
    },
    colo: "no"
  },
  base: {
    name: 'BASE',
    texturePath: '2k_BASE.jpg',
    position: [5, 0, 0],
    atmosphere: {
      color: [0.0, 0.1, 0.8],
      density: 0.2
    },
    colo: "no"
  },
  bsc: {
    name: 'BSC',
    texturePath: '2k_BSC.jpg',
    position: [10, 0, 0],
    atmosphere: {
      color: [1.0, 1.0, 0.0],
      density: 0.2
    },
    colo: "no"
  },
  eth: {
    name: 'ETH',
    texturePath: '2k_ETH.jpg',
    position: [15, 0, 0],
    atmosphere: {
      color: [1.0, 1.0, 1.0],
      density: 0.2
    },
    colo: "no"
  },
  mult: {
    name: 'MULT',
    texturePath: '2k_EGOLD.jpg',
    position: [20, 0, 0],
    atmosphere: {
      color: [0.0, 0.8, 1.0],
      density: 0.2
    },
    colo: "no" // Set to "no" for MULT as requested
  },
  pol: {
    name: 'POL',
    texturePath: '2k_POL.jpg',
    position: [25, 0, 0],
    atmosphere: {
      color: [0.8, 0.0, 1.0],
      density: 0.2
    },
    colo: "yes"
  },
  sol: {
    name: 'SOL',
    texturePath: '2k_SOL.jpg',
    position: [30, 0, 0],
    atmosphere: {
      color: [1.0, 0.8, 0.9],
      density: 0.2
    },
    colo: "yes"
  },
  tron: {
    name: 'TRON',
    texturePath: '2k_TRON.jpg',
    position: [35, 0, 0],
    atmosphere: {
      color: [1.0, 0.0, 0.0],
      density: 0.2
    },
    colo: "no"
  }
};
