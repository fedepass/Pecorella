// public/js/InputManager.js
class InputManager {
  constructor() {
    this.spaceDown = false;
    this.spaceDownTime = 0;
    this.spaceJustReleased = false;
    this.releaseChargeMs = 0;
    this.mouseClickX = -1;
    this.mouseClickY = -1;
    this._canvas = null;
  }

  init(canvas) {
    this._canvas = canvas;

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

    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      this.mouseClickX = (e.clientX - rect.left) * (C.CANVAS_WIDTH / rect.width);
      this.mouseClickY = (e.clientY - rect.top) * (C.CANVAS_HEIGHT / rect.height);
    });

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      if (!this.spaceDown) {
        this.spaceDown = true;
        this.spaceDownTime = performance.now();
      }
      // Also record touch position for button clicks
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        this.mouseClickX = (e.touches[0].clientX - rect.left) * (C.CANVAS_WIDTH / rect.width);
        this.mouseClickY = (e.touches[0].clientY - rect.top) * (C.CANVAS_HEIGHT / rect.height);
      }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      this.spaceJustReleased = true;
      this.releaseChargeMs = performance.now() - this.spaceDownTime;
      this.spaceDown = false;
    }, { passive: false });
  }

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

  isClickInRect(x, y, w, h) {
    return this.mouseClickX >= x && this.mouseClickX <= x + w &&
           this.mouseClickY >= y && this.mouseClickY <= y + h;
  }
}
