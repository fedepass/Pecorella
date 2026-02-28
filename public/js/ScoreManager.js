// public/js/ScoreManager.js
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
      return 'COMBO';
    }
    return null;
  }

  onCollision() {
    const finalScore = Math.floor(this.score);
    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;
      try { localStorage.setItem(C.STORAGE_BEST, this.bestScore); } catch(e) {}
      this.isNewRecord = true;
    }
    this._checkSceneUnlocks(finalScore);
    return finalScore;
  }

  _checkSceneUnlocks(score) {
    let unlocked;
    try {
      unlocked = JSON.parse(localStorage.getItem(C.STORAGE_UNLOCKS) || '["meadow"]');
    } catch(e) {
      unlocked = ['meadow'];
    }
    let changed = false;
    for (const scene of C.SCENES) {
      if (score >= scene.unlockScore && !unlocked.includes(scene.id)) {
        unlocked.push(scene.id);
        changed = true;
      }
    }
    if (changed) {
      try { localStorage.setItem(C.STORAGE_UNLOCKS, JSON.stringify(unlocked)); } catch(e) {}
    }
  }

  getUnlockedScenes() {
    try {
      return JSON.parse(localStorage.getItem(C.STORAGE_UNLOCKS) || '["meadow"]');
    } catch(e) {
      return ['meadow'];
    }
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
