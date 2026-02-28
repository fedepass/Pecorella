// public/js/Obstacle.js
class Obstacle {
  constructor(type, x, y, def) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.def = def;
    this.animTimer = 0;
    this.cleared = false;
  }

  update(delta, speed) {
    this.x -= speed * delta;
    this.animTimer += delta;
  }

  isOffScreen() {
    return this.x + this.def.w < -20;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    switch (this.type) {
      case 'HAY':      this._drawHay(ctx); break;
      case 'CAKE':     this._drawCake(ctx); break;
      case 'MUSHROOM': this._drawMushroom(ctx); break;
      case 'BUCKET':   this._drawBucket(ctx); break;
      case 'RAINBOW':  this._drawRainbow(ctx); break;
      case 'SHEEP2':   this._drawSheep2(ctx); break;
      case 'CASTLE':   this._drawCastle(ctx); break;
      case 'BOOKS':    this._drawBooks(ctx); break;
      case 'RABBIT':   this._drawRabbit(ctx); break;
      case 'CACTUS':   this._drawCactus(ctx); break;
    }
    ctx.restore();
  }

  // ---- HAY ----
  _drawHay(ctx) {
    // Base fieno
    ctx.fillStyle = '#E8C84A';
    ctx.beginPath();
    ctx.ellipse(35, 42, 33, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fili di fieno
    ctx.strokeStyle = '#C8A820';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const bx = 8 + i * 8;
      ctx.beginPath();
      ctx.moveTo(bx, 38);
      ctx.lineTo(bx - 3, 58);
      ctx.stroke();
    }

    // Uccellino (animazione su/giù)
    const birdY = 14 + Math.sin(this.animTimer * 0.06) * 3;
    ctx.save();
    ctx.translate(35, birdY);
    // Corpo
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath(); ctx.ellipse(0, 4, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Testa
    ctx.beginPath(); ctx.arc(7, 0, 5, 0, Math.PI * 2); ctx.fill();
    // Becco
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(11, -1); ctx.lineTo(16, 0); ctx.lineTo(11, 2);
    ctx.closePath(); ctx.fill();
    // Occhio
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.arc(8.5, -1, 1.5, 0, Math.PI * 2); ctx.fill();
    // Ala
    ctx.fillStyle = '#6AB0D8';
    ctx.beginPath();
    ctx.ellipse(-2, 6, 6, 3, -0.3, 0, Math.PI);
    ctx.fill();
    ctx.restore();
  }

  // ---- CAKE ----
  _drawCake(ctx) {
    const rr = (x, y, w, h, r, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath(); ctx.fill();
    };

    rr(5, 60, 65, 25, 5, '#FF9ECD');   // piano inferiore
    rr(12, 38, 51, 26, 5, '#FFCCE8');  // piano medio
    rr(20, 20, 35, 22, 5, '#FFE8F5');  // piano superiore

    // Glassa a onde
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    [[5,60,65],[12,38,51],[20,20,35]].forEach(([px,py,pw]) => {
      ctx.beginPath();
      ctx.moveTo(px, py+4);
      for (let i = 0; i <= pw; i += 8) {
        ctx.quadraticCurveTo(px+i+4, py-3, px+i+8, py+4);
      }
      ctx.lineTo(px+pw, py+8); ctx.lineTo(px, py+8);
      ctx.closePath(); ctx.fill();
    });

    // Candeline (oscillano)
    const candlePositions = [28, 37, 46];
    candlePositions.forEach((cx, i) => {
      const angle = Math.sin(this.animTimer * 0.05 + i * 1.2) * 0.12;
      ctx.save();
      ctx.translate(cx, 22);
      ctx.rotate(angle);
      // Stelo
      ctx.fillStyle = '#FFFACD';
      ctx.fillRect(-2, -12, 4, 12);
      // Fiamma
      ctx.fillStyle = '#FF6B35';
      ctx.beginPath();
      ctx.ellipse(0, -14, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(0, -13, 1.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Decorazioni
    const dotColors = ['#FF6B35','#7BC67E','#4A9BFF','#FFD700','#A855F7'];
    [[20,52],[35,52],[50,52],[25,70],[40,70],[55,70]].forEach(([dx,dy],i) => {
      ctx.fillStyle = dotColors[i % dotColors.length];
      ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
    });
  }

  // ---- MUSHROOM ----
  _drawMushroom(ctx) {
    const breathe = 1 + Math.sin(this.animTimer * 0.07) * 0.03;
    ctx.save();
    ctx.translate(40, 68);
    ctx.scale(breathe, breathe);
    ctx.translate(-40, -68);

    // Gambo
    ctx.fillStyle = '#FFF8E8';
    this._roundRectFill(ctx, 25, 52, 30, 33, 6);

    // Cappello
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.ellipse(40, 48, 38, 42, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(78, 52); ctx.lineTo(2, 52);
    ctx.closePath(); ctx.fill();

    // Sfumatura ombra cappello
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(50, 42, 20, 25, 0.3, Math.PI, Math.PI * 2);
    ctx.fill();

    // Pois
    ctx.fillStyle = '#FFFFFF';
    [[22,28,7],[50,20,8],[65,35,6],[30,42,5],[58,45,5]].forEach(([px,py,pr]) => {
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    });

    // Faccia
    ctx.fillStyle = '#2C1810';
    ctx.beginPath(); ctx.ellipse(32, 34, 4, 5, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(48, 34, 4, 5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2C1810'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(40, 42, 5, 0.1, Math.PI - 0.1); ctx.stroke();

    ctx.restore();
  }

  // ---- BUCKET ----
  _drawBucket(ctx) {
    // Manico
    ctx.strokeStyle = '#3A7BE8'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(27.5, 8, 16, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Corpo (trapezio rovesciato - più largo in basso)
    ctx.fillStyle = '#4A9BFF';
    ctx.beginPath();
    ctx.moveTo(8, 10); ctx.lineTo(47, 10);
    ctx.lineTo(52, 48); ctx.lineTo(3, 48);
    ctx.closePath(); ctx.fill();

    // Bande decorative
    ctx.fillStyle = '#3A7BE8';
    ctx.beginPath(); ctx.rect(4, 18, 47, 4); ctx.fill();
    ctx.beginPath(); ctx.rect(6, 30, 43, 3); ctx.fill();

    // Bordo inferiore
    ctx.fillStyle = '#3A7BE8';
    this._roundRectFill(ctx, 1, 44, 53, 8, 3);

    // Vernice che cola (animazione)
    const dripColors = ['#FF6B35', '#FF9ECD', '#7BC67E'];
    const dripXs = [10, 25, 40];
    dripXs.forEach((dx, i) => {
      const len = ((this.animTimer * 0.5 + i * 20) % 30) + 5;
      ctx.fillStyle = dripColors[i];
      ctx.beginPath();
      ctx.moveTo(dx - 3, 52);
      ctx.quadraticCurveTo(dx + 1, 52 + len * 0.5, dx - 2, 52 + len);
      ctx.quadraticCurveTo(dx + 3, 52 + len + 5, dx + 4, 52 + len);
      ctx.quadraticCurveTo(dx + 2, 52 + len * 0.5, dx + 5, 52);
      ctx.closePath(); ctx.fill();
    });
  }

  // ---- RAINBOW ----
  _drawRainbow(ctx) {
    const hueShift = (this.animTimer * 0.5) % 360;
    const rainbowColors = ['#FF0000','#FF7F00','#FFFF00','#00CC00','#0000FF','#8B00FF','#FF69B4'];
    const cx = 55, cy = 95;

    // Archi dell'arcobaleno
    for (let i = 0; i < 7; i++) {
      const r = 50 - i * 5;
      if (r <= 0) continue;
      ctx.strokeStyle = rainbowColors[(i + Math.floor(hueShift / 50)) % 7];
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    // Nuvoline ai piedi
    ctx.fillStyle = '#FFFFFF';
    [[cx - 45, cy + 5, 16, 10],[cx + 45, cy + 5, 16, 10]].forEach(([nx,ny,rx,ry]) => {
      ctx.beginPath(); ctx.ellipse(nx, ny, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Leccalecca
    const lolliPositions = [-38,-22,0,22,38];
    const lolliColors = ['#FF6B35','#FF9ECD','#FFD700','#7BC67E','#A855F7'];
    lolliPositions.forEach((dx, i) => {
      const angle = Math.PI + (dx / 55) * Math.PI;
      const lx = cx + Math.cos(angle) * 38;
      const ly = cy + Math.sin(angle) * 38;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 15); ctx.stroke();
      ctx.fillStyle = lolliColors[i];
      ctx.beginPath(); ctx.arc(lx, ly, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.arc(lx - 2, ly - 2, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Stelle
    ctx.fillStyle = '#FFD700';
    [[5,50],[105,50],[15,90],[95,90]].forEach(([sx,sy]) => {
      this._drawSmallStar(ctx, sx, sy, 6);
    });
  }

  // ---- SHEEP2 ----
  _drawSheep2(ctx) {
    ctx.save();
    ctx.translate(42, 40);
    ctx.rotate(-0.09);
    ctx.translate(-42, -40);
    // Disegna la pecorella base con occhi chiusi
    this._drawSheepBody(ctx, 0, 0, { eyesClosed: true });
    ctx.restore();

    // Zzz che flotta
    const zAlpha = (Math.sin(this.animTimer * 0.07) + 1) * 0.5;
    const zOffY = -10 - ((this.animTimer * 0.3) % 20);
    ctx.save();
    ctx.globalAlpha = zAlpha;
    ctx.fillStyle = '#87CEEB';
    ctx.font = 'bold 14px "Fredoka One", cursive';
    ctx.fillText('Zzz', 62, zOffY + 15);
    ctx.restore();
  }

  _drawSheepBody(ctx, ox, oy, opts) {
    const sc = C.COLORS.sheep;
    ctx.save();
    ctx.translate(ox, oy);

    // Coda
    ctx.fillStyle = sc.wool;
    ctx.beginPath(); ctx.arc(8, 42, 8, 0, Math.PI * 2); ctx.fill();

    // Lana
    ctx.fillStyle = sc.wool;
    ctx.beginPath(); ctx.ellipse(42, 38, 32, 25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = sc.woolShadow;
    [[18,28,9],[32,22,10],[48,20,10],[60,26,9],[66,36,8],[62,46,9],[48,50,9],
     [34,50,9],[20,44,8],[14,35,8]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = sc.wool;
    [[18,28,5],[32,22,5],[48,20,5],[60,26,5],[66,36,4]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x-2,y-2,r,0,Math.PI*2); ctx.fill();
    });

    // Zampe
    ctx.fillStyle = sc.leg;
    [[25,60,11,20],[40,60,11,20],[9,62,11,18],[56,62,11,18]].forEach(([lx,ly,lw,lh]) => {
      this._roundRectFill(ctx, lx, ly, lw, lh, 3);
    });

    // Testa
    ctx.fillStyle = sc.face;
    ctx.beginPath(); ctx.arc(60, 22, 17, 0, Math.PI * 2); ctx.fill();

    if (opts && opts.eyesClosed) {
      ctx.strokeStyle = sc.eye; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(55, 18, 4, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(66, 18, 4, 0.1, Math.PI - 0.1); ctx.stroke();
    } else {
      ctx.fillStyle = sc.eyeWhite;
      ctx.beginPath(); ctx.arc(55, 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = sc.eye;
      ctx.beginPath(); ctx.arc(56, 18, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = sc.eyeWhite;
      ctx.beginPath(); ctx.arc(66, 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = sc.eye;
      ctx.beginPath(); ctx.arc(67, 18, 3, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = sc.nose;
    ctx.beginPath(); ctx.ellipse(62, 27, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // ---- CASTLE ----
  _drawCastle(ctx) {
    // Torrette laterali
    ctx.fillStyle = '#F0DC90';
    ctx.fillRect(5, 40, 18, 55);
    ctx.fillRect(67, 40, 18, 55);

    // Merlature torrette
    ctx.fillStyle = '#F0DC90';
    [[5,32],[13,32],[21,32]].forEach(([mx,my]) => ctx.fillRect(mx, my, 7, 10));
    [[67,32],[75,32],[83,32]].forEach(([mx,my]) => ctx.fillRect(mx, my, 7, 10));

    // Torre centrale
    ctx.fillStyle = '#F5E6A3';
    ctx.fillRect(28, 20, 34, 75);

    // Merlature centro
    [[28,10],[36,10],[44,10],[52,10]].forEach(([mx,my]) => {
      ctx.fillRect(mx, my, 8, 12);
    });

    // Texture
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
    for (let ry = 25; ry < 90; ry += 12) {
      ctx.beginPath(); ctx.moveTo(28, ry); ctx.lineTo(62, ry); ctx.stroke();
    }

    // Finestre
    ctx.fillStyle = '#8B6914';
    [[38,30,8,10],[46,30,8,10],[40,48,10,10]].forEach(([fx,fy,fw,fh]) => {
      ctx.beginPath();
      ctx.rect(fx, fy+5, fw, fh-5);
      ctx.arc(fx + fw/2, fy+5, fw/2, Math.PI, 0);
      ctx.fill();
    });

    // Porta
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.rect(38, 72, 14, 23);
    ctx.arc(45, 72, 7, Math.PI, 0);
    ctx.fill();

    // Bandierina (animazione vento)
    const flagAngle = Math.sin(this.animTimer * 0.08) * 0.17;
    ctx.save();
    ctx.translate(45, 8);
    // Asta
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -16); ctx.stroke();
    // Bandierina
    ctx.save();
    ctx.translate(0, -16);
    ctx.rotate(flagAngle);
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(18, 5); ctx.lineTo(0, 10);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // ---- BOOKS ----
  _drawBooks(ctx) {
    const bookColors = ['#FF6B35','#4A9BFF','#7BC67E','#FF9ECD','#A855F7','#FFD700'];
    const widths = [65, 58, 52, 46, 41, 37];
    const startX = [2, 6, 9, 12, 14, 16];

    for (let i = 0; i < 6; i++) {
      const by = 95 - i * 18;
      const bx = startX[i];
      const bw = widths[i];
      const isTop = i === 5;

      ctx.save();
      if (isTop) {
        const wobble = Math.sin(this.animTimer * 0.07) * 0.14;
        ctx.translate(bx + bw/2, by + 9);
        ctx.rotate(wobble);
        ctx.translate(-(bx + bw/2), -(by + 9));
      }

      ctx.fillStyle = bookColors[i];
      ctx.fillRect(bx, by, bw, 17);
      // Bordo
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, 17);
      // Riga "testo"
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 8, by + 9); ctx.lineTo(bx + bw - 8, by + 9);
      ctx.stroke();
      // Dorso libro
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(bx, by, 6, 17);

      ctx.restore();
    }
  }

  // ---- RABBIT ----
  _drawRabbit(ctx) {
    const sway = Math.sin(this.animTimer * 0.105) * 5;

    ctx.save();
    ctx.translate(32 + sway * 0.3, 60);

    // Zampe
    ctx.fillStyle = '#FFD4D4';
    ctx.beginPath(); ctx.ellipse(-15, 55, 12, 8, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15, 55, 12, 8, 0.3, 0, Math.PI * 2); ctx.fill();

    // Corpo
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath(); ctx.ellipse(0, 28, 22, 28, 0, 0, Math.PI * 2); ctx.fill();

    // Papillon
    ctx.fillStyle = '#FF9ECD';
    ctx.beginPath(); ctx.ellipse(-8, 4, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, 4, 8, 5, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath(); ctx.arc(0, 4, 4, 0, Math.PI * 2); ctx.fill();

    // Braccia (oscillano)
    const armAngle = Math.sin(this.animTimer * 0.105) * 0.3;
    ctx.strokeStyle = '#F5F5F5'; ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.save();
    ctx.translate(-20, 15);
    ctx.rotate(-0.6 - armAngle);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 22); ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(20, 15);
    ctx.rotate(0.6 + armAngle);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 22); ctx.stroke();
    ctx.restore();

    // Testa
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath(); ctx.arc(0, -7, 18, 0, Math.PI * 2); ctx.fill();

    // Orecchie
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath(); ctx.ellipse(-12, -38, 7, 22, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -38, 7, 22, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFB0C8';
    ctx.beginPath(); ctx.ellipse(-12, -38, 3.5, 16, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -38, 3.5, 16, 0.15, 0, Math.PI * 2); ctx.fill();

    // Occhi
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath(); ctx.arc(-7, -10, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -10, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.arc(-6, -10, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -10, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(-5, -11, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -11, 1.2, 0, Math.PI * 2); ctx.fill();

    // Naso
    ctx.fillStyle = '#FF9ECD';
    ctx.beginPath();
    ctx.moveTo(0, -4); ctx.lineTo(-3, -1); ctx.lineTo(3, -1);
    ctx.closePath(); ctx.fill();

    // Baffi
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
    [[-5,-2,-18,-3],[[-5,-2,-18,0]],[[5,-2,18,-3]],[[5,-2,18,0]]].flat();
    const whiskers = [[-5,-2,-18,-3],[-5,-2,-18,0],[5,-2,18,-3],[5,-2,18,0]];
    whiskers.forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });

    ctx.restore();
  }

  // ---- CACTUS ----
  _drawCactus(ctx) {
    // Bracci
    ctx.fillStyle = '#5DBB63';
    ctx.beginPath(); ctx.ellipse(12, 36, 12, 7, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(48, 38, 12, 7, 0.4, 0, Math.PI * 2); ctx.fill();

    // Fusto
    ctx.fillStyle = '#5DBB63';
    this._roundRectFill(ctx, 20, 18, 20, 52, 7);

    // Spine
    ctx.strokeStyle = '#3A8A3A'; ctx.lineWidth = 1.5;
    [[20,28],[20,38],[20,48],[40,28],[40,38],[40,48]].forEach(([sx,sy]) => {
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx-8, sy-2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx-8, sy+2); ctx.stroke();
    });

    // Fiore in cima
    const cx = 30, cy = 16;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillStyle = '#FF9ECD';
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, 5, 7, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();

    // Farfalla (vola in cerchio)
    const bAngle = this.animTimer * 0.105;
    const bx = cx + Math.cos(bAngle) * 15;
    const by = cy + Math.sin(bAngle) * 8 - 5;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(bAngle);
    ctx.fillStyle = '#FF9ECD';
    ctx.beginPath(); ctx.ellipse(-5, -3, 6, 4, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -3, 6, 4, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-4, 3, 4, 3, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, 3, 4, 3, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _roundRectFill(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath(); ctx.fill();
  }

  _drawSmallStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const ia = a + (2 * Math.PI) / 10;
      if (i === 0) ctx.moveTo(x + Math.cos(a)*r, y + Math.sin(a)*r);
      else ctx.lineTo(x + Math.cos(a)*r, y + Math.sin(a)*r);
      ctx.lineTo(x + Math.cos(ia)*r*0.4, y + Math.sin(ia)*r*0.4);
    }
    ctx.closePath(); ctx.fill();
  }
}

// ---- Obstacle Manager ----
class ObstacleManager {
  constructor() {
    this.obstacles = [];
    this._nextSpawnX = C.CANVAS_WIDTH + C.OBSTACLE_SPAWN_DIST_MIN;
    this._distSinceLast = 0;
    this._spawnDist = this._randomDist();
    this._gameStartTime = 0;
  }

  reset(gameStartTime) {
    this.obstacles = [];
    this._distSinceLast = 0;
    this._spawnDist = this._randomDist();
    this._gameStartTime = gameStartTime;
  }

  _randomDist() {
    return C.OBSTACLE_SPAWN_DIST_MIN +
      Math.random() * (C.OBSTACLE_SPAWN_DIST_MAX - C.OBSTACLE_SPAWN_DIST_MIN);
  }

  _pickType() {
    const elapsed = (Date.now() - this._gameStartTime) / 1000;
    let allowedTiers = ['LOW'];
    for (const d of C.DIFFICULTY) {
      if (elapsed >= d.time) {
        allowedTiers = d.tier === 'ALL' ? ['LOW','MEDIUM','HIGH'] : [d.tier];
      }
    }
    const pool = allowedTiers.flatMap(t => C.OBSTACLE_TIERS[t]);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  update(delta, speed) {
    // Aggiorna ostacoli esistenti
    for (const obs of this.obstacles) {
      obs.update(delta, speed);
    }

    // Rimuovi usciti dallo schermo (già marcati come cleared)
    this.obstacles = this.obstacles.filter(o => !o.isOffScreen());

    // Controlla spawn
    this._distSinceLast += speed * delta;
    if (this._distSinceLast >= this._spawnDist) {
      this._spawn();
      this._distSinceLast = 0;
      this._spawnDist = this._randomDist();
    }
  }

  _spawn() {
    if (this.obstacles.length >= C.OBSTACLE_POOL_SIZE) return;
    const type = this._pickType();
    const def = C.OBSTACLES[type];
    const x = C.CANVAS_WIDTH + 50;
    const y = C.GROUND_Y - def.h;
    this.obstacles.push(new Obstacle(type, x, y, def));
  }

  draw(ctx) {
    for (const obs of this.obstacles) {
      obs.draw(ctx);
    }
  }

  // Ritorna ostacoli superati e li marca
  collectCleared() {
    const cleared = [];
    for (const obs of this.obstacles) {
      if (!obs.cleared && obs.x + obs.def.w < C.SHEEP_X) {
        obs.cleared = true;
        cleared.push(obs);
      }
    }
    return cleared;
  }
}
