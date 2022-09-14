export class Delta {
  constructor(public dx = 0, public dy = 0) {}

  copyFrom(d: Delta) {
    this.dx = d.dx;
    this.dy = d.dy;

    return this;
  }
}
