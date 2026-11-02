/**
 * Configuration and tunable parameters for The Bookshelf 3D experience.
 * All spatial units are in meters; all rotational units in radians or degrees as documented.
 */

export const CONFIG = {
  // Shelf dimensions & layout
  shelf: {
    bays: 4,
    totalWidth: 3.6, // meters
    totalHeight: 2.5, // meters
    totalDepth: 0.32, // meters
    shelvesPerBay: 7,
    shelfThickness: 0.022,
    uprightThickness: 0.032,
    plinthHeight: 0.12,
    crownHeight: 0.08,
    backPanelDepth: 0.012,
    woodColor: '#8a5a2b',
    woodRoughness: 0.42,
    woodMetalness: 0.05,
    shelfSagMax: 0.0025, // 2.5mm subtle realism sag
  },

  // Room geometry & surroundings
  room: {
    width: 6.4,
    height: 3.2,
    depth: 5.6,
    floorY: 0,
    wallColor: '#e9decb',
    baseboardHeight: 0.14,
    windowWidth: 2.0,
    windowHeight: 1.6,
    windowZ: 1.2, // On right wall (x > 0)
    windowY: 1.8,
  },

  // Camera settings
  camera: {
    restPosition: [0, 1.30, 5.3] as [number, number, number], // 5.3m gives ~72% shelf width
    restTarget: [0, 1.22, 0] as [number, number, number],
    restFov: 33, // Architectural 35mm equivalent
    filmOffsetY: 0.044, // Shift lens emulation so verticals stay parallel
    heldFov: 36,
    heldDistance: 0.64, // Distance from camera in meters
    heldTiltDeg: 6.5, // Tilted slightly toward viewer
    handheldSway: {
      freq: 0.22, // ~0.2 Hz gentle breathing sway
      rotAmp: 0.005, // 0.3 deg
      posAmp: 0.0018,
    },
    mouseParallax: {
      maxAngleDeg: 1.5,
      maxOffsetM: 0.03,
      damping: 0.05,
    },
  },

  // Animation Timings (in milliseconds)
  timings: {
    // Hover
    hoverSlideOut: 180, // ms
    hoverDistance: 0.008, // 8mm
    
    // Pull sequence (total ~2200ms)
    clickPressDuration: 120, // 0-120ms
    cameraDollyDuration: 900, // 0-900ms
    bookTiltStart: 300,
    bookTiltDuration: 800, // 300-1100ms
    bookTiltAngleDeg: 12.0, // 10-14 deg
    bookSlideDistance: 0.13, // 13cm along shelf normal
    bookTravelStart: 1100,
    bookTravelDuration: 1100, // 1100-2200ms
    bookLiftHeight: 0.024, // 2.4cm lift to clear shelf lip
    totalPullDuration: 2200, // total ms
    
    // Return sequence (~1600ms)
    returnDuration: 1600,
    
    // DOM Info panel delay after book settles
    infoPanelDelay: 320,

    // Reduced motion mode duration
    reducedMotionDuration: 400,
  },

  // Lighting & Temperature
  lighting: {
    sun: {
      color: 0xffeed4, // ~3200K warm golden hour sunlight
      intensity: 3.8,
      position: [4.8, 3.1, 1.2] as [number, number, number],
      shadowMapSize: 2048,
      shadowBias: -0.0004,
      shadowNormalBias: 0.02,
    },
    skyFill: {
      color: 0x93b5e8, // ~7000K soft blue window sky fill
      intensity: 0.75,
      position: [4.0, 2.5, 1.4] as [number, number, number],
    },
    ambient: {
      color: 0xffeedb,
      intensity: 0.4,
    },
    practicals: {
      shelfLamp: {
        pos: [-0.92, 1.05, 0.08] as [number, number, number],
        color: 0xffb154,
        intensity: 2.1,
        distance: 2.2,
      },
      floorLamp: {
        pos: [-2.4, 1.65, 1.5] as [number, number, number],
        color: 0xffcc84,
        intensity: 2.6,
        distance: 3.4,
      },
      sideLamp: {
        pos: [2.2, 1.15, 1.4] as [number, number, number],
        color: 0xffc472,
        intensity: 2.0,
        distance: 2.8,
      },
      candle: {
        pos: [0.12, 0.48, 2.65] as [number, number, number],
        color: 0xff8c22,
        intensity: 0.95,
        distance: 1.5,
        flickerFreq: 7.5,
        flickerAmp: 0.2,
      },
      fairyLights: {
        color: 0xffca68,
        count: 24,
      },
    },
  },

  // Atmosphere & Post-processing
  atmosphere: {
    dustMotesCount: 650,
    dustDriftSpeed: 0.04,
    dustThermalUpdraft: 0.015,
    bloomStrength: 0.42,
    bloomRadius: 0.55,
    bloomThreshold: 0.85,
    dofRestFocusDistance: 4.35,
    dofHeldFocusDistance: 0.44,
    vignetteOffset: 0.92,
    vignetteDarkness: 1.25,
    filmGrainIntensity: 0.035,
  },

  // Held book arcball inspection limits
  arcball: {
    maxYaw: Math.PI, // +/- 180 deg
    maxPitch: (60 * Math.PI) / 180, // +/- 60 deg
    zoomMin: 0.75,
    zoomMax: 1.25,
    inertiaDamping: 0.92,
  },
};
