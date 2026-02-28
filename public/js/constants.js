// public/js/constants.js
const C = {

  // --- CANVAS ---
  CANVAS_WIDTH:  1280,
  CANVAS_HEIGHT: 720,
  GROUND_Y:      580,

  // --- FISICA ---
  GRAVITY:            0.6,
  JUMP_FORCE_MIN:     -10,
  JUMP_FORCE_MAX:     -22,
  JUMP_CHARGE_MS_MAX: 600,
  JUMP_CHARGE_MS_MIN: 0,
  MAX_FALL_SPEED:     18,

  // --- VELOCITÀ GIOCO ---
  SPEED_INITIAL:    5,
  SPEED_MAX:        14,
  SPEED_INCREMENT:  0.0008,
  FPS_TARGET:       60,

  // --- PECORELLA ---
  SHEEP_X:          160,
  SHEEP_WIDTH:      90,
  SHEEP_HEIGHT:     90,
  SHEEP_HITBOX_X:   18,
  SHEEP_HITBOX_Y:   12,
  SHEEP_HITBOX_W:   54,
  SHEEP_HITBOX_H:   70,
  SHEEP_RUN_FRAMES: 4,
  SHEEP_RUN_FPS:    10,
  SQUISH_FACTOR_MAX: 0.25,

  // --- OSTACOLI ---
  OBSTACLE_SPAWN_DIST_MIN: 400,
  OBSTACLE_SPAWN_DIST_MAX: 800,
  OBSTACLE_POOL_SIZE:       10,

  OBSTACLES: {
    HAY:      { w: 70,  h: 55,  hbx: 8,  hby: 6,  hbw: 54, hbh: 44 },
    CAKE:     { w: 75,  h: 95,  hbx: 8,  hby: 8,  hbw: 58, hbh: 78 },
    MUSHROOM: { w: 80,  h: 85,  hbx: 10, hby: 10, hbw: 60, hbh: 68 },
    BUCKET:   { w: 55,  h: 60,  hbx: 6,  hby: 6,  hbw: 42, hbh: 48 },
    RAINBOW:  { w: 110, h: 115, hbx: 12, hby: 10, hbw: 86, hbh: 95 },
    SHEEP2:   { w: 85,  h: 80,  hbx: 10, hby: 8,  hbw: 64, hbh: 64 },
    CASTLE:   { w: 90,  h: 95,  hbx: 10, hby: 6,  hbw: 70, hbh: 80 },
    BOOKS:    { w: 70,  h: 110, hbx: 8,  hby: 8,  hbw: 54, hbh: 92 },
    RABBIT:   { w: 65,  h: 120, hbx: 8,  hby: 8,  hbw: 50, hbh: 104 },
    CACTUS:   { w: 60,  h: 70,  hbx: 10, hby: 6,  hbw: 40, hbh: 58 }
  },

  OBSTACLE_TIERS: {
    LOW:    ['HAY', 'BUCKET', 'CACTUS'],
    MEDIUM: ['CAKE', 'MUSHROOM', 'SHEEP2', 'CASTLE'],
    HIGH:   ['RAINBOW', 'BOOKS', 'RABBIT']
  },

  DIFFICULTY: [
    { time: 0,   tier: 'LOW' },
    { time: 10,  tier: 'MEDIUM' },
    { time: 25,  tier: 'HIGH' },
    { time: 40,  tier: 'ALL' }
  ],

  // Scala ostacoli in base al tempo (altezza e larghezza proporzionali)
  OBSTACLE_SCALE: [
    { time: 0,  min: 0.7,  max: 1.0  },
    { time: 15, min: 0.85, max: 1.25 },
    { time: 35, min: 1.0,  max: 1.5  },
    { time: 55, min: 1.15, max: 1.7  },
  ],

  // Distanza di spawn decrescente col tempo
  OBSTACLE_SPAWN: [
    { time: 0,  min: 500, max: 900 },
    { time: 20, min: 420, max: 750 },
    { time: 40, min: 340, max: 600 },
    { time: 60, min: 270, max: 500 },
  ],

  // --- PUNTEGGIO ---
  SCORE_PER_FRAME:         1,
  SCORE_PERFECT_JUMP:      5,
  SCORE_COMBO_BONUS:       20,
  COMBO_THRESHOLD:         5,

  MEDALS: [
    { name: 'Bronzo',      min: 200,  color: '#CD7F32' },
    { name: 'Argento',     min: 750,  color: '#C0C0C0' },
    { name: 'Oro',         min: 2000, color: '#FFD700' },
    { name: 'Arcobaleno',  min: 5000, color: 'rainbow' }
  ],

  SCENES: [
    { id: 'meadow',  name: 'Prato di Primavera',  unlockScore: 0    },
    { id: 'farm',    name: 'Fattoria Incantata',   unlockScore: 500  },
    { id: 'beach',   name: 'Spiaggia Arcobaleno',  unlockScore: 1500 },
    { id: 'forest',  name: 'Bosco delle Stelle',   unlockScore: 3000 }
  ],

  PARALLAX_LAYERS: [
    { id: 'sky',        speedRatio: 0.0  },
    { id: 'clouds',     speedRatio: 0.1  },
    { id: 'mountains',  speedRatio: 0.2  },
    { id: 'trees',      speedRatio: 0.5  },
    { id: 'ground',     speedRatio: 1.0  }
  ],

  // --- COLORI PALETTE ---
  COLORS: {
    meadow: {
      sky:        ['#87CEEB', '#B0E2FF'],
      ground:     '#5DBB63',
      groundDark: '#4A9950',
      path:       '#C8A96E'
    },
    farm: {
      sky:        ['#FFF4B8', '#FFD97D'],
      ground:     '#7BC67E',
      groundDark: '#5DA85F',
      path:       '#D4A85A'
    },
    beach: {
      sky:        ['#87D4F5', '#C5EEFF'],
      ground:     '#F5E6A3',
      groundDark: '#D4C47A',
      path:       '#E8D58A'
    },
    forest: {
      sky:        ['#1A1A3E', '#2D2B6B'],
      ground:     '#1A4A1A',
      groundDark: '#0F2E0F',
      path:       '#3A2A1A'
    },
    sheep: {
      wool:       '#F5F5F5',
      woolShadow: '#DCDCDC',
      face:       '#FFE0C8',
      eye:        '#2C1810',
      eyeWhite:   '#FFFFFF',
      nose:       '#FFB0A0',
      cheek:      '#FFCCD0',
      leg:        '#D4B896',
      mouth:      '#8B5A4A'
    },
    ui: {
      hudBg:        'rgba(255,255,255,0.85)',
      scoreText:    '#5A3E8C',
      comboText:    '#FF6B35',
      chargeFill:   '#FF9ECD',
      chargeEmpty:  '#E8E8E8',
      chargeBorder: '#CC7AAA',
      buttonBg:     '#FF9ECD',
      buttonText:   '#FFFFFF',
      buttonBorder: '#CC7AAA',
      gameoverBg:   'rgba(90, 62, 140, 0.85)',
      gameoverText: '#FFFFFF',
      medalBronze:  '#CD7F32',
      medalSilver:  '#C0C0C0',
      medalGold:    '#FFD700'
    }
  },

  // --- FONT ---
  FONT_TITLE:   'bold 52px "Fredoka One", "Nunito", cursive',
  FONT_SCORE:   'bold 28px "Fredoka One", "Nunito", cursive',
  FONT_HUD:     '22px "Fredoka One", "Nunito", cursive',
  FONT_BUTTON:  'bold 26px "Fredoka One", "Nunito", cursive',
  FONT_COMBO:   'bold 40px "Fredoka One", "Nunito", cursive',
  FONT_MESSAGE: 'bold 36px "Fredoka One", "Nunito", cursive',

  // --- STORAGE KEYS ---
  STORAGE_BEST:    'pecorella_best_score',
  STORAGE_UNLOCKS: 'pecorella_unlocked_scenes',
  STORAGE_MUTE:    'pecorella_mute',

  // --- MESSAGGI GAME OVER ---
  GAMEOVER_MESSAGES: [
    'Beeee! Quasi!',
    'Ohh! Riprova!',
    'Ahi ahi! Ci riesci!',
    'Beeee! Non mollare!',
    'Un altro tentativo!',
    'Sei bravissima! Ancora!',
    'Così vicina! Forza!',
    'Beeee! Sei forte!'
  ]
};
