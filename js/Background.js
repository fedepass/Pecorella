// public/js/Background.js
class Background {
  constructor() {
    this.sceneId = 'meadow';
    this.scrollX = [0, 0, 0, 0, 0]; // offset per ogni layer
    this.sunAngle = 0;
    this.clouds = this._initClouds();
    this.trees = this._initTrees();
    this.flowers = this._initFlowers();
    this.time = 0;
    this._groundOffset = 0;
  }

  _initClouds() {
    return [
      { x: 200,  y: 80,  size: 1.0 },
      { x: 600,  y: 130, size: 0.7 },
      { x: 950,  y: 70,  size: 1.2 },
    ];
  }

  _initTrees() {
    const trees = [];
    for (let i = 0; i < 8; i++) {
      trees.push({
        x: i * 180 + Math.random() * 60,
        type: Math.random() > 0.5 ? 'tree' : 'bush',
        size: 0.7 + Math.random() * 0.6
      });
    }
    return trees;
  }

  _initFlowers() {
    const flowers = [];
    const colors = ['#FF6B35', '#FF9ECD', '#FFD700', '#7BC67E', '#4A9BFF', '#A855F7'];
    for (let i = 0; i < 20; i++) {
      flowers.push({
        x: Math.random() * C.CANVAS_WIDTH,
        y: C.GROUND_Y + 10 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2
      });
    }
    return flowers;
  }

  setScene(sceneId) {
    this.sceneId = sceneId;
  }

  update(delta, gameSpeed) {
    this.time += delta;
    this.sunAngle += delta * (Math.PI * 2) / (30 * 60); // 1 giro ogni 30s

    const ratios = C.PARALLAX_LAYERS.map(l => l.speedRatio);

    // Scorrimento nuvole (layer 1)
    this.clouds.forEach(c => {
      c.x -= gameSpeed * ratios[1] * delta;
      if (c.x < -200) c.x = C.CANVAS_WIDTH + 150;
    });

    // Scorrimento alberi (layer 3)
    this.trees.forEach(t => {
      t.x -= gameSpeed * ratios[3] * delta;
      if (t.x < -100) t.x = C.CANVAS_WIDTH + 80;
    });

    // Scorrimento fiori (layer 4)
    this.flowers.forEach(f => {
      f.x -= gameSpeed * ratios[4] * delta;
      if (f.x < -10) f.x = C.CANVAS_WIDTH + 10;
    });

    // Offset terreno (loop texture)
    this._groundOffset = (this._groundOffset + gameSpeed * delta) % 40;
  }

  draw(ctx) {
    const colors = C.COLORS[this.sceneId] || C.COLORS.meadow;
    this._drawSky(ctx, colors);
    this._drawSun(ctx);
    this._drawClouds(ctx);
    this._drawMountains(ctx, colors);
    this._drawTrees(ctx, colors);
    this._drawGround(ctx, colors);
    this._drawFlowers(ctx);
  }

  _drawSky(ctx, colors) {
    const grad = ctx.createLinearGradient(0, 0, 0, C.GROUND_Y);
    grad.addColorStop(0, colors.sky[0]);
    grad.addColorStop(1, colors.sky[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.GROUND_Y + 20);
  }

  _drawSun(ctx) {
    if (this.sceneId === 'forest') return; // no sole di notte
    const cx = 100, cy = 80, r = 45;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.sunAngle);

    // Raggi
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r + 5), Math.sin(a) * (r + 5));
      ctx.lineTo(Math.cos(a) * (r + 22), Math.sin(a) * (r + 22));
      ctx.stroke();
    }

    ctx.rotate(-this.sunAngle); // faccia non ruota
    // Corpo sole
    const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    sunGrad.addColorStop(0, '#FFD700');
    sunGrad.addColorStop(1, '#FFEB3B');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Occhi
    ctx.fillStyle = '#8B6914';
    ctx.beginPath(); ctx.arc(-12, -8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -8, 4, 0, Math.PI * 2); ctx.fill();

    // Sorriso
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 5, 12, 0.1, Math.PI - 0.1);
    ctx.stroke();

    ctx.restore();
  }

  _drawClouds(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    this.clouds.forEach(cloud => {
      this._drawCloud(ctx, cloud.x, cloud.y, cloud.size);
    });
    ctx.restore();
  }

  _drawCloud(ctx, cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF';
    const circles = [
      [0, 0, 30], [-28, 10, 22], [28, 10, 22],
      [-14, -8, 22], [14, -8, 22]
    ];
    circles.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  _drawMountains(ctx, colors) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = this.sceneId === 'forest' ? '#2D5A2D' : '#4CAF50';
    const offset = (this.time * 0.2 * C.PARALLAX_LAYERS[2].speedRatio) % C.CANVAS_WIDTH;

    // Disegna due volte per loop seamless
    for (let rep = -1; rep <= 1; rep++) {
      ctx.beginPath();
      ctx.moveTo(rep * C.CANVAS_WIDTH - offset, C.GROUND_Y);
      const peaks = [
        [0.1, 0.55], [0.25, 0.35], [0.4, 0.5],
        [0.55, 0.3], [0.7, 0.45], [0.85, 0.38], [1.0, 0.55]
      ];
      peaks.forEach(([xr, yr]) => {
        ctx.lineTo(rep * C.CANVAS_WIDTH - offset + xr * C.CANVAS_WIDTH, C.GROUND_Y - yr * 300);
      });
      ctx.lineTo(rep * C.CANVAS_WIDTH - offset + C.CANVAS_WIDTH, C.GROUND_Y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  _drawTrees(ctx, colors) {
    this.trees.forEach(t => {
      if (t.type === 'tree') {
        this._drawTree(ctx, t.x, C.GROUND_Y, t.size);
      } else {
        this._drawBush(ctx, t.x, C.GROUND_Y, t.size);
      }
    });
  }

  _drawTree(ctx, x, groundY, scale) {
    const trunkH = 60 * scale;
    const trunkW = 14 * scale;
    const canopyR = 38 * scale;
    ctx.save();
    ctx.translate(x, groundY);

    // Tronco
    ctx.fillStyle = '#795548';
    ctx.fillRect(-trunkW / 2, -trunkH, trunkW, trunkH);

    // Chioma
    const treeColor = this.sceneId === 'forest' ? '#1B5E20' : '#2E7D32';
    ctx.fillStyle = treeColor;
    ctx.beginPath();
    ctx.arc(0, -trunkH, canopyR, 0, Math.PI * 2);
    ctx.fill();

    // Ombra chioma
    ctx.fillStyle = this.sceneId === 'forest' ? '#1A4A1A' : '#1B5E20';
    ctx.beginPath();
    ctx.arc(8 * scale, -trunkH + 10 * scale, canopyR * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawBush(ctx, x, groundY, scale) {
    ctx.save();
    ctx.translate(x, groundY);
    const bushColor = this.sceneId === 'forest' ? '#2E7D32' : '#43A047';
    ctx.fillStyle = bushColor;
    [[0,0,28],[-20,8,20],[20,8,20],[-10,-10,18],[10,-10,18]].forEach(([bx,by,r]) => {
      ctx.beginPath();
      ctx.arc(bx * scale, by * scale, r * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  _drawGround(ctx, colors) {
    // Striscia erba principale
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, C.GROUND_Y, C.CANVAS_WIDTH, C.CANVAS_HEIGHT - C.GROUND_Y);

    // Bordo superiore ondulato
    ctx.fillStyle = colors.groundDark;
    ctx.beginPath();
    ctx.moveTo(0, C.GROUND_Y);
    for (let x = 0; x <= C.CANVAS_WIDTH; x += 20) {
      const wave = Math.sin((x + this._groundOffset * 5) * 0.05) * 5;
      ctx.lineTo(x, C.GROUND_Y + wave);
    }
    ctx.lineTo(C.CANVAS_WIDTH, C.GROUND_Y + 12);
    ctx.lineTo(0, C.GROUND_Y + 12);
    ctx.closePath();
    ctx.fill();

    // Percorso
    ctx.fillStyle = colors.path;
    ctx.fillRect(0, C.GROUND_Y + 12, C.CANVAS_WIDTH, 55);

    // Texture percorso
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    for (let x = (-this._groundOffset % 40); x < C.CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, C.GROUND_Y + 14);
      ctx.lineTo(x + 25, C.GROUND_Y + 60);
      ctx.stroke();
    }
  }

  _drawFlowers(ctx) {
    this.flowers.forEach(f => {
      const sway = Math.sin(this.time * 0.05 + f.phase) * 3;
      ctx.save();
      ctx.translate(f.x, f.y + sway);

      // Stelo
      ctx.strokeStyle = '#5DBB63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 10);
      ctx.stroke();

      // Petali
      ctx.fillStyle = f.color;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 4, Math.sin(a) * 4 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Centro
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }
}
