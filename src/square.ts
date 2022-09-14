import { Direction } from '../src/direction';
import { DrawZone } from '../src/drawZone';

export enum SquareType {
  EMPTY = 0,
  USED = 1,
  START = 2,
  END = 3,
}

export class Square {
  private type: SquareType = SquareType.EMPTY;
  private selected: boolean = false;
  private previous: Square;
  private connections: Square[];

  constructor(readonly id: number) {
    this.connections = Array(4).fill(null);
  }

  addConnection(sq: Square, dir: Direction) {
    this.connections[dir] = sq;
  }

  hasConnectionTo(dir: Direction): boolean {
    return this.connections[dir] != null;
  }

  getEmptyDirections(): Direction[] {
    return this.connections
      .filter((sq: Square) => sq == null)
      .map((sq: Square, i: number) => i);
  }

  getUsedDirections(): Direction[] {
    return this.connections
      .filter((sq: Square) => sq != null)
      .map((sq: Square, i: number) => i);
  }

  setPrevious(sq: Square) {
    if (!this.previous) this.previous = sq;
  }

  getPrevious(): Square {
    return this.previous;
  }

  getTypeStyle() {
    if (!this.selected) {
      let style = 'white';

      switch (this.type) {
        case SquareType.EMPTY:
          style = 'black';
          break;
        case SquareType.START:
          style = 'green';
          break;
        case SquareType.END:
          style = 'red';
          break;
      }
      return style;
    }
    return 'cyan';
  }

  draw(dz: DrawZone) {
    const p = dz.position;
    const s = dz.size;
    const w = dz.walls;
    const c = dz.context;

    c.beginPath();
    c.moveTo(p.x, p.y);

    if (this.hasConnectionTo(Direction.NORTH)) {
      c.lineTo(p.x, p.y - w.dy);
      c.lineTo(p.x + s.dx, p.y - w.dy);
    }
    c.lineTo(p.x + s.dx, p.y);

    if (this.hasConnectionTo(Direction.EAST)) {
      c.lineTo(p.x + s.dx + w.dx, p.y);
      c.lineTo(p.x + s.dx + w.dx, p.y + s.dy);
    }
    c.lineTo(p.x + s.dx, p.y + s.dy);

    if (this.hasConnectionTo(Direction.SOUTH)) {
      c.lineTo(p.x + s.dx, p.y + s.dy + w.dy);
      c.lineTo(p.x, p.y + s.dy + w.dy);
    }
    c.lineTo(p.x, p.y + s.dy);

    if (this.hasConnectionTo(Direction.WEST)) {
      c.lineTo(p.x - w.dx, p.y + s.dy);
      c.lineTo(p.x - w.dx, p.y);
    }
    c.lineTo(p.x, p.y);
    c.closePath();

    c.lineWidth = 1;
    c.fillStyle = this.getTypeStyle();
    c.fill();
  }

  setType(type: SquareType) {
    if (this.isType(SquareType.EMPTY)) {
      this.type = type;
    }
  }

  isType(type: SquareType): boolean {
    return this.type == type;
  }

  getType(): SquareType {
    return this.type;
  }

  select(): Square {
    return this.setSelected(true);
  }

  deselect(): Square {
    return this.setSelected(false);
  }

  setSelected(selected: boolean): Square {
    this.selected = selected;
    return this;
  }
}
