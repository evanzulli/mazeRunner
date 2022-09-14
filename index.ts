import './style.css';
import { Maze } from './src/maze';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const boton = <HTMLButtonElement>document.getElementById('generar');

boton.addEventListener('click', () => {
  new Maze(canvas, 30, 30, 0).startDigging();
});
