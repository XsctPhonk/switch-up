class AIController {
  constructor(params) {
    this.type = params.type || "player"; // "player" or "enemy"
    this.weapon = params.weapon || "N-Zap";
    this.position = params.position || { x: 0, y: 0 };
    this.target = null;
    this.state = "idle"; // idle, seeking, attacking, retreating
    this.speed = params.speed || 2;
    this.aggression = params.aggression || 0.7; // 0 to 1
    this.aimDirection = { x: 1, y: 0 };
    this.mapBounds = params.mapBounds || { width: 800, height: 600 };
  }

  update(gameState) {
    // Basic AI decision loop per tick/frame

    // 1. Find closest enemy or objective
    const targets = this.type === "player" ? gameState.enemies : gameState.players;
    if (!targets || targets.length === 0) {
      this.state = "idle";
      this.wander();
      return;
    }

    // Find closest target
    this.target = this.findClosest(targets);

    if (!this.target) {
      this.state = "idle";
      this.wander();
      return;
    }

    // 2. Decide state based on distance
    const dist = this.distanceTo(this.target.position);

    if (dist < 50 && Math.random() < this.aggression) {
      this.state = "attacking";
      this.attack();
    } else if (dist < 200) {
      this.state = "seeking";
      this.moveToward(this.target.position);
    } else {
      this.state = "wandering";
      this.wander();
    }
  }

  findClosest(targets) {
    let closest = null;
    let closestDist = Infinity;
    for (const t of targets) {
      const d = this.distanceTo(t.position);
      if (d < closestDist) {
        closestDist = d;
        closest = t;
      }
    }
    return closest;
  }

  distanceTo(pos) {
    return Math.hypot(pos.x - this.position.x, pos.y - this.position.y);
  }

  moveToward(pos) {
    const dx = pos.x - this.position.x;
    const dy = pos.y - this.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    this.position.x += (dx / dist) * this.speed;
    this.position.y += (dy / dist) * this.speed;
    this.aimDirection = { x: dx / dist, y: dy / dist };
  }

  attack() {
    // Simulate shooting toward target
    // You can add weapon-specific logic here
    // For now, just log attack
    console.log(`${this.type} attacking at (${this.target.position.x.toFixed(1)},${this.target.position.y.toFixed(1)})`);
  }

  wander() {
    // Random small movement to simulate idle behavior
    this.position.x += (Math.random() - 0.5) * this.speed;
    this.position.y += (Math.random() - 0.5) * this.speed;

    // Keep inside map bounds
    this.position.x = Math.min(Math.max(0, this.position.x), this.mapBounds.width);
    this.position.y = Math.min(Math.max(0, this.position.y), this.mapBounds.height);
  }
}

export default AIController;
