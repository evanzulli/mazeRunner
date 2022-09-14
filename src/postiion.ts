import { Direction } from '../src/direction';

export class Position {
  constructor(public x = 0, public y = 0) {}

  copyFrom(pos: Position) {
    this.x = pos.x;
    this.y = pos.y;

    return this;
  }

  moveTo(x: number, y: number) {
    this.x = x;
    this.y = y;

    return this;
  }

  isTheSameAs(pos: Position) {
    return this.x == pos.x && this.y == pos.y;
  }

  getDirection(pos: Position): Direction {
    if (pos.x > this.x) return Direction.EAST;
    if (pos.x < this.x) return Direction.WEST;
    if (pos.y > this.y) return Direction.SOUTH;
    if (pos.y < this.y) return Direction.NORTH;

    return Direction.NO_MOVE;
  }
}
