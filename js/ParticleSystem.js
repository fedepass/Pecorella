// public/js/ParticleSystem.js
class Particle {
  constructor(x, y, vx, vy, color, size, lifetime, type, gravity) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = lifetime;
    this.life = lifetime;
    this.type = type || 'circle'; // 'circle' | 'star' | 'confetti' | 'dust' | 'heart'
    this.gravity = gravity !== undefined ? gravity : 0.1;
    this.alpha = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  update(delta) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.vy += this.gravity * delta;
    this.life -= delta;
    this.alpha = Math.max(0, this.life / this.maxLife);
    this.rotation += this.rotationSpeed * delta;
  }

  isDead() {
    return this.life <= 0;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    switch (this.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        break;

      case 'star':
        this._drawStar(ctx, this.size);
        break;

      case 'confetti':
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size, -this.size * 0.5, this.size * 2, this.size);
        break;

      case 'dust':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        break;

      case 'heart':
        this._drawHeart(ctx, this.size);
        break;
    }

    ctx.restore();
  }

  _drawStar(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = angle + (2 * Math.PI) / 10;
      if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.lineTo(Math.cos(innerAngle) * r * 0.4, Math.sin(innerAngle) * r * 0.4);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  _drawHeart(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.bezierCurveTo(-r, -r * 0.3, -r, -r, 0, -r * 0.5);
    ctx.bezierCurveTo(r, -r, r, -r * 0.3, 0, r * 0.3);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(delta);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  clear() {
    this.particles = [];
  }

  // Polvere all'atterraggio
  spawnDust(x, y) {
    const colors = ['#D4C4A8', '#C8B89A', '#BCA88A'];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 1 + Math.random() * 2.5;
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 30, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed - 1,
        colors[Math.floor(Math.random() * colors.length)],
        3 + Math.random() * 3,
        25, 'dust', 0.05
      ));
    }
  }

  // Stelle combo
  spawnComboStars(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed - 2,
        '#FFD700',
        6 + Math.random() * 4,
        50, 'star', 0.08
      ));
    }
  }

  // Coriandoli nuovo record
  spawnConfetti(canvasWidth) {
    const colors = ['#FF6B35', '#FF9ECD', '#7BC67E', '#4A9BFF', '#FFD700', '#A855F7', '#FF4444'];
    for (let i = 0; i < 40; i++) {
      this.particles.push(new Particle(
        Math.random() * canvasWidth, -10,
        (Math.random() - 0.5) * 3,
        1 + Math.random() * 3,
        colors[Math.floor(Math.random() * colors.length)],
        4 + Math.random() * 4,
        180, 'confetti', 0.05
      ));
    }
  }

  // Cuoricini ogni 10 ostacoli
  spawnHearts(x, y) {
    const pinkShades = ['#FF9ECD', '#FF69B4', '#FFB0CC', '#FF1493'];
    for (let i = 0; i < 5; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 40, y,
        (Math.random() - 0.5) * 1.5, -(1 + Math.random() * 2),
        pinkShades[Math.floor(Math.random() * pinkShades.length)],
        8,
        60, 'heart', -0.02
      ));
    }
  }

  // Particelle carica
  spawnChargeParticles(x, y, chargeRatio) {
    if (Math.random() > 0.5) return;
    const side = Math.random() > 0.5 ? 1 : -1;
    this.particles.push(new Particle(
      x + side * 30, y,
      side * (0.5 + Math.random() * 1.5), (Math.random() - 0.5) * 1,
      '#FF9ECD',
      2 + chargeRatio * 3,
      12, 'circle', 0
    ));
  }

  // Esplosione collisione
  spawnExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed - 1,
        '#FF6B35',
        5 + Math.random() * 4,
        45, 'star', 0.1
      ));
    }
    // Cerchi di impatto
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        '#FFD700',
        3 + Math.random() * 3,
        30, 'circle', 0.05
      ));
    }
  }
}
