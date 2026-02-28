// public/js/Renderer.js
class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this._comboMsg = null;
    this._comboTimer = 0;
    this._comboDuration = 90; // ~1.5s a 60fps
    this._menuPulse = 0;
    this._titleBob = 0;
    this._blinkTimer = 0;
  }

  update(delta) {
    this._menuPulse += delta * 0.06;
    this._titleBob += delta * 0.032;
    this._blinkTimer += delta;
    if (this._comboTimer > 0) this._comboTimer -= delta;
  }

  showCombo(multiplier) {
    this._comboMsg = `+COMBO! x${multiplier * C.COMBO_THRESHOLD}`;
    this._comboTimer = this._comboDuration;
  }

  // ---- HUD ----
  drawHUD(score, bestScore, chargeRatio, muted) {
    const ctx = this.ctx;

    // Punteggio (top-left)
    this._drawPanel(ctx, 10, 10, 210, 44, 10);
    ctx.fillStyle = C.COLORS.ui.scoreText;
    ctx.font = C.FONT_HUD;
    ctx.textAlign = 'left';
    ctx.fillText(`Punteggio: ${Math.floor(score)}`, 22, 37);

    // Record (top-right)
    this._drawPanel(ctx, C.CANVAS_WIDTH - 220, 10, 210, 44, 10);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    this._drawSmallStar(ctx, C.CANVAS_WIDTH - 208, 32, 11);
    ctx.fill();
    ctx.fillStyle = C.COLORS.ui.scoreText;
    ctx.font = C.FONT_HUD;
    ctx.textAlign = 'left';
    ctx.fillText(`Record: ${bestScore}`, C.CANVAS_WIDTH - 194, 37);

    // Barra carica (bottom-left)
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '18px "Fredoka One", cursive';
    ctx.textAlign = 'left';
    ctx.fillText('Carica', 12, 678);

    // Sfondo barra
    ctx.fillStyle = C.COLORS.ui.chargeEmpty;
    this._roundRectPath(ctx, 10, 685, 200, 22, 8);
    ctx.fill();

    // Riempimento barra
    if (chargeRatio > 0) {
      const barW = Math.max(0, 200 * chargeRatio);
      const grad = ctx.createLinearGradient(10, 0, 210, 0);
      grad.addColorStop(0, '#FF9ECD');
      grad.addColorStop(1, '#FF69B4');
      ctx.fillStyle = grad;
      if (chargeRatio > 0.8) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF69B4';
      }
      this._roundRectPath(ctx, 10, 685, barW, 22, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Bordo barra
    ctx.strokeStyle = C.COLORS.ui.chargeBorder;
    ctx.lineWidth = 2;
    this._roundRectPath(ctx, 10, 685, 200, 22, 8);
    ctx.stroke();

    // Icona muto (top-center)
    const mx = C.CANVAS_WIDTH / 2, my = 30;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(mx, my, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#CC7AAA'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mx, my, 22, 0, Math.PI * 2); ctx.stroke();

    if (muted) {
      ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(mx-8, my-8); ctx.lineTo(mx+8, my+8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx+8, my-8); ctx.lineTo(mx-8, my+8); ctx.stroke();
    } else {
      ctx.fillStyle = C.COLORS.ui.scoreText;
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('♪', mx, my + 7);
    }

    // Messaggio combo
    if (this._comboTimer > 0) {
      const progress = this._comboTimer / this._comboDuration;
      const scale = progress > 0.8
        ? 1 + (1 - (1 - progress) / 0.2) * 0.5
        : 1;
      const alpha = progress < 0.3 ? progress / 0.3 : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 60);
      ctx.scale(scale, scale);
      ctx.textAlign = 'center';
      ctx.font = C.FONT_COMBO;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 12;
      ctx.fillStyle = C.COLORS.ui.comboText;
      ctx.fillText(this._comboMsg || '', 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ---- SCHERMATA MENU ----
  drawMenu(sheep, bestScore, unlockedScenes, time) {
    const ctx = this.ctx;

    // Titolo
    const titleY = 150 + Math.sin(this._titleBob) * 3;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#5A3E8C';
    ctx.shadowBlur = 8;
    ctx.font = C.FONT_TITLE;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PECORELLA SALTARINA', C.CANVAS_WIDTH / 2, titleY);
    ctx.shadowBlur = 0;

    // Decorazioni titolo (stelle)
    ctx.fillStyle = '#FFD700';
    [[200, 130], [1080, 130], [150, 160], [1130, 165]].forEach(([sx, sy]) => {
      this._drawSmallStar(ctx, sx, sy, 10);
      ctx.fill();
    });

    // Pecorella idle (centro)
    const sheepX = C.CANVAS_WIDTH / 2 - C.SHEEP_WIDTH / 2;
    const sheepY = C.GROUND_Y - C.SHEEP_HEIGHT - 20;
    const bob = Math.sin(time * 0.04) * 10;
    sheep.drawIdle(ctx, sheepX, sheepY, bob);

    // Pulsante GIOCA
    const btnScale = 1 + Math.sin(this._menuPulse) * 0.02;
    const btnW = 200, btnH = 60;
    const btnX = C.CANVAS_WIDTH / 2 - btnW / 2;
    const btnY = 360;
    ctx.save();
    ctx.translate(C.CANVAS_WIDTH / 2, btnY + btnH / 2);
    ctx.scale(btnScale, btnScale);
    ctx.translate(-C.CANVAS_WIDTH / 2, -(btnY + btnH / 2));
    ctx.fillStyle = C.COLORS.ui.buttonBg;
    ctx.shadowColor = '#CC7AAA';
    ctx.shadowBlur = 15;
    this._roundRectPath(ctx, btnX, btnY, btnW, btnH, 20);
    ctx.fill();
    ctx.strokeStyle = C.COLORS.ui.buttonBorder;
    ctx.lineWidth = 3;
    this._roundRectPath(ctx, btnX, btnY, btnW, btnH, 20);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = C.COLORS.ui.buttonText;
    ctx.font = C.FONT_BUTTON;
    ctx.textAlign = 'center';
    ctx.fillText('▶  GIOCA!', C.CANVAS_WIDTH / 2, btnY + 38);
    ctx.restore();

    // Record
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#FFD700';
    ctx.font = C.FONT_HUD;
    ctx.fillText(`🏆  Record: ${bestScore} pt`, C.CANVAS_WIDTH / 2, 470);
    ctx.shadowBlur = 0;

    // Istruzione lampeggiante
    const blink = (Math.floor(this._blinkTimer / 36) % 2 === 0);
    ctx.globalAlpha = blink ? 1 : 0.4;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = C.FONT_HUD;
    ctx.textAlign = 'center';
    ctx.fillText('Premi SPAZIO o tocca per iniziare', C.CANVAS_WIDTH / 2, 525);
    ctx.globalAlpha = 1;

    // Scenari sbloccati (bottom-center)
    this._drawSceneIcons(ctx, unlockedScenes);
  }

  _drawSceneIcons(ctx, unlockedScenes) {
    const scenes = C.SCENES;
    const totalW = scenes.length * 55;
    const startX = C.CANVAS_WIDTH / 2 - totalW / 2;
    const y = 610;

    scenes.forEach((scene, i) => {
      const x = startX + i * 55;
      const unlocked = unlockedScenes.includes(scene.id);
      ctx.globalAlpha = unlocked ? 1 : 0.35;
      const col = C.COLORS[scene.id] || C.COLORS.meadow;
      const grad = ctx.createLinearGradient(x, y, x, y + 30);
      grad.addColorStop(0, col.sky[0]);
      grad.addColorStop(1, col.ground);
      ctx.fillStyle = grad;
      this._roundRectPath(ctx, x, y, 45, 30, 6);
      ctx.fill();
      ctx.strokeStyle = unlocked ? '#FFD700' : '#888';
      ctx.lineWidth = 1.5;
      this._roundRectPath(ctx, x, y, 45, 30, 6);
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (!unlocked) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', x + 22, y + 20);
      }
    });
    ctx.globalAlpha = 1;
  }

  // ---- SCHERMATA GAME OVER ----
  drawGameOver(finalScore, bestScore, medal, isNewRecord, sheep, time) {
    const ctx = this.ctx;
    const px = 290, py = 160, pw = 700, ph = 400;

    // Pannello
    ctx.fillStyle = C.COLORS.ui.gameoverBg;
    ctx.shadowColor = '#FF9ECD';
    ctx.shadowBlur = 30;
    this._roundRectPath(ctx, px, py, pw, ph, 24);
    ctx.fill();
    ctx.strokeStyle = '#FF9ECD';
    ctx.lineWidth = 3;
    this._roundRectPath(ctx, px, py, pw, ph, 24);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pecorella stordita (sopra il pannello)
    const sheepCX = px + pw / 2 - C.SHEEP_WIDTH / 2;
    ctx.save();
    ctx.translate(sheepCX, py - 30);
    sheep._drawDead(ctx);
    ctx.restore();

    // Stelline che orbitano
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + time * 0.04;
      const sx = px + pw / 2 + Math.cos(a) * 40;
      const sy = py - 25 + Math.sin(a) * 20;
      ctx.fillStyle = '#FFD700';
      this._drawSmallStar(ctx, sx, sy, 6);
      ctx.fill();
    }

    // Messaggio casuale
    const msgIndex = Math.floor(finalScore) % C.GAMEOVER_MESSAGES.length;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFCCE8';
    ctx.font = C.FONT_MESSAGE;
    ctx.fillText(C.GAMEOVER_MESSAGES[msgIndex], px + pw / 2, py + 75);

    // Punteggio
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = C.FONT_HUD;
    ctx.fillText('Punteggio', px + pw / 2, py + 130);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = C.FONT_TITLE;
    ctx.fillText(finalScore, px + pw / 2, py + 172);

    // Record
    if (isNewRecord) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px "Fredoka One", cursive';
      ctx.fillText('★ NUOVO RECORD! ★', px + pw / 2, py + 215);
    } else {
      ctx.fillStyle = 'rgba(255,215,0,0.8)';
      ctx.font = C.FONT_HUD;
      ctx.fillText(`Miglior punteggio: ${bestScore} pt`, px + pw / 2, py + 215);
    }

    // Medaglia
    if (medal) {
      const mx = px + pw / 2, my = py + 270;
      if (medal.color === 'rainbow') {
        const hue = (time * 2) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.strokeStyle = `hsl(${(hue + 60) % 360}, 100%, 70%)`;
      } else {
        ctx.fillStyle = medal.color;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      }
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(mx, my, 35, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px "Fredoka One", cursive';
      ctx.fillText(medal.name, mx, my + 6);
    }

    // Pulsanti
    const btnRiprovaX = px + 120, btnCasaX = px + 380;
    const btnY = py + 335, btnW = 180, btnH = 50;

    this._drawButton(ctx, btnRiprovaX, btnY, btnW, btnH, '#FF9ECD', '#CC7AAA', '🔄  RIPROVA!');
    this._drawButton(ctx, btnCasaX,   btnY, btnW, btnH, '#7BC67E', '#5DA85F', '🏠  CASA');
  }

  _drawButton(ctx, x, y, w, h, bg, border, text) {
    ctx.fillStyle = bg;
    ctx.shadowColor = border;
    ctx.shadowBlur = 10;
    this._roundRectPath(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = border; ctx.lineWidth = 2.5;
    this._roundRectPath(ctx, x, y, w, h, 14);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = C.FONT_BUTTON;
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + 9);
  }

  isClickOnButton(clickX, clickY, btnX, btnY, btnW, btnH) {
    return clickX >= btnX && clickX <= btnX + btnW &&
           clickY >= btnY && clickY <= btnY + btnH;
  }

  // Aree cliccabili schermata menu
  isClickOnPlayButton(clickX, clickY) {
    const btnX = C.CANVAS_WIDTH / 2 - 100;
    const btnY = 360;
    return this.isClickOnButton(clickX, clickY, btnX, btnY, 200, 60);
  }

  // Aree cliccabili game over
  isClickOnRetry(clickX, clickY) {
    return this.isClickOnButton(clickX, clickY, 290 + 120, 160 + 335, 180, 50);
  }

  isClickOnHome(clickX, clickY) {
    return this.isClickOnButton(clickX, clickY, 290 + 380, 160 + 335, 180, 50);
  }

  isClickOnMute(clickX, clickY) {
    const mx = C.CANVAS_WIDTH / 2, my = 30;
    const dx = clickX - mx, dy = clickY - my;
    return dx * dx + dy * dy <= 22 * 22;
  }

  // ---- Helpers ----
  _drawPanel(ctx, x, y, w, h, r) {
    ctx.fillStyle = C.COLORS.ui.hudBg;
    this._roundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
  }

  _roundRectPath(ctx, x, y, w, h, r) {
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

  _drawSmallStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a  = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const ia = a + (2 * Math.PI) / 10;
      if (i === 0) ctx.moveTo(x + Math.cos(a)*r,  y + Math.sin(a)*r);
      else          ctx.lineTo(x + Math.cos(a)*r,  y + Math.sin(a)*r);
      ctx.lineTo(x + Math.cos(ia)*r*0.4, y + Math.sin(ia)*r*0.4);
    }
    ctx.closePath();
  }
}
