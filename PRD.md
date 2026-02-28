# PRD – Pecorella Saltarina
## Product Requirements Document — Specifica Tecnica Completa per Implementazione Autonoma
**Versione:** 2.0
**Data:** 2026-02-26
**Target utente finale:** Bambine dai 6 agli 10 anni (focus: 8 anni)
**Target lettore del documento:** Intelligenza artificiale incaricata di sviluppare l'intera applicazione in autonomia

---

## ISTRUZIONI PER L'AGENTE AI

Questo documento è autosufficiente. L'AI deve:
1. Leggere l'intero PRD prima di scrivere qualsiasi codice
2. Implementare **ogni sezione** senza omissioni
3. Generare tutta la grafica **programmaticamente via Canvas API** (nessun file immagine esterno)
4. Generare tutti i suoni **programmaticamente via Web Audio API** (nessun file audio esterno)
5. Usare **Node.js + Express** come server, con una singola pagina `index.html` servita come file statico
6. Il risultato finale deve essere un progetto che si avvia con `npm start` e funziona aprendo `http://localhost:3000`

---

## 1. STACK TECNOLOGICO

### 1.1 Runtime e Server

```
Runtime:        Node.js >= 18.x
Package manager: npm
Server:         Express 4.x
Porta:          3000
Entry point:    server.js
```

### 1.2 Dipendenze npm

```json
{
  "name": "pecorella-saltarina",
  "version": "1.0.0",
  "description": "Gioco endless-runner con pecorella per bambine",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 1.3 Struttura File di Progetto

```
pecorella-saltarina/
├── package.json
├── server.js
└── public/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        ├── main.js              ← entry point del gioco
        ├── Game.js              ← game loop e state machine
        ├── Sheep.js             ← classe personaggio
        ├── Obstacle.js          ← classe ostacoli
        ├── ParticleSystem.js    ← effetti particelle
        ├── AudioManager.js      ← Web Audio API
        ├── Renderer.js          ← tutte le funzioni di disegno Canvas
        ├── ScoreManager.js      ← punteggio e localStorage
        ├── InputManager.js      ← gestione input tastiera/touch
        ├── Background.js        ← parallax background
        └── constants.js         ← tutte le costanti di gioco
```

---

## 2. SERVER NODE.JS

### 2.1 server.js — Implementazione Completa

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Pecorella Saltarina in esecuzione su http://localhost:${PORT}`);
});
```

---

## 3. COSTANTI DI GIOCO (constants.js)

Tutte le costanti devono essere definite in un unico file e importate dagli altri moduli. Nessun "magic number" nel codice.

```javascript
// public/js/constants.js
const C = {

  // --- CANVAS ---
  CANVAS_WIDTH:  1280,
  CANVAS_HEIGHT: 720,
  GROUND_Y:      580,   // coordinata Y del suolo (pixel dall'alto)

  // --- FISICA ---
  GRAVITY:            0.6,     // accelerazione gravitazionale px/frame²
  JUMP_FORCE_MIN:     -10,     // velocità verticale per salto breve (px/frame)
  JUMP_FORCE_MAX:     -22,     // velocità verticale per salto lungo (px/frame)
  JUMP_CHARGE_MS_MAX: 600,     // ms massimi di carica oltre i quali non aumenta
  JUMP_CHARGE_MS_MIN: 0,       // ms minimi di carica
  MAX_FALL_SPEED:     18,      // velocità massima di caduta (px/frame)

  // --- VELOCITÀ GIOCO ---
  SPEED_INITIAL:    5,         // px/frame velocità iniziale degli ostacoli
  SPEED_MAX:        14,        // px/frame velocità massima
  SPEED_INCREMENT:  0.0008,    // incremento velocità per frame
  FPS_TARGET:       60,

  // --- PECORELLA ---
  SHEEP_X:          160,       // posizione X fissa della pecorella
  SHEEP_WIDTH:      90,        // larghezza sprite
  SHEEP_HEIGHT:     90,        // altezza sprite
  SHEEP_HITBOX_X:   18,        // offset X hitbox rispetto allo sprite
  SHEEP_HITBOX_Y:   12,        // offset Y hitbox rispetto allo sprite
  SHEEP_HITBOX_W:   54,        // larghezza hitbox
  SHEEP_HITBOX_H:   70,        // altezza hitbox
  SHEEP_RUN_FRAMES: 4,         // frame animazione corsa
  SHEEP_RUN_FPS:    10,        // frame per secondo animazione corsa
  SQUISH_FACTOR_MAX: 0.25,     // compressione verticale massima durante carica

  // --- OSTACOLI ---
  OBSTACLE_POOL_SIZE: 10,  // numero massimo di ostacoli attivi contemporaneamente

  // --- OSTACOLI: dimensioni base (width, height, hitbox ridotta) ---
  // La hitbox è intenzionalmente più piccola dello sprite (~20-25%)
  // Le dimensioni effettive vengono moltiplicate per `scale` al momento dello spawn
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

  // Classificazione tipo per spawn progressivo basato su tier
  OBSTACLE_TIERS: {
    LOW:    ['HAY', 'BUCKET', 'CACTUS'],
    MEDIUM: ['CAKE', 'MUSHROOM', 'SHEEP2', 'CASTLE'],
    HIGH:   ['RAINBOW', 'BOOKS', 'RABBIT']
  },

  // --- PROGRESSIONE DIFFICOLTÀ: tipo ostacolo (soglie in secondi) ---
  DIFFICULTY: [
    { time: 0,   tier: 'LOW' },
    { time: 10,  tier: 'MEDIUM' },
    { time: 25,  tier: 'HIGH' },
    { time: 40,  tier: 'ALL' }   // tutti i tipi possono apparire
  ],

  // --- PROGRESSIONE DIFFICOLTÀ: scala ostacolo (altezza e larghezza) ---
  // Ogni ostacolo viene disegnato con ctx.scale(scale, scale) e la sua
  // hitbox viene calcolata come def.hbx * scale, ecc.
  OBSTACLE_SCALE: [
    { time: 0,  min: 0.7,  max: 1.0  },  // piccoli/normali all'inizio
    { time: 15, min: 0.85, max: 1.25 },
    { time: 35, min: 1.0,  max: 1.5  },
    { time: 55, min: 1.15, max: 1.7  },  // molto grandi a regime
  ],

  // --- PROGRESSIONE DIFFICOLTÀ: distanza di spawn (px percorsi tra ostacoli) ---
  // La distanza decresce col tempo per aumentare la frequenza degli ostacoli
  OBSTACLE_SPAWN: [
    { time: 0,  min: 500, max: 900 },
    { time: 20, min: 420, max: 750 },
    { time: 40, min: 340, max: 600 },
    { time: 60, min: 270, max: 500 },
  ],

  // --- PUNTEGGIO ---
  SCORE_PER_FRAME:         1,     // punti ogni frame (dividere per 60 per avere pt/sec)
  SCORE_PERFECT_JUMP:      5,     // bonus salto preciso
  SCORE_COMBO_BONUS:       20,    // bonus ogni 5 ostacoli di fila superati
  COMBO_THRESHOLD:         5,     // ostacoli di fila per attivare combo

  MEDALS: [
    { name: 'Bronzo',      min: 200,  color: '#CD7F32' },
    { name: 'Argento',     min: 750,  color: '#C0C0C0' },
    { name: 'Oro',         min: 2000, color: '#FFD700' },
    { name: 'Arcobaleno',  min: 5000, color: 'rainbow' }
  ],

  // --- SCENARI SBLOCCABILI (soglie punteggio record) ---
  SCENES: [
    { id: 'meadow',  name: 'Prato di Primavera',  unlockScore: 0    },
    { id: 'farm',    name: 'Fattoria Incantata',   unlockScore: 500  },
    { id: 'beach',   name: 'Spiaggia Arcobaleno',  unlockScore: 1500 },
    { id: 'forest',  name: 'Bosco delle Stelle',   unlockScore: 3000 }
  ],

  // --- PARALLAX: velocità di ogni layer rispetto alla velocità di gioco ---
  PARALLAX_LAYERS: [
    { id: 'sky',        speedRatio: 0.0  },  // fermo
    { id: 'clouds',     speedRatio: 0.1  },
    { id: 'mountains',  speedRatio: 0.2  },
    { id: 'trees',      speedRatio: 0.5  },
    { id: 'ground',     speedRatio: 1.0  }
  ],

  // --- COLORI PALETTE ---
  COLORS: {
    // Prato di Primavera
    meadow: {
      sky:      ['#87CEEB', '#B0E2FF'],   // gradiente cielo
      ground:   '#5DBB63',
      groundDark: '#4A9950',
      path:     '#C8A96E'
    },
    // Fattoria
    farm: {
      sky:      ['#FFF4B8', '#FFD97D'],
      ground:   '#7BC67E',
      groundDark: '#5DA85F',
      path:     '#D4A85A'
    },
    // Spiaggia
    beach: {
      sky:      ['#87D4F5', '#C5EEFF'],
      ground:   '#F5E6A3',
      groundDark: '#D4C47A',
      path:     '#E8D58A'
    },
    // Bosco delle stelle
    forest: {
      sky:      ['#1A1A3E', '#2D2B6B'],
      ground:   '#1A4A1A',
      groundDark: '#0F2E0F',
      path:     '#3A2A1A'
    },
    // Pecorella
    sheep: {
      wool:     '#F5F5F5',
      woolShadow: '#DCDCDC',
      face:     '#FFE0C8',
      eye:      '#2C1810',
      eyeWhite: '#FFFFFF',
      nose:     '#FFB0A0',
      cheek:    '#FFCCD0',
      leg:      '#D4B896',
      mouth:    '#8B5A4A'
    },
    // UI
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

  // --- MESSAGGI GAME OVER (scelti casualmente) ---
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
```

---

## 4. GAME LOOP E STATE MACHINE (Game.js)

### 4.1 Stati del Gioco

```
States:
  'MENU'      → schermata iniziale, pecorella fa idle animation
  'PLAYING'   → gioco in corso
  'PAUSED'    → (non implementato in v1, riservato)
  'GAMEOVER'  → schermata fine partita con risultati
```

### 4.2 Transizioni

```
MENU      → PLAYING    : utente preme SPAZIO o clicca "GIOCA"
PLAYING   → GAMEOVER   : collisione pecorella-ostacolo rilevata
GAMEOVER  → PLAYING    : utente preme SPAZIO o clicca "RIPROVA"
GAMEOVER  → MENU       : utente clicca "CASA"
```

### 4.3 Game Loop (requestAnimationFrame)

Il loop deve usare un timestamp fisso delta-time per essere indipendente dal frame rate reale.

```javascript
// Pseudocodice del loop
function gameLoop(timestamp) {
  const delta = Math.min((timestamp - lastTimestamp) / (1000/60), 3); // cap a 3 frame
  lastTimestamp = timestamp;

  if (state === 'PLAYING') {
    InputManager.update();
    updatePhysics(delta);
    updateObstacles(delta);
    updateBackground(delta);
    updateParticles(delta);
    updateScore(delta);
    checkCollisions();
  }

  render();
  requestAnimationFrame(gameLoop);
}
```

---

## 5. FISICA DEL SALTO (InputManager.js + Sheep.js)

### 5.1 Logica di Carica

```javascript
// Evento keydown (Spacebar)
onSpaceDown(timestamp) {
  if (sheep.isOnGround && !isCharging) {
    isCharging = true;
    chargeStart = timestamp;
    // Avvia suono di carica AudioManager.playChargeSound()
    // Avvia animazione squish pecorella
  }
}

// Ogni frame mentre carica
updateCharge(timestamp) {
  if (isCharging) {
    chargeMs = Math.min(timestamp - chargeStart, C.JUMP_CHARGE_MS_MAX);
    chargeRatio = chargeMs / C.JUMP_CHARGE_MS_MAX; // 0.0 → 1.0
    // aggiorna barra di carica HUD
    // applica squish verticale alla pecorella: scaleY = 1 - C.SQUISH_FACTOR_MAX * chargeRatio
  }
}

// Evento keyup (Spacebar)
onSpaceUp(timestamp) {
  if (isCharging) {
    chargeMs = Math.min(timestamp - chargeStart, C.JUMP_CHARGE_MS_MAX);
    chargeRatio = chargeMs / C.JUMP_CHARGE_MS_MAX;
    jumpForce = C.JUMP_FORCE_MIN + (C.JUMP_FORCE_MAX - C.JUMP_FORCE_MIN) * chargeRatio;
    sheep.jump(jumpForce);
    isCharging = false;
    // AudioManager.playJumpSound(chargeRatio)
  }
}
```

### 5.2 Fisica Verticale Pecorella

```javascript
// Ogni frame in stato PLAYING
updatePhysics(delta) {
  if (!sheep.isOnGround) {
    sheep.vy += C.GRAVITY * delta;
    sheep.vy = Math.min(sheep.vy, C.MAX_FALL_SPEED);
    sheep.y += sheep.vy * delta;
  }

  const groundY = C.GROUND_Y - C.SHEEP_HEIGHT;
  if (sheep.y >= groundY) {
    sheep.y = groundY;
    sheep.vy = 0;
    if (!sheep.wasOnGround) {
      // atterraggio: spawn particelle polvere, AudioManager.playLandSound()
      sheep.triggerLandAnimation();
    }
    sheep.isOnGround = true;
  } else {
    sheep.isOnGround = false;
  }
  sheep.wasOnGround = sheep.isOnGround;
}
```

### 5.3 Bonus Salto Perfetto

Un salto è "perfetto" se il punto più alto del salto supera l'ostacolo di non più di 30 px.
```javascript
// Calcolo al momento del salto
const obstacleHeightPx = nextObstacle.height;
const requiredJumpHeight = obstacleHeightPx + 10; // margine minimo
const actualJumpHeight = calculateApex(jumpForce); // v²/2g
if (actualJumpHeight <= requiredJumpHeight + 30) {
  isPerfectJump = true; // assegna bonus quando l'ostacolo è superato
}
```

---

## 6. SISTEMA OSTACOLI (Obstacle.js)

### 6.1 Spawn Logic

```javascript
// L'Obstacle Manager tiene traccia di quando spawnare il prossimo ostacolo
// basandosi sulla distanza percorsa dall'ultimo ostacolo spawnato.
// La distanza di spawn e la scala diminuiscono/aumentano con il tempo (difficoltà crescente).

spawnNext() {
  const type = pickObstacleType();   // basato su DIFFICULTY[currentTier]
  const def  = C.OBSTACLES[type];
  const scale = getScale();          // scala random in base al tempo trascorso
  const x = C.CANVAS_WIDTH + 50;
  const y = C.GROUND_Y - def.h * scale;  // posizionamento a terra corretto
  return new Obstacle(type, x, y, def, scale);
}

// Sceglie il tipo di ostacolo in base al tier corrente
pickObstacleType() {
  const elapsed = (Date.now() - gameStartTime) / 1000;
  let allowedTiers = [];
  for (const d of C.DIFFICULTY) {
    if (elapsed >= d.time) allowedTiers = d.tier === 'ALL'
      ? ['LOW','MEDIUM','HIGH']
      : [d.tier];
  }
  const pool = allowedTiers.flatMap(t => C.OBSTACLE_TIERS[t]);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Calcola la scala dell'ostacolo in base al tempo trascorso
getScale() {
  const elapsed = (Date.now() - gameStartTime) / 1000;
  let range = C.OBSTACLE_SCALE[0];
  for (const s of C.OBSTACLE_SCALE) {
    if (elapsed >= s.time) range = s;
  }
  return range.min + Math.random() * (range.max - range.min);
}

// Calcola la distanza di spawn in base al tempo trascorso
randomDist() {
  const elapsed = (Date.now() - gameStartTime) / 1000;
  let range = C.OBSTACLE_SPAWN[0];
  for (const s of C.OBSTACLE_SPAWN) {
    if (elapsed >= s.time) range = s;
  }
  return range.min + Math.random() * (range.max - range.min);
}
```

**Nota:** `reset(gameStartTime)` deve impostare `this._gameStartTime` **prima** di chiamare `randomDist()`, altrimenti la prima distanza di spawn viene calcolata con il tempo sbagliato.

### 6.2 Movimento Ostacoli

```javascript
update(delta, speed) {
  this.x -= speed * delta;
  this.animTimer += delta;
  // animazione idle specifica per tipo (vedi sezione 6.3)
}
```

### 6.3 Animazioni Idle degli Ostacoli

Ogni ostacolo ha una piccola animazione in loop disegnata via Canvas:

| Ostacolo | Animazione Idle |
|---|---|
| HAY (Fieno) | L'uccellino sul fieno sale/scende di 3px con periodo 1s |
| CAKE (Torta) | Le candeline oscillano ±5° attorno alla base, alternati |
| MUSHROOM (Fungo) | Il fungo scala da 1.0 a 1.03 in su e giù (respiro) |
| BUCKET (Secchio) | La vernice che cola si allunga di 2px ogni 0.5s poi si resetta |
| RAINBOW (Arcobaleno) | I colori dell'arco ciclano con hue shift lento |
| SHEEP2 (Pecora2) | La Zzzz flotta su e svanisce in loop con opacity 0→1→0 |
| CASTLE (Castello) | La bandierina ruota ±10° in loop come se soffiasse il vento |
| BOOKS (Libri) | Un libro oscilla lievemente in cima alla pila |
| RABBIT (Coniglio) | Il coniglio oscilla sinistra/destra di 5px con periodo 0.6s |
| CACTUS (Cactus) | La farfalla vola in piccoli cerchi attorno al cactus |

---

## 7. DISEGNO GRAFICO VIA CANVAS API (Renderer.js)

**IMPORTANTE:** Tutta la grafica è disegnata con primitivi Canvas 2D. Nessuna immagine esterna.
Ogni funzione draw riceve `(ctx, x, y, options)`.

### 7.1 Pecorella — Disegno Dettagliato

```
Struttura sprite (90×90 px, pivot in basso al centro):

  [LANA - ellisse grande bianca]       cx=45, cy=32, rx=36, ry=28
  [LANA OMBRA - archi ombra grigio]    pattern di cerchietti sovrapposti
  [TESTA - cerchio crema]              cx=62, cy=22, r=18
  [OCCHIO SX - cerchio bianco]         cx=57, cy=18, r=5
  [OCCHIO SX - pupilla nera]           cx=58, cy=18, r=3
  [OCCHIO DX - cerchio bianco]         cx=68, cy=18, r=5
  [OCCHIO DX - pupilla nera]           cx=69, cy=18, r=3
  [NASO - ellisse rosa]                cx=65, cy=28, rx=5, ry=3
  [GUANCIA SX - cerchio rosa chiaro]   cx=57, cy=26, r=4, alpha=0.5
  [GUANCIA DX - cerchio rosa chiaro]   cx=73, cy=26, r=4, alpha=0.5
  [BOCCA - arco curvo]                 da (61,31) a (70,31) con control point (65,35)
  [ZAMPA ANT SX - rettangolo arrotond] x=28, y=62, w=12, h=22, r=4
  [ZAMPA ANT DX - rettangolo arrotond] x=44, y=62, w=12, h=22, r=4
  [ZAMPA POST SX - rettangolo arrotond]x=10, y=64, w=12, h=20, r=4
  [ZAMPA POST DX - rettangolo arrotond]x=60, y=64, w=12, h=20, r=4
  [CODA - cerchio piccolo bianco]      cx=8, cy=42, r=8
  [ORECCHIO SX - ellisse rosa/beige]   cx=53, cy=10, rx=5, ry=8, rotated -20°
  [ORECCHIO DX - ellisse rosa/beige]   cx=71, cy=10, rx=5, ry=8, rotated +20°
```

**Animazione Corsa (4 frame, 10 FPS):**
```
Frame 0: zampa ant SX avanti (+8px X, -4px Y), zampa post DX avanti
Frame 1: tutte le zampe al centro, lana schiacciata -2px Y
Frame 2: zampa ant DX avanti (+8px X, -4px Y), zampa post SX avanti
Frame 3: tutte le zampe al centro, lana alzata +2px Y
```

**Animazione Salto:**
- Occhi: pupille spostate in su di 2px, forma leggermente ovale verticale
- Bocca: aperta (cerchio piccolo invece di arco)
- Lana: compressa orizzontalmente (scaleX: 0.9), allungata verticalmente (scaleY: 1.15)
- Orecchie: ruotate verso l'esterno di 15° in più

**Animazione Atterraggio (dura 200ms):**
- Sprite schiacciato: scaleY: 0.7, scaleX: 1.3
- Torna gradualmente a 1.0 nel corso di 200ms con easing elastico

**Animazione Collisione:**
- Occhi: diventano × (due linee incrociate)
- Stelline: 5 particelle gialle che orbitano attorno alla testa
- Lana: leggermente grigia (opacity filter)

**Animazione Carica Salto (mentre si tiene premuto SPAZIO):**
- scaleY lineare da 1.0 a (1.0 - C.SQUISH_FACTOR_MAX) = 0.75
- scaleX lineare da 1.0 a 1.2 (si allarga mentre si abbassa)
- Guancine: diventano più intense (alpha da 0.3 a 0.8)
- Piccole particelle rosa che escono dai lati della lana

### 7.2 Ostacoli — Disegno Dettagliato

#### HAY — Pagliaio con Uccellino (70×55 px)
```
Base: ellisse #E8C84A, cx=35, cy=42, rx=33, ry=22
Fili di fieno: 8 linee diagonali giallo scuro #C8A820, spessore 2px
Uccellino (cx=35, cy=14):
  Corpo: ellisse #87CEEB cx=35 cy=18 rx=8 ry=6
  Testa: cerchio #87CEEB cx=41 cy=13 r=5
  Becco: triangolo arancione piccolo a dx della testa
  Occhio: punto nero a cx=42 cy=12 r=1.5
  Ala: arco #6AB0D8 sotto il corpo
```

#### CAKE — Torta di Compleanno (75×95 px)
```
Piano inferiore: rettangolo arrotondato #FF9ECD, x=5 y=60 w=65 h=25 r=5
Piano medio:     rettangolo arrotondato #FFCCE8, x=12 y=38 w=51 h=26 r=5
Piano superiore: rettangolo arrotondato #FFE8F5, x=20 y=20 w=35 h=22 r=5
Glassa: onde bianche sinusoidali sui bordi superiori di ogni piano
Candeline (3): rettangoli #FFFACD w=4 h=12, fiamma ellittica #FF6B35
Decorazioni: puntini colorati sui piani (polka dots)
```

#### MUSHROOM — Fungo Felice (80×85 px)
```
Gambo: rettangolo arrotondato bianco crema x=25 y=52 w=30 h=33 r=6
Cappello: arco/semicerchio rosso #FF4444 con rx=37 ry=40, apex a cy=12
Pois: 5 cerchi bianchi di r=5..8 sparsi sul cappello
Faccia sul cappello: 2 occhi ovali neri, bocca sorridente arco
```

#### BUCKET — Secchio Rovesciato (55×60 px)
```
Corpo secchio (rovesciato): trapezio #4A9BFF più largo in basso
  punti: (8,10) (47,10) (52,48) (3,48)
Bordo superiore (in basso): rettangolo arrotondato #3A7BE8
Vernice che cola: 3 rivoli sinuosi di colori diversi (#FF6B35, #FF9ECD, #7BC67E)
  che scendono dalla parte larga (basso del secchio rovesciato)
  lunghezza aumenta nel tempo (animazione), max 30px
Manico: arco #3A7BE8 che fuoriesce dal fondo (ora in alto) del secchio
```

#### RAINBOW — Arcobaleno di Caramelle (110×115 px)
```
Arco principale: 7 archi concentrici (r da 50 a 20) con colori
  #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #8B00FF, #FF69B4
Leccalecca: 6 cerchi colorati r=7 con bastoncini bianchi w=2 h=15
  posizionati lungo la curva dell'arco a intervalli regolari
Stelle: 4 stelle a 5 punte #FFD700 di r=6 ai lati
Nuvoline bianche ai piedi dell'arco (due ellissi morbide)
```

#### SHEEP2 — Pecora Addormentata (85×80 px)
```
Disegna la stessa pecorella (funzione riusabile) ma con:
  - Occhi: chiusi (due archi orizzontali)
  - Corpo: leggermente inclinato -5° (sembra sdraiarsi)
  - Zzzz: testo "Zzz" in blu chiaro che flotta verso l'alto
    con opacity 0→1→0 in loop 1.5s, offset Y -10→-30px
```

#### CASTLE — Castello di Sabbia (90×95 px)
```
Torre centrale: rettangolo #F5E6A3 x=30 y=25 w=30 h=60
Merlature: 3 rettangoli #F5E6A3 w=8 h=10 sulla cima della torre
Torrette laterali: 2 rettangoli #F0DC90 x=5,x=75 y=40 w=18 h=45
Porta: arco #8B6914 al centro basso della torre
Bandierina: rettangolo rosso #FF4444 con bastone nero
  ruota ±10° attorno al punto di attacco (animazione vento)
Dettagli: finestre quadrate, sassi texturizzati
```

#### BOOKS — Pila di Libri (70×110 px)
```
Libri impilati dal basso verso l'alto, ognuno con:
  w: da 65 a 40px (si restringono verso l'alto), h=18px
  Colori: #FF6B35, #4A9BFF, #7BC67E, #FF9ECD, #A855F7, #FFD700
  Bordo: linea scura -1px su tutti i lati
  Titolo: riga orizzontale bianca al centro (finge testo)
Il libro più in cima (il 6°) oscilla ±8° come stesse cadendo
```

#### RABBIT — Coniglio Ballerino (65×120 px)
```
Zampe: 2 ellissi rosate in basso
Corpo: ellisse bianca grande cx=32 cy=90 rx=22 ry=28
Testa: cerchio bianco cx=32 cy=55 r=18
Orecchie: 2 ellissi allungate verticali bianche con interno rosa
  SX: cx=22 cy=22 rx=7 ry=22    DX: cx=42 cy=22 rx=7 ry=22
Occhi: grandi, espressivi, con highlights bianchi
Naso: triangolo rovesciato rosa piccolo
Baffi: 3 linee per lato
Papillon: forma farfalla #FF9ECD sul collo
Braccia: 2 archi che mimano il ballo (oscillano con il corpo)
Corpo oscilla sinistra/destra ±5px, periodo 0.6s
```

#### CACTUS — Cactus Fiorito (60×70 px)
```
Fusto: rettangolo arrotondato verde #5DBB63 x=20 y=20 w=20 h=48 r=6
Bracci: 2 bracci laterali (ellissi verdi orizzontali) a cy=38
Spine: 6 linee sottili verde scuro sui bordi del fusto e bracci
Fiore enorme: in cima al fusto
  petali: 6 ellissi rosa #FF9ECD ruotate attorno al centro
  centro: cerchio giallo #FFD700 r=6
Farfalla: 4 petali/ali (2 grandi, 2 piccole) in #FF9ECD
  vola in cerchio di r=15 attorno al fiore, periodo 2s
```

### 7.3 Background Parallax — Scenario "Prato di Primavera"

#### Layer 0 — Cielo (velocità 0, fermo)
```
Gradiente verticale: #87CEEB (alto) → #B0E2FF (basso)
Sole: cx=100, cy=80, r=45
  Corpo: gradiente radiale #FFD700→#FFEB3B
  Faccia: occhi circolari #8B6914, sorriso arco
  Raggi: 8 linee #FFD700 lunghe 20px attorno al bordo
  Animazione: il sole ruota lentamente (1 giro ogni 30s)
```

#### Layer 1 — Nuvole (velocità 0.1)
```
3 nuvole di diverse dimensioni, posizioni Y variabili tra 60-200px
Nuvoletta = 5-7 cerchi bianchi sovrapposti in disposizione orizzontale
Opacity: 0.9
Quando escono dallo schermo a sinistra, riappaiono a destra
```

#### Layer 2 — Montagne/Colline lontane (velocità 0.2)
```
2-3 colline ondulate in #4CAF50 opacità 0.4 (lontane)
Disegnate come percorso sinusoidale riempito
```

#### Layer 3 — Alberi / Cespugli (velocità 0.5)
```
Alberi stilizzati (tronco + chioma circolare) in #2E7D32
Cespugli rotondi in #43A047
Sparsi a intervalli irregolari
```

#### Layer 4 — Terreno e Percorso (velocità 1.0 = velocità gioco)
```
Striscia di erba: rettangolo #5DBB63, y=C.GROUND_Y, h=140
  Bordo superiore irregolare: onda sinusoidale ±5px
Percorso (sentiero): rettangolo #C8A96E, y=C.GROUND_Y+10, h=60
  con texture: tratti orizzontali #B89A5E ogni 40px (sbiaditi)
Fiori: cerchi colorati r=4 sparsi sull'erba, animazione oscillazione ±3px
```

### 7.4 HUD (Heads-Up Display)

```
Canvas position: overlay sopra il gioco

PUNTEGGIO (top-left):
  Rettangolo arrotondato #FFFFFFCC, x=10 y=10 w=200 h=44 r=10
  Testo "Punteggio: 342" in FONT_HUD, colore #5A3E8C

RECORD (top-right):
  Rettangolo arrotondato #FFFFFFCC, x=CANVAS_WIDTH-210 y=10 w=200 h=44 r=10
  Icona trofeo (disegnata): stella #FFD700 r=10
  Testo "Record: 1250" in FONT_HUD

BARRA CARICA SALTO (bottom-left):
  Etichetta "💨 Carica" in FONT_HUD y=680
  Rettangolo esterno (bordo): x=10 y=690 w=200 h=22 r=8 stroke #CC7AAA
  Rettangolo interno (vuoto): fill #E8E8E8
  Rettangolo riempimento: fill gradiente #FF9ECD→#FF69B4, w=200*chargeRatio
  Effetto glow quando chargeRatio > 0.8: shadowBlur=10 shadowColor=#FF69B4

ICONA MUTO (top-center):
  Cerchio #FFFFFFCC r=20 cx=CANVAS_WIDTH/2 cy=30
  Nota musicale o X se muto
  Click/tap per toggle muto

MESSAGGIO COMBO (centro schermo, temporaneo 1.5s):
  "+COMBO! x5" in FONT_COMBO, colore #FF6B35
  Con ombra gialla, animazione: scale da 1.5→1.0 in 300ms poi fade out
```

### 7.5 Schermata Iniziale

```
Background: stesso scenario prato (animato, in loop)
Pecorella: posizione centrale-bassa, fa animazione idle (su/giù ±10px, periodo 1.5s)

Titolo "PECORELLA SALTARINA":
  y=150, centrato
  Font: FONT_TITLE
  Colore: #FFFFFF con textShadow #5A3E8C spessore 4px
  Animazione: oscillazione lieve ±3px Y, periodo 2s

Pulsante "GIOCA!":
  rettangolo arrotondato #FF9ECD, x=540 y=360 w=200 h=60 r=20
  Bordo: #CC7AAA spessore 3px
  Testo: "▶ GIOCA!" FONT_BUTTON #FFFFFF
  Hover (mouseenter): scale 1.05, colore #FF69B4
  Animazione: pulse (scale 1.0→1.02→1.0, periodo 1s)

Record:
  "🏆 Record: 1250 pt" FONT_HUD #FFD700 con ombra nera
  y=470, centrato

Istruzione:
  "Premi SPAZIO o clicca per iniziare" FONT_HUD #FFFFFF alpha=0.8
  y=520
  Animazione: blink opacity 1→0.4→1 periodo 1.2s

Scenari sbloccati (bottom-center):
  Icone piccole (40x30px) degli scenari sbloccati, in grigio se bloccati
```

### 7.6 Schermata Game Over

```
Pannello centrale: rettangolo arrotondato rgba(90,62,140,0.92)
  x=290 y=160 w=700 h=400 r=24
  Bordo: #FF9ECD spessore 3px

Pecorella stordita (top del pannello, sopra il bordo):
  Animazione collisione (occhi a X, stelline rotanti)
  Stelline: 5 particelle #FFD700 r=6 che orbitano con r_orbit=40, periodo 1.5s

Messaggio casuale (es. "Beeee! Quasi!"):
  FONT_MESSAGE #FFCCE8, y_rel=60

Punteggio:
  "Punteggio" FONT_HUD #FFFFFF alpha=0.8 y_rel=120
  Valore punteggio: FONT_TITLE #FFFFFF y_rel=155

Record (se nuovo record: animazione coriandoli):
  "Miglior punteggio: 1250 pt" FONT_HUD #FFD700 y_rel=210

Medaglia (se raggiunta):
  Cerchio colorato con bordo r=35, colore della medaglia
  Nome medaglia dentro: FONT_SCORE colore corrispondente
  y_rel=260
  Se medaglia Arcobaleno: animazione hue shift continuo

Pulsanti:
  "🔄 RIPROVA!" x_rel=130 y_rel=330 w=180 h=50 #FF9ECD
  "🏠 CASA"     x_rel=390 y_rel=330 w=180 h=50 #7BC67E
```

---

## 8. SISTEMA PARTICELLE (ParticleSystem.js)

### 8.1 Classe Particle

```javascript
class Particle {
  constructor(x, y, vx, vy, color, size, lifetime, type) {}
  // type: 'circle' | 'star' | 'confetti' | 'dust'
}
```

### 8.2 Effetti da Implementare

| Effetto | Trigger | Particelle | Comportamento |
|---|---|---|---|
| **Polvere atterraggio** | Sheep atterra | 6 cerchi grigi r=3-6 | Si spargono orizzontalmente con gravity ridotta, fade out 400ms |
| **Stella combo** | Combo raggiunto | 12 stelle #FFD700 | Esplodono dal centro, ruotano, fade out 800ms |
| **Coriandoli record** | Nuovo record | 40 rettangoli colorati | Cadono dall'alto con rotazione casuale, 3 secondi |
| **Cuoricini** | Ogni 10 ostacoli superati | 5 cuori rosa r=8 | Salgono flottando, fade out 1s |
| **Particelle carica** | Carica > 50% | 2 cerchi rosa per frame | Escono dai lati, vida breve 200ms |
| **Esplosione collisione** | Game over | 8 stelle #FF6B35 | Esplodono dal punto di impatto |

### 8.3 Update Particelle

```javascript
update(delta) {
  this.x += this.vx * delta;
  this.y += this.vy * delta;
  this.vy += this.gravity * delta;
  this.life -= delta;
  this.alpha = Math.max(0, this.life / this.maxLife);
  this.rotation += this.rotationSpeed * delta;
}
```

---

## 9. SISTEMA AUDIO (AudioManager.js)

**IMPORTANTE:** Tutti i suoni sono generati con Web Audio API. Nessun file audio esterno.
Il contesto AudioContext deve essere creato dopo il primo gesto utente (click/keypress) per rispettare le policy browser.

### 9.1 Funzioni Suono da Implementare

```javascript
class AudioManager {
  constructor() {
    this.ctx = null; // creato al primo input utente
    this.muted = false;
    this.masterGain = null;
  }

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
  }

  // Suono base: oscillatore con envelope
  playTone(frequency, type, duration, gainPeak, startTime=0) { ... }

  // ---- SUONI SPECIFICI ----

  playJumpSound(chargeRatio) {
    // Sweep verso l'alto: freq da 200 a 600+400*chargeRatio Hz in 150ms
    // Tipo: 'sine', gain 0.3
  }

  playLandSound() {
    // Breve "thud": noise bianco filtrato passa-basso, duration 80ms
    // oppure sine a 120Hz con decay rapido
  }

  playChargeSound(chargeRatio) {
    // Tono continuo che sale: freq = 150 + chargeRatio*400 Hz
    // Chiamato ogni frame mentre si carica, gestione oscillatore persistente
  }

  stopChargeSound() {
    // Ferma l'oscillatore della carica
  }

  playObstacleClear() {
    // Nota gioiosa: arpeggio do-mi-sol (261, 329, 392 Hz)
    // Ogni nota dura 80ms, in sequenza
  }

  playCollision() {
    // "Beeee": glide da 300→200 Hz su 300ms, tipo 'sawtooth' con vibrato
    // Poi rumore basso 80ms
  }

  playCombo() {
    // Fanfara: 4 note ascendenti veloci (392, 494, 587, 784 Hz)
    // Ognuna 100ms, tipo 'square' smussato
  }

  playNewRecord() {
    // Melodia vittoria: do-mi-sol-do' (261,329,392,523 Hz) poi accordo finale
    // Durata totale ~1.5s
  }

  playMenuMusic() {
    // Loop melodia leggera: sequenza di 8 note in loop
    // Usa ScriptProcessorNode o ScheduleAhead pattern
    // BPM: 90, scala maggiore, tipo 'sine'
  }

  stopMenuMusic() { ... }

  setMute(muted) {
    this.muted = muted;
    this.masterGain.gain.value = muted ? 0 : 0.5;
    localStorage.setItem(C.STORAGE_MUTE, muted);
  }
}
```

---

## 10. SCORE MANAGER (ScoreManager.js)

```javascript
class ScoreManager {
  constructor() {
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem(C.STORAGE_BEST) || '0');
    this.combo = 0;
    this.obstaclesClearedInRow = 0;
    this.isNewRecord = false;
  }

  update(delta) {
    this.score += C.SCORE_PER_FRAME * delta;
  }

  onObstacleCleared(isPerfect) {
    this.obstaclesClearedInRow++;
    if (isPerfect) this.score += C.SCORE_PERFECT_JUMP;
    if (this.obstaclesClearedInRow % C.COMBO_THRESHOLD === 0) {
      this.score += C.SCORE_COMBO_BONUS;
      this.combo++;
      return 'COMBO'; // segnale al Game per mostrare l'animazione
    }
    return null;
  }

  onCollision() {
    const finalScore = Math.floor(this.score);
    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;
      localStorage.setItem(C.STORAGE_BEST, this.bestScore);
      this.isNewRecord = true;
    }
    // Check e sblocco scenari
    this.checkSceneUnlocks(finalScore);
    return finalScore;
  }

  checkSceneUnlocks(score) {
    const unlocked = JSON.parse(localStorage.getItem(C.STORAGE_UNLOCKS) || '["meadow"]');
    for (const scene of C.SCENES) {
      if (score >= scene.unlockScore && !unlocked.includes(scene.id)) {
        unlocked.push(scene.id);
      }
    }
    localStorage.setItem(C.STORAGE_UNLOCKS, JSON.stringify(unlocked));
  }

  getMedal(score) {
    let medal = null;
    for (const m of C.MEDALS) {
      if (score >= m.min) medal = m;
    }
    return medal;
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.obstaclesClearedInRow = 0;
    this.isNewRecord = false;
  }
}
```

---

## 11. INPUT MANAGER (InputManager.js)

```javascript
class InputManager {
  constructor() {
    this.spaceDown = false;
    this.spaceDownTime = 0;
    this.spaceJustReleased = false;
    this.releaseChargeMs = 0;
    this.mouseClickX = -1;
    this.mouseClickY = -1;
  }

  init() {
    document.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.spaceDown) {
          this.spaceDown = true;
          this.spaceDownTime = performance.now();
        }
      }
    });
    document.addEventListener('keyup', e => {
      if (e.code === 'Space') {
        this.spaceJustReleased = true;
        this.releaseChargeMs = performance.now() - this.spaceDownTime;
        this.spaceDown = false;
      }
    });
    // Click e Touch per mobile e pulsanti UI
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      this.mouseClickX = (e.clientX - rect.left) * (C.CANVAS_WIDTH / rect.width);
      this.mouseClickY = (e.clientY - rect.top) * (C.CANVAS_HEIGHT / rect.height);
    });
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      this.spaceDown = true;
      this.spaceDownTime = performance.now();
    });
    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      this.spaceJustReleased = true;
      this.releaseChargeMs = performance.now() - this.spaceDownTime;
      this.spaceDown = false;
    });
  }

  // Chiamato a fine frame per resettare eventi one-shot
  flush() {
    this.spaceJustReleased = false;
    this.mouseClickX = -1;
    this.mouseClickY = -1;
  }

  getChargeRatio(now) {
    if (!this.spaceDown) return 0;
    const ms = Math.min(now - this.spaceDownTime, C.JUMP_CHARGE_MS_MAX);
    return ms / C.JUMP_CHARGE_MS_MAX;
  }
}
```

---

## 12. INDEX.HTML — STRUTTURA BASE

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pecorella Saltarina</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="game-container">
    <canvas id="gameCanvas" width="1280" height="720"></canvas>
  </div>

  <!-- Script in ordine di dipendenza -->
  <script src="js/constants.js"></script>
  <script src="js/AudioManager.js"></script>
  <script src="js/InputManager.js"></script>
  <script src="js/ScoreManager.js"></script>
  <script src="js/ParticleSystem.js"></script>
  <script src="js/Renderer.js"></script>
  <script src="js/Background.js"></script>
  <script src="js/Sheep.js"></script>
  <script src="js/Obstacle.js"></script>
  <script src="js/Game.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

---

## 13. CSS (style.css)

```css
/* Reset e layout base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #1A1A2E;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Fredoka One', cursive;
}

#game-container {
  position: relative;
  width: 1280px;
  max-width: 100vw;
}

#gameCanvas {
  display: block;
  width: 100%;
  /* Mantiene aspect ratio 16:9 */
  aspect-ratio: 16/9;
  image-rendering: pixelated;
  cursor: pointer;
  border-radius: 12px;
  box-shadow: 0 0 40px rgba(255,158,205,0.4);
}

/* Responsive scaling */
@media (max-width: 1280px) {
  #game-container { width: 100vw; }
}
```

---

## 14. MAIN.JS — ENTRY POINT

```javascript
// public/js/main.js
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const game = new Game(canvas, ctx);
  game.init();
  game.start();
});
```

---

## 15. FLUSSO COMPLETO DI UNA PARTITA

```
1. Utente apre http://localhost:3000
2. Caricamento pagina: index.html carica CSS e tutti i JS in <1s
3. window.load → main.js crea Game → Game.init()
   - Crea tutti i manager (Input, Audio, Score, Particles)
   - Registra tutti gli event listener
   - Imposta stato: 'MENU'
   - Avvia requestAnimationFrame loop
4. MENU: disegna schermata iniziale, pecorella idle, musichetta
5. Utente preme SPAZIO o clicca GIOCA
   - AudioManager.init() (crea AudioContext al primo gesto)
   - AudioManager.stopMenuMusic()
   - Stato → 'PLAYING'
   - ScoreManager.reset()
   - Spawn primo ostacolo
6. PLAYING loop:
   a. Input.update(): controlla spazio premuto/rilasciato
   b. Se spazio premuto: avvia carica, aggiorna barra HUD, squish pecorella
   c. Se spazio rilasciato: calcola forceRatio, sheep.jump(force), playJumpSound
   d. Sheep.update(): applica gravità, aggiorna posizione Y, gestisce atterraggio
   e. Obstacles.update(): muovi ostacoli a sinistra, controlla uscita schermo
   f. Spawn.check(): se distanza dall'ultimo ostacolo > randomDist → spawn nuovo
   g. Collision.check(): AABB tra hitbox pecorella e hitbox ogni ostacolo
      - Se collisione: stato → 'GAMEOVER', playCollision(), spawnExplosion()
      - Se ostacolo uscito a sinistra senza collisione: onObstacleCleared()
   h. Score.update(delta)
   i. Particles.update(delta)
   j. Background.update(delta, speed)
   k. Renderer.drawAll()
7. GAMEOVER:
   - ScoreManager.onCollision() → calcola medaglia, controlla record
   - Se nuovo record: playNewRecord(), spawnCoriandoli()
   - Disegna schermata game over con animazioni
8. Utente clicca RIPROVA → stato → 'PLAYING' (goto 6)
   Utente clicca CASA → stato → 'MENU' (goto 4)
```

---

## 16. COLLISION DETECTION

```javascript
// AABB (Axis-Aligned Bounding Box)
function checkCollision(sheep, obstacle) {
  const sx = sheep.x + C.SHEEP_HITBOX_X;
  const sy = sheep.y + C.SHEEP_HITBOX_Y;
  const sw = C.SHEEP_HITBOX_W;
  const sh = C.SHEEP_HITBOX_H;

  // Hitbox scalata: pre-calcolata nel costruttore di Obstacle come def.hb* * scale
  const ox = obstacle.x + obstacle.shbx;
  const oy = obstacle.y + obstacle.shby;
  const ow = obstacle.shbw;
  const oh = obstacle.shbh;

  return sx < ox + ow &&
         sx + sw > ox &&
         sy < oy + oh &&
         sy + sh > oy;
}
```

**Tolleranza:** le hitbox sono intenzionalmente più piccole degli sprite del 20-25% per rendere il gioco "generoso" e non frustrante per una bambina.

**Scala visiva vs. hitbox:** il disegno viene scalato tramite `ctx.scale(scale, scale)` nel metodo `draw()`. Le proprietà scalate `sw`, `sh`, `shbx`, `shby`, `shbw`, `shbh` sono calcolate una volta nel costruttore di `Obstacle` e riutilizzate per collision detection, off-screen check e obstacle-cleared check.

---

## 17. VELOCITÀ E PROGRESSIONE DIFFICOLTÀ

La difficoltà cresce su tre assi indipendenti e simultanei:

### 17.1 Velocità di gioco

```javascript
// In Game.update(delta)
this.speed = Math.min(
  C.SPEED_INITIAL + (this.frameCount * C.SPEED_INCREMENT),
  C.SPEED_MAX
);
// frameCount si azzera ad ogni reset
```

| Tempo (sec) | Velocità approssimativa (px/frame) |
|---|---|
| 0 | 5 |
| 30 | 6.4 |
| 60 | 7.9 |
| 120 | 10.7 |
| 180 | 13.5 |
| ~235 | 14 (max) |

### 17.2 Tipo di ostacolo (tier)

| Tempo (sec) | Tier attivi |
|---|---|
| 0 – 10 | LOW (Fieno, Secchio, Cactus) |
| 10 – 25 | MEDIUM (Torta, Fungo, Pecora2, Castello) |
| 25 – 40 | HIGH (Arcobaleno, Libri, Coniglio) |
| 40+ | ALL (tutti i tipi) |

### 17.3 Scala ostacolo (altezza e larghezza)

Ogni ostacolo riceve una scala casuale nell'intervallo corrente. La scala si applica sia al disegno (`ctx.scale`) che alle hitbox (valori pre-moltiplicati nel costruttore).

| Tempo (sec) | Scala min | Scala max |
|---|---|---|
| 0 – 15 | 0.7× | 1.0× |
| 15 – 35 | 0.85× | 1.25× |
| 35 – 55 | 1.0× | 1.5× |
| 55+ | 1.15× | 1.7× |

### 17.4 Frequenza di spawn (distanza tra ostacoli)

La distanza percorsa tra uno spawn e il successivo diminuisce nel tempo.

| Tempo (sec) | Distanza min (px) | Distanza max (px) |
|---|---|---|
| 0 – 20 | 500 | 900 |
| 20 – 40 | 420 | 750 |
| 40 – 60 | 340 | 600 |
| 60+ | 270 | 500 |

---

## 18. RESPONSIVE E SCALING

Il canvas è sempre 1280×720 internamente. Il CSS lo scala tramite `width: 100%` + `aspect-ratio: 16/9`.
L'InputManager deve correggere le coordinate mouse/touch usando:
```javascript
const scaleX = C.CANVAS_WIDTH / canvas.getBoundingClientRect().width;
const scaleY = C.CANVAS_HEIGHT / canvas.getBoundingClientRect().height;
```

---

## 19. GESTIONE ERRORI E EDGE CASE

| Caso | Comportamento |
|---|---|
| AudioContext bloccato (policy browser) | init() viene ritardato fino al primo gesto; nessun crash |
| localStorage non disponibile | Usare try/catch, fallback a variabili in memoria |
| Font Google non caricata | Fallback a `cursive` (già in font-family) |
| requestAnimationFrame non disponibile | Impossibile: tutti i browser moderni lo supportano |
| Delta time > 200ms (tab in background) | Cap a 3 frame: `delta = Math.min(rawDelta, 3)` per evitare tunneling |
| Ostacolo spawn fuori schermo | Clamping a x = C.CANVAS_WIDTH + 100 |

---

## 20. CRITERI DI ACCETTAZIONE FINALI

### Funzionali
- [ ] `npm start` avvia il server sulla porta 3000 senza errori
- [ ] La pagina si carica e il canvas è visibile in meno di 3 secondi
- [ ] La pecorella corre automaticamente e l'animazione è fluida (≥ 55 FPS)
- [ ] La barra spaziatrice registra pressione breve/media/lunga con 3 livelli di salto percepibilmente diversi
- [ ] La barra di carica HUD si riempie in tempo reale mentre si preme SPAZIO
- [ ] La pecorella non può saltare mentre è già in aria
- [ ] Tutti e 10 i tipi di ostacolo appaiono entro 40 secondi di gioco
- [ ] La collisione termina il gioco correttamente
- [ ] Il punteggio si incrementa ogni frame e viene salvato in localStorage
- [ ] Il record persiste al refresh della pagina
- [ ] La schermata di game over mostra punteggio, record e medaglia corretti
- [ ] I pulsanti RIPROVA e CASA funzionano
- [ ] Il pulsante muto silenzia tutti i suoni
- [ ] I suoni sono generati senza file esterni
- [ ] La grafica è generata senza file immagine esterni
- [ ] Touch/click sul canvas funziona come alternativa alla barra spaziatrice

### Non Funzionali
- [ ] Nessun errore nella console del browser durante una partita normale
- [ ] Nessun memory leak (le particelle scadute vengono rimosse dall'array)
- [ ] Il gioco funziona su Chrome e Firefox nelle ultime 2 versioni
- [ ] Il canvas scala correttamente su schermi da 800px a 1920px di larghezza
- [ ] Nessuna chiamata di rete esterna eccetto il font Google Fonts

---

## 21. NOTE FINALI PER L'AGENTE AI

1. **Iniziare dalla struttura:** creare prima `package.json`, `server.js`, la struttura di cartelle e `constants.js`
2. **Grafica canvas-only:** ogni forma descritta in questo documento deve essere implementata con le API `ctx.arc()`, `ctx.fillRect()`, `ctx.bezierCurveTo()`, `ctx.lineTo()`, ecc. Non usare `drawImage()` con sorgenti esterne
3. **Audio Web API:** usare `OscillatorNode`, `GainNode`, `BiquadFilterNode` — il codice non deve mai caricare file `.mp3` o `.ogg`
4. **Nessuna libreria di terze parti:** solo Express sul server. Lato client: JavaScript vanilla puro
5. **Commenti nel codice:** ogni funzione deve avere un commento JSDoc minimale
6. **Testare il flow completo:** MENU → PLAYING → GAMEOVER → RIPROVA prima di dichiarare il lavoro concluso

---

*Documento redatto per il progetto Pecorella Saltarina v2.0 — specifica tecnica completa per implementazione autonoma*
