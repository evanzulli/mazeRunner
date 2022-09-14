import { Delta } from '../src/delta';
import { Direction } from '../src/direction';
import { Position } from '../src/position';

export class Runner {
  private deltas: Delta[] = [];
  private position: Position;

  constructor(x: number = 0, y: number = 0, canDigg: boolean = false) {
    this.position = new Position(x, y);

    this.deltas[Direction.NORTH] = new Delta(0, -1);
    this.deltas[Direction.SOUTH] = new Delta(0, 1);
    this.deltas[Direction.EAST] = new Delta(1, 0);
    this.deltas[Direction.WEST] = new Delta(-1, 0);
  }

  getPosition(): Position {
    return this.position;
  }

  moveInDirection(dir: Direction): Position {
    return this.moveToPosition(this.getPositionFromDirection(dir));
  }

  moveToPosition(pos: Position): Position {
    this.position.copyFrom(pos);
    return this.position;
  }

  getPositionFromDirection(dir: Direction): Position {
    const d = this.deltas[dir];

    if (d) {
      const p = new Position(this.position.x + d.dx, this.position.y + d.dy);
      return p;
    }
    return null;
  }
}
