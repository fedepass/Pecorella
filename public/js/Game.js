// public/js/Game.js
class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.state = 'MENU'; // MENU | PLAYING | GAMEOVER

    // Manager
    this.audio   = new AudioManager();
    this.input   = new InputManager();
    this.score   = new ScoreManager();
    this.particles = new ParticleSystem();
    this.bg      = new Background();
    this.sheep   = new Sheep();
    this.obstacles = new ObstacleManager();
    this.renderer  = new Renderer(ctx);

    // Stato partita
    this._speed       = C.SPEED_INITIAL;
    this._gameTime    = 0;
    this._startTime   = 0;
    this._lastTS      = 0;
    this._frameCount  = 0;

    // Risultati game over
    this._finalScore  = 0;
    this._finalMedal  = null;

    // Hitbox debug (false in produzione)
    this._debugHitbox = false;
  }

  init() {
    this.input.init(this.canvas);

    // Avvia loop
    this._lastTS = performance.now();
    requestAnimationFrame(ts => this._loop(ts));
  }

  start() {
    // Alias: il loop parte già in init()
  }

  // ---- Transizioni stato ----
  _toPlaying() {
    this.audio.init();
    this.audio.stopMenuMusic();
    this.state = 'PLAYING';
    this._speed = C.SPEED_INITIAL;
    this._gameTime = 0;
    this._startTime = Date.now();
    this.score.reset();
    this.sheep.reset();
    this.particles.clear();
    this.obstacles.reset(this._startTime);
  }

  _toGameOver() {
    this.state = 'GAMEOVER';
    this.sheep.triggerCollision();
    this.audio.stopChargeSound();

    // Esplosione
    const sx = this.sheep.x + C.SHEEP_WIDTH / 2;
    const sy = this.sheep.y + C.SHEEP_HEIGHT / 2;
    this.particles.spawnExplosion(sx, sy);
    this.audio.playCollision();

    this._finalScore = this.score.onCollision();
    this._finalMedal = this.score.getMedal(this._finalScore);

    if (this.score.isNewRecord) {
      this.audio.playNewRecord();
      this.particles.spawnConfetti(C.CANVAS_WIDTH);
    }
  }

  _toMenu() {
    this.state = 'MENU';
    this.particles.clear();
    this.audio.playMenuMusic();
  }

  // ---- Game Loop ----
  _loop(timestamp) {
    const rawDelta = (timestamp - this._lastTS) / (1000 / C.FPS_TARGET);
    const delta = Math.min(rawDelta, 3); // cap 3 frame
    this._lastTS = timestamp;
    this._frameCount++;

    this._update(delta, timestamp);
    this._render(timestamp);

    requestAnimationFrame(ts => this._loop(ts));
  }

  _update(delta, timestamp) {
    this.renderer.update(delta);

    if (this.state === 'PLAYING') {
      this._updatePlaying(delta, timestamp);
    } else if (this.state === 'MENU') {
      this._updateMenu(delta);
    } else if (this.state === 'GAMEOVER') {
      this._updateGameOver(delta);
    }

    this.input.flush();
  }

  _updateMenu(delta) {
    const click = this.input.mouseClickX;
    const clickY = this.input.mouseClickY;

    // Avvio con spazio o click su GIOCA
    if (this.input.spaceJustReleased ||
        (click > 0 && this.renderer.isClickOnPlayButton(click, clickY))) {
      this._toPlaying();
      return;
    }

    // Click su muto
    if (click > 0 && this.renderer.isClickOnMute(click, clickY)) {
      this.audio.init();
      this.audio.setMute(!this.audio.muted);
      if (!this.audio.muted) this.audio.playMenuMusic();
    }

    this.bg.update(delta, C.SPEED_INITIAL * 0.5);
    this.particles.update(delta);
  }

  _updatePlaying(delta, timestamp) {
    const now = performance.now();
    this._gameTime += delta;

    // Velocità progressiva
    this._speed = Math.min(C.SPEED_MAX, this._speed + C.SPEED_INCREMENT * delta);

    // --- Input ---
    const chargeRatio = this.input.getChargeRatio(now);

    // Inizio carica
    if (this.input.spaceDown && this.sheep.isOnGround && chargeRatio > 0) {
      this.sheep.applyCharge(chargeRatio);
      this.audio.playChargeSound(chargeRatio);
      if (chargeRatio > 0.5) {
        const cx = this.sheep.x + C.SHEEP_WIDTH / 2;
        const cy = this.sheep.y + C.SHEEP_HEIGHT * 0.6;
        this.particles.spawnChargeParticles(cx, cy, chargeRatio);
      }
    }

    // Rilascio → salto
    if (this.input.spaceJustReleased) {
      this.audio.stopChargeSound();
      if (this.sheep.isOnGround) {
        const cms = Math.min(this.input.releaseChargeMs, C.JUMP_CHARGE_MS_MAX);
        const ratio = cms / C.JUMP_CHARGE_MS_MAX;
        const force = C.JUMP_FORCE_MIN + (C.JUMP_FORCE_MAX - C.JUMP_FORCE_MIN) * ratio;
        this.sheep.jump(force);
        this.sheep.resetScale();
        this.audio.playJumpSound(ratio);
      } else {
        this.sheep.resetScale();
      }
    }

    // Se non si carica, scala normale
    if (!this.input.spaceDown || !this.sheep.isOnGround) {
      if (!this.input.spaceDown) this.sheep.resetScale();
    }

    // Click su muto durante il gioco
    const click = this.input.mouseClickX;
    if (click > 0 && this.renderer.isClickOnMute(click, this.input.mouseClickY)) {
      this.audio.setMute(!this.audio.muted);
    }

    // Atterraggio
    const wasAir = !this.sheep.wasOnGround;

    // --- Fisica ---
    this.sheep.update(delta);

    // Suono e particelle atterraggio
    if (wasAir && this.sheep.isOnGround) {
      this.audio.playLandSound();
      this.particles.spawnDust(
        this.sheep.x + C.SHEEP_WIDTH / 2,
        this.sheep.y + C.SHEEP_HEIGHT
      );
    }

    // --- Ostacoli ---
    this.obstacles.update(delta, this._speed);

    // Ostacoli superati
    const cleared = this.obstacles.collectCleared();
    for (const obs of cleared) {
      // Salto perfetto?
      const isPerfect = this._checkPerfectJump(obs);
      const result = this.score.onObstacleCleared(isPerfect);
      this.audio.playObstacleClear();

      if (result === 'COMBO') {
        this.audio.playCombo();
        this.renderer.showCombo(this.score.combo);
        this.particles.spawnComboStars(
          C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 40
        );
      }

      // Cuoricini ogni 10 ostacoli
      if (this.score.obstaclesClearedInRow % 10 === 0) {
        this.particles.spawnHearts(
          this.sheep.x + C.SHEEP_WIDTH / 2,
          this.sheep.y
        );
      }
    }

    // --- Collisioni ---
    if (this._checkCollision()) {
      this._toGameOver();
      return;
    }

    // --- Punteggio ---
    this.score.update(delta);

    // --- Background ---
    this.bg.update(delta, this._speed);

    // --- Particelle ---
    this.particles.update(delta);
  }

  _updateGameOver(delta) {
    this.particles.update(delta);
    this.bg.update(delta, 0);

    const click = this.input.mouseClickX;
    const clickY = this.input.mouseClickY;

    if (click > 0) {
      if (this.renderer.isClickOnRetry(click, clickY)) {
        this._toPlaying();
        return;
      }
      if (this.renderer.isClickOnHome(click, clickY)) {
        this._toMenu();
        return;
      }
      if (this.renderer.isClickOnMute(click, clickY)) {
        this.audio.setMute(!this.audio.muted);
      }
    }

    // Spazio = riprova
    if (this.input.spaceJustReleased) {
      this._toPlaying();
    }
  }

  _checkCollision() {
    const sx = this.sheep.x + C.SHEEP_HITBOX_X;
    const sy = this.sheep.y + C.SHEEP_HITBOX_Y;
    const sw = C.SHEEP_HITBOX_W;
    const sh = C.SHEEP_HITBOX_H;

    for (const obs of this.obstacles.obstacles) {
      if (obs.cleared) continue;
      const ox = obs.x + obs.shbx;
      const oy = obs.y + obs.shby;
      const ow = obs.shbw;
      const oh = obs.shbh;

      if (sx < ox + ow && sx + sw > ox && sy < oy + oh && sy + sh > oy) {
        return true;
      }
    }
    return false;
  }

  _checkPerfectJump(obstacle) {
    // Salto perfetto: apice del salto non supera di più di 30px l'ostacolo
    if (this.sheep.vy < 0) return false; // ancora in salita
    const jumpForce = this.sheep.vy; // approx
    const apexHeight = (jumpForce * jumpForce) / (2 * C.GRAVITY);
    const requiredHeight = obstacle.def.h + 10;
    return apexHeight <= requiredHeight + 30;
  }

  // ---- Render ----
  _render(timestamp) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    if (this.state === 'MENU') {
      this.bg.draw(ctx);
      this.particles.draw(ctx);
      this.renderer.drawMenu(
        this.sheep,
        this.score.bestScore,
        this.score.getUnlockedScenes(),
        this._frameCount
      );
    } else if (this.state === 'PLAYING') {
      this.bg.draw(ctx);
      this.obstacles.draw(ctx);

      const chargeRatio = this.input.getChargeRatio(performance.now());
      this.sheep.draw(ctx, chargeRatio, !this.sheep.isOnGround);

      this.particles.draw(ctx);
      this.renderer.drawHUD(
        this.score.score,
        this.score.bestScore,
        chargeRatio,
        this.audio.muted
      );

      if (this._debugHitbox) this._drawHitboxes(ctx);
    } else if (this.state === 'GAMEOVER') {
      this.bg.draw(ctx);
      this.obstacles.draw(ctx);
      this.particles.draw(ctx);
      this.renderer.drawGameOver(
        this._finalScore,
        this.score.bestScore,
        this._finalMedal,
        this.score.isNewRecord,
        this.sheep,
        this._frameCount
      );
      this.renderer.drawHUD(
        this._finalScore,
        this.score.bestScore,
        0,
        this.audio.muted
      );
    }
  }

  _drawHitboxes(ctx) {
    ctx.strokeStyle = 'rgba(255,0,0,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.sheep.x + C.SHEEP_HITBOX_X,
      this.sheep.y + C.SHEEP_HITBOX_Y,
      C.SHEEP_HITBOX_W,
      C.SHEEP_HITBOX_H
    );
    for (const obs of this.obstacles.obstacles) {
      ctx.strokeStyle = 'rgba(0,200,255,0.7)';
      ctx.strokeRect(obs.x + obs.shbx, obs.y + obs.shby, obs.shbw, obs.shbh);
    }
  }
}
