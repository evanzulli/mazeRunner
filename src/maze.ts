import { Delta } from '../src/delta';
import { Direction } from '../src/direction';
import { DrawZone } from '../src/drawZone';
import { Position } from '../src/position';
import { Runner } from '../src/runner';
import { Square, SquareType } from '../src/square';

export class Move {
  constructor(
    readonly position: Position,
    readonly direction: Direction,
    readonly from: Square,
    readonly to: Square
  ) {}
}

export class Maze {
  private runner: Runner = new Runner();
  private path: Move[] = [];
  private pathSnapShot: Move[] = null;
  private squares: Square[] = [];
  private size: Delta;
  private walls: Delta; // = new Delta(5, 5);
  private drawEnabled: boolean = true;

  constructor(
    private canvas: HTMLCanvasElement,
    private rows: number = 40,
    private cols: number = 40,
    private delay: number = 0.1
  ) {
    this.setSize();
    this.createSquares();
  }

  setSize() {
    const dx = this.canvas.width / this.cols;
    const dy = this.canvas.height / this.rows;

    this.size = new Delta(dx, dy);
    this.walls = new Delta(5, 5);
  }

  createSquares() {
    const count = this.rows * this.cols;

    for (let i = 0; i < count; i++) {
      this.squares.push(new Square(i));
    }
  }

  getContext(): CanvasRenderingContext2D {
    return <CanvasRenderingContext2D>this.canvas.getContext('2d');
  }

  drawPath() {
    this.drawMoves(this.path);
  }

  drawPathSnapShot() {
    if (this.hasPathSnapShot()) {
      this.drawMoves(this.pathSnapShot);
    }
  }

  drawMoves(moves: Move[]) {
    moves.forEach((m: Move) => {
      this.drawSquare(m.from.select());
    });
  }

  draw() {
    const context = this.getContext();
    const dx = this.cols * this.size.dx;
    const dy = this.rows * this.size.dy;

    context.fillStyle = 'black';
    context.fillRect(0, 0, dx, dy);

    context.strokeStyle = 'black';
    context.strokeRect(0, 0, dx, dy);

    this.squares.forEach((sq: Square) => {
      this.drawSquare(sq);
    });
  }

  drawSquare(sq: Square) {
    sq.draw(this.getDrawZone(sq));
  }

  startDigging() {
    const start = this.getSquareInPosition(
      new Position(this.cols / 2, this.rows / 2)
    );
    const end = this.squares[this.squares.length - 1];
    const pos = this.getPositionFromIndex(start.id);

    start.setType(SquareType.START);
    end.setType(SquareType.END);

    this.moveToPosition(pos);
    this.draw();

    this.animateDigger();
  }

  moveTo(x: number, y: number) {
    return this.moveToPosition(new Position(x, y));
  }

  moveToPosition(pos: Position): Position {
    return this.runner.moveToPosition(pos);
  }

  getPosition(): Position {
    return this.runner.getPosition();
  }

  getSquare() {
    return this.getSquareInPosition(this.getPosition());
  }

  rewindDigger() {
    let move = null,
      p = null;

    while (!move) {
      if ((p = this.getSquare().getPrevious())) {
        while (p.isType(SquareType.END) || p.isType(SquareType.START)) {
          p = p.getPrevious();
          if (!p) break;
        }
      }
      if (p) {
        this.moveToPosition(this.getPositionFromIndex(p.id));
        move = this.getNextMove();
      } else break;
    }
    return move;
  }

  getValidRewindMove() {
    let move = this.getFromPath();

    if (move) {
      if (
        move.position.isTheSameAs(this.getPosition()) ||
        move.from.isType(SquareType.END)
      ) {
        move = null;
      }
    }
    return move;
  }

  rewindPath() {
    let move = null; // this.getValidRewindMove();

    this.drawSquare(this.getSquare().deselect());

    while (!move) {
      this.removeFromPath();
      move = this.getFromPath();
      if (move) {
        this.moveToPosition(move.position);
        move = this.getNextMove();
      } else break;
    }
    return move;
  }

  selectSquare() {
    this.drawSquare(this.getSquare().select());
  }

  deselectSquare() {
    this.drawSquare(this.getSquare().deselect());
  }

  moveDigger(move: Move) {
    move.from.addConnection(move.to, move.direction);
    this.deselectSquare();

    move.to.setType(SquareType.USED);
    move.to.setPrevious(move.from);

    this.moveToPosition(move.position);
    this.addToPath(move);

    if (move.to.isType(SquareType.END)) {
      this.takePathSnapShot();
    }
    this.selectSquare();
  }

  animateDigger() {
    const i = setInterval(() => {
      if (this.digg()) {
        //this.drawPath();
      } else {
        this.drawPathSnapShot();
        clearInterval(i);
        console.log('end');
      }
    }, this.delay);
  }

  digg(): boolean {
    let move = this.getNextMove();

    // this.deselectDigger();
    if (!move) {
      move = this.rewindPath();
    }
    if (move) {
      this.moveDigger(move);
    }
    // this.selectDigger();

    return move != null;
  }

  hasPathSnapShot() {
    return this.pathSnapShot != null;
  }

  takePathSnapShot() {
    if (!this.hasPathSnapShot()) {
      const path = this.path.map((m: Move) => m).reverse();
      const i = path.findIndex((m: Move) => m.from.isType(SquareType.START));
      this.pathSnapShot = path
        .filter((m, j) => j < i)
        .reverse()
        .map((m: Move) => m);
    }
  }

  addToPath(move: Move) {
    this.path.push(move);
  }

  getFromPath(): Move {
    if (this.path.length) {
      return this.path[this.path.length - 1];
    }
  }

  removeFromPath(): Move {
    return this.path.pop();
  }

  canMoveToSquare(sq: Square): boolean {
    return sq.getPrevious() == null;
  }

  canMoveToPosition(pos: Position): boolean {
    if (
      pos &&
      !pos.isTheSameAs(this.getPosition()) &&
      this.isPositionInside(pos)
    ) {
      return this.canMoveToSquare(this.getSquareInPosition(pos));
    }
    return false;
  }

  moveRunner(dir: Direction) {}

  shuffle(arr: Direction[]): Direction[] {
    return arr.sort(() => 0.5 - Math.random());
  }

  getNextMove(): Move {
    const sq = this.getSquare();
    let move: Move = null;

    if (sq) {
      const dirs = <Direction[]>this.shuffle(sq.getEmptyDirections());

      dirs.some((dir: Direction) => {
        const pos = this.runner.getPositionFromDirection(dir);
        if (this.canMoveToPosition(pos)) {
          move = new Move(pos, dir, sq, this.getSquareInPosition(pos));
          return true;
        }
      });
    }
    return move;
  }

  isPositionInside(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.cols && pos.y >= 0 && pos.y < this.rows;
  }

  getDrawZone(sq: Square): DrawZone {
    const s = 2;
    const c = this.getContext();
    const p = this.getSquarePositionFromIndex(sq.id);
    const dz = new DrawZone(c, p, this.size, this.walls);
    const sd = new Delta(s, s);

    return dz.shrink(sd);
  }

  getPositionFromIndex(index: number) {
    const x = index % this.cols;
    const y = Math.trunc(index / this.cols);

    return new Position(x, y);
  }

  getSquarePositionFromIndex(index: number) {
    const p = this.getPositionFromIndex(index);
    return p.moveTo(p.x * this.size.dx, p.y * this.size.dy);
  }

  getSquareInPosition(pos: Position): Square {
    const i = pos.y * this.cols + pos.x;

    if (i >= 0 && i < this.squares.length) {
      return this.squares[i];
    }

    return null;
  }
}
