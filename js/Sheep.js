// public/js/Sheep.js
class Sheep {
  constructor() {
    this.x = C.SHEEP_X;
    this.y = C.GROUND_Y - C.SHEEP_HEIGHT;
    this.vy = 0;
    this.isOnGround = true;
    this.wasOnGround = true;

    // Animazione
    this.runFrame = 0;
    this.runFrameTimer = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this._landTimer = 0;
    this._landDuration = 200 / (1000 / 60); // 200ms in frame
    this._isLanding = false;

    // Stato
    this.isDead = false;
    this.collisionTimer = 0;
    this.eyeXOffset = 0;
    this.eyeYOffset = 0;
  }

  jump(force) {
    if (this.isOnGround) {
      this.vy = force;
      this.isOnGround = false;
    }
  }

  update(delta) {
    if (!this.isOnGround) {
      this.vy += C.GRAVITY * delta;
      this.vy = Math.min(this.vy, C.MAX_FALL_SPEED);
      this.y += this.vy * delta;
    }

    const groundY = C.GROUND_Y - C.SHEEP_HEIGHT;
    if (this.y >= groundY) {
      this.y = groundY;
      if (!this.wasOnGround) {
        // Atterraggio
        this._isLanding = true;
        this._landTimer = this._landDuration;
      }
      this.vy = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }
    this.wasOnGround = this.isOnGround;

    // Animazione atterraggio
    if (this._isLanding) {
      this._landTimer -= delta;
      const progress = 1 - Math.max(0, this._landTimer / this._landDuration);
      if (progress < 0.5) {
        // schiacciamento
        const t = progress / 0.5;
        this.scaleX = 1 + 0.3 * t;
        this.scaleY = 0.7 + 0.3 * (1 - t);
      } else {
        // rimbalzo elastico
        const t = (progress - 0.5) / 0.5;
        const elastic = Math.sin(t * Math.PI * 2) * 0.15 * (1 - t);
        this.scaleX = 1.3 - 0.3 * t - elastic * 0.5;
        this.scaleY = 0.7 + 0.3 * t + elastic;
      }
      if (this._landTimer <= 0) {
        this._isLanding = false;
        this.scaleX = 1;
        this.scaleY = 1;
      }
    }

    // Animazione corsa
    if (this.isOnGround && !this.isDead) {
      this.runFrameTimer += delta;
      if (this.runFrameTimer >= C.FPS_TARGET / C.SHEEP_RUN_FPS) {
        this.runFrame = (this.runFrame + 1) % C.SHEEP_RUN_FRAMES;
        this.runFrameTimer = 0;
      }
    }

    // Timer collisione
    if (this.isDead) {
      this.collisionTimer += delta;
    }
  }

  applyCharge(chargeRatio) {
    if (!this.isOnGround) return;
    this.scaleY = 1 - C.SQUISH_FACTOR_MAX * chargeRatio;
    this.scaleX = 1 + 0.2 * chargeRatio;
  }

  resetScale() {
    if (!this._isLanding) {
      this.scaleX = 1;
      this.scaleY = 1;
    }
  }

  triggerCollision() {
    this.isDead = true;
    this.collisionTimer = 0;
  }

  reset() {
    this.x = C.SHEEP_X;
    this.y = C.GROUND_Y - C.SHEEP_HEIGHT;
    this.vy = 0;
    this.isOnGround = true;
    this.wasOnGround = true;
    this.runFrame = 0;
    this.runFrameTimer = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this._landTimer = 0;
    this._isLanding = false;
    this.isDead = false;
    this.collisionTimer = 0;
  }

  draw(ctx, chargeRatio, isJumping) {
    const cx = this.x + C.SHEEP_WIDTH / 2;
    const cy = this.y + C.SHEEP_HEIGHT;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-C.SHEEP_WIDTH / 2, -C.SHEEP_HEIGHT);

    if (this.isDead) {
      this._drawDead(ctx);
    } else if (!this.isOnGround) {
      this._drawJumping(ctx);
    } else {
      this._drawRunning(ctx, chargeRatio);
    }

    ctx.restore();
  }

  _drawBase(ctx, frame, opts) {
    opts = opts || {};
    const sc = C.COLORS.sheep;

    // ---- CODA ----
    ctx.fillStyle = sc.wool;
    ctx.beginPath();
    ctx.arc(8, 42, 9, 0, Math.PI * 2);
    ctx.fill();

    // ---- LANA ----
    const woolSY = opts.woolSY || 1;
    const woolSX = opts.woolSX || 1;
    ctx.save();
    ctx.translate(45, 38);
    ctx.scale(woolSX, woolSY);
    ctx.translate(-45, -38);

    // Corpo lana principale
    ctx.fillStyle = sc.wool;
    ctx.beginPath();
    ctx.ellipse(45, 38, 36, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Texture lana (cerchietti sovrapposti)
    ctx.fillStyle = sc.woolShadow;
    const woolBumps = [
      [20,28,10],[35,22,11],[52,20,11],[65,26,10],
      [72,35,9],[68,46,9],[55,50,10],[38,52,10],
      [24,46,9],[15,36,9],[28,35,8],[48,36,8]
    ];
    woolBumps.forEach(([x,y,r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    // Rifinitura bianca
    ctx.fillStyle = sc.wool;
    woolBumps.forEach(([x,y,r]) => {
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ---- ZAMPE ----
    const legColor = sc.leg;
    ctx.fillStyle = legColor;
    ctx.strokeStyle = '#B89878';
    ctx.lineWidth = 1;

    const legs = this._getLegPositions(frame, opts);
    legs.forEach(([lx, ly, lw, lh]) => {
      this._roundRect(ctx, lx, ly, lw, lh, 3);
      ctx.fill();
      ctx.stroke();
    });

    // ---- ORECCHIE ----
    ctx.save();
    ctx.translate(53, 10);
    ctx.rotate(-0.35 + (opts.earExtra || 0));
    ctx.fillStyle = sc.face;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sc.nose;
    ctx.beginPath();
    ctx.ellipse(0, 2, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(71, 10);
    ctx.rotate(0.35 + (opts.earExtra || 0));
    ctx.fillStyle = sc.face;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sc.nose;
    ctx.beginPath();
    ctx.ellipse(0, 2, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---- TESTA ----
    ctx.fillStyle = sc.face;
    ctx.beginPath();
    ctx.arc(62, 22, 18, 0, Math.PI * 2);
    ctx.fill();

    if (opts.eyesClosed) {
      // Occhi chiusi
      ctx.strokeStyle = sc.eye;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(57, 18, 4, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(68, 18, 4, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    } else if (opts.eyesCross) {
      // Occhi a X (collisione)
      ctx.strokeStyle = sc.eye;
      ctx.lineWidth = 2.5;
      [57, 68].forEach(ex => {
        ctx.beginPath(); ctx.moveTo(ex-4, 14); ctx.lineTo(ex+4, 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex+4, 14); ctx.lineTo(ex-4, 22); ctx.stroke();
      });
    } else {
      const eyeOffY = opts.eyeOffY || 0;
      // Occhio sinistro
      ctx.fillStyle = sc.eyeWhite;
      ctx.beginPath();
      ctx.ellipse(57, 18 + eyeOffY, 5, opts.eyeOvalV ? 6 : 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = sc.eye;
      ctx.beginPath();
      ctx.arc(58, 18 + eyeOffY, 3, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(59, 16 + eyeOffY, 1.2, 0, Math.PI * 2); ctx.fill();

      // Occhio destro
      ctx.fillStyle = sc.eyeWhite;
      ctx.beginPath();
      ctx.ellipse(68, 18 + eyeOffY, 5, opts.eyeOvalV ? 6 : 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = sc.eye;
      ctx.beginPath();
      ctx.arc(69, 18 + eyeOffY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(70, 16 + eyeOffY, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    // ---- NASO ----
    ctx.fillStyle = sc.nose;
    ctx.beginPath();
    ctx.ellipse(65, 28, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // ---- GUANCE ----
    const cheekAlpha = opts.cheekAlpha || 0.4;
    ctx.globalAlpha = cheekAlpha;
    ctx.fillStyle = sc.cheek;
    ctx.beginPath(); ctx.arc(57, 26, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(73, 26, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // ---- BOCCA ----
    if (opts.mouthOpen) {
      ctx.fillStyle = '#4A2010';
      ctx.beginPath(); ctx.arc(65, 33, 4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = sc.mouth;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(61, 31);
      ctx.quadraticCurveTo(65, 36, 70, 31);
      ctx.stroke();
    }
  }

  _getLegPositions(frame, opts) {
    // Base
    const base = [
      [28, 62, 12, 22], // ant sx
      [44, 62, 12, 22], // ant dx
      [10, 64, 12, 20], // post sx
      [60, 64, 12, 20]  // post dx
    ];
    if (opts.staticLegs) return base;
    const f = frame % 4;
    const legs = base.map(l => [...l]);
    if (f === 0) {
      legs[0][0] += 8; legs[0][1] -= 4; // ant sx avanti
      legs[3][0] -= 5; legs[3][1] -= 3; // post dx avanti
    } else if (f === 1) {
      // Centro, lana schiacciata
    } else if (f === 2) {
      legs[1][0] += 8; legs[1][1] -= 4; // ant dx avanti
      legs[2][0] -= 5; legs[2][1] -= 3; // post sx avanti
    } else {
      // Centro, lana alzata
    }
    return legs;
  }

  _drawRunning(ctx, chargeRatio) {
    const cheekAlpha = 0.3 + (chargeRatio || 0) * 0.5;
    const woolSY = chargeRatio > 0 ? 1 - chargeRatio * 0.15 : 1;
    const woolSX = chargeRatio > 0 ? 1 + chargeRatio * 0.1 : 1;
    this._drawBase(ctx, this.runFrame, { cheekAlpha, woolSY, woolSX });
  }

  _drawJumping(ctx) {
    this._drawBase(ctx, 0, {
      eyeOffY: -2,
      eyeOvalV: true,
      mouthOpen: true,
      woolSX: 0.9,
      woolSY: 1.15,
      earExtra: 0.26,
      staticLegs: true
    });
  }

  _drawDead(ctx) {
    const blink = Math.floor(this.collisionTimer / 8) % 2 === 0;
    if (!blink) ctx.globalAlpha = 0.7;
    this._drawBase(ctx, 0, {
      eyesCross: true,
      woolSY: 0.9,
      staticLegs: true,
      cheekAlpha: 0.2
    });
    ctx.globalAlpha = 1;
  }

  drawIdle(ctx, x, y, bobOffset) {
    ctx.save();
    ctx.translate(x, y + bobOffset);
    this._drawBase(ctx, Math.floor(Date.now() / 200) % 4, { cheekAlpha: 0.4 });
    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
