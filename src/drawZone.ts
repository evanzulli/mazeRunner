import { Delta } from '../src/delta';
import { Position } from '../src/position';

export class DrawZone {
  readonly size: Delta = new Delta();
  readonly walls: Delta = new Delta();

  constructor(
    readonly context: CanvasRenderingContext2D,
    readonly position: Position,
    size: Delta,
    walls: Delta
  ) {
    this.size.copyFrom(size);
    this.walls.copyFrom(walls);
  }

  shrink(d: Delta) {
    this.position.x += d.dx;
    this.position.y += d.dy;
    this.size.dx -= d.dx * 2;
    this.size.dy -= d.dy * 2;

    return this;
  }

  grow(d: Delta) {
    this.position.x -= d.dx;
    this.position.y -= d.dy;
    this.size.dx += d.dx * 2;
    this.size.dy += d.dy * 2;

    return this;
  }
}
