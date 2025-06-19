import type { Point, SnakeState } from "./types";

const GRID_COLOR_1 = "#575757";
const GRID_COLOR_2 = "#5E5E5E";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private rows: number;
  private cols: number;

  constructor(
    canvas: HTMLCanvasElement,
    cellSize: number,
    rows: number,
    cols: number,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.cellSize = cellSize;
    this.rows = rows;
    this.cols = cols;

    canvas.height = rows * cellSize;
    canvas.width = cols * cellSize;
  }

  private renderGrid() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if ((r & 1) === (c & 1)) {
          this.ctx.fillStyle = GRID_COLOR_1;
        } else {
          this.ctx.fillStyle = GRID_COLOR_2;
        }
        this.ctx.fillRect(
          c * this.cellSize,
          r * this.cellSize,
          this.cellSize,
          this.cellSize,
        );
      }
    }
  }

  private rect(color: string, p: Point) {
    this.ctx.fillStyle = color;
    const sz = this.cellSize;
    this.ctx.fillRect(p.c * sz, p.r * sz, sz, sz);
  }

  render(s: SnakeState) {
    this.renderGrid();

    for (const v of s.snake) {
      this.rect("#6CD757", v);
    }
    this.rect("#E96929", s.food);

    if (s.gameStatus === "gameOver") {
      const sz = this.cellSize;
      const head = s.snake[0];
      this.ctx.strokeStyle = "red";
      this.ctx.lineWidth = 3;

      this.ctx.beginPath();
      this.ctx.moveTo(head.c * sz, head.r * sz);
      this.ctx.lineTo(head.c * sz + sz, head.r * sz + sz);
      this.ctx.moveTo(head.c * sz + sz - 1, head.r * sz);
      this.ctx.lineTo(head.c * sz, head.r * sz + sz - 1);
      this.ctx.stroke();
    } else {
      this.rect("#FFAB00", s.snake[0]);
    }
  }
}
