import type { Direction, Cell, SnakeState } from "./types";

const GRID_COLOR_1 = "#575757";
const GRID_COLOR_2 = "#5E5E5E";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private rows: number;
  private cols: number;
  private tickRate: number;

  private animCtx = {
    startTime: -1,
    curRAF: -1,
  };

  private curState: SnakeState | null = null;
  private prevState: SnakeState | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    cellSize: number,
    rows: number,
    cols: number,
    tickRate: number,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.cellSize = cellSize;
    this.rows = rows;
    this.cols = cols;
    this.tickRate = tickRate;

    canvas.height = rows * cellSize;
    canvas.width = cols * cellSize;
  }

  private cords(pos: Cell) {
    return { x: pos.c * this.cellSize, y: pos.r * this.cellSize };
  }

  private grid() {
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

  private gameOverCross(pos: Cell) {
    const sz = this.cellSize;
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    this.ctx.moveTo(pos.c * sz, pos.r * sz);
    this.ctx.lineTo(pos.c * sz + sz, pos.r * sz + sz);
    this.ctx.moveTo(pos.c * sz + sz - 1, pos.r * sz);
    this.ctx.lineTo(pos.c * sz, pos.r * sz + sz - 1);
    this.ctx.stroke();
  }

  private rectFromRowCol(color: string, pos: Cell) {
    this.ctx.fillStyle = color;
    const sz = this.cellSize;
    this.ctx.fillRect(pos.c * sz, pos.r * sz, sz, sz);
  }

  private food() {
    this.rectFromRowCol("#E96929", this.curState!.food);
  }

  private getDirection(front: Cell, back: Cell): Direction {
    if (front.r + 1 === back.r) {
      return "up";
    } else if (front.r - 1 === back.r) {
      return "down";
    } else if (front.c - 1 === back.c) {
      return "right";
    } else if (front.c + 1 === back.c) {
      return "left";
    } else {
      throw new Error(
        `Incorrect getDirection call with data: (${front.r} ${front.c}) (${back.r} ${back.c})`,
      );
    }
  }

  private diff(cur: Cell, prev: Cell, offset: number, color: string) {
    const pos = this.cords(prev);
    switch (this.getDirection(cur, prev)) {
      case "up":
        pos.y -= offset;
        break;
      case "right":
        pos.x += offset;
        break;
      case "down":
        pos.y += offset;
        break;
      case "left":
        pos.x -= offset;
        break;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(pos.x, pos.y, this.cellSize, this.cellSize);
  }

  private snake(offset: number) {
    const snake = this.curState!.snake;

    for (let i = 1; i < snake.length; i++) {
      this.rectFromRowCol("#6CD757", snake[i]);
    }

    if (this.prevState && this.curState!.status !== "gameOver") {
      this.diff(
        this.curState!.snake[0],
        this.prevState.snake[0],
        offset,
        "#FFAB00",
      );
    } else {
      this.rectFromRowCol("#FFAB00", this.curState!.snake[0]);

      if (this.curState!.status === "gameOver") {
        this.gameOverCross(this.curState!.snake[0]);
      }
    }

    let tail: Cell;

    if (!this.prevState) {
      tail = this.curState!.snake.slice(-1)[0];
    } else {
      tail = this.prevState.snake.slice(-1)[0];
      if (this.prevState.snake.length === this.curState!.snake.length) {
        this.diff(this.curState!.snake.slice(-1)[0], tail, offset, "#6CD757");
      } else {
        this.rectFromRowCol("#6CD757", tail);
      }
    }
  }

  private rafHandler(curTime: DOMHighResTimeStamp) {
    if (this.animCtx.startTime === -1) {
      this.animCtx.startTime = curTime;
    }

    const progress = Math.min(
      (curTime - this.animCtx.startTime) / this.tickRate,
      1,
    );
    const offset = Math.round(progress * this.cellSize);

    this.grid();
    this.snake(offset);
    this.food();

    if (progress !== 1) {
      this.animCtx.curRAF = requestAnimationFrame((t) => this.rafHandler(t));
    }
  }

  updateState(s: SnakeState) {
    if (this.curState !== null) {
      this.prevState = this.curState;
    }
    this.curState = s;

    this.animCtx.startTime = -1;
    cancelAnimationFrame(this.animCtx.curRAF);
    this.animCtx.curRAF = requestAnimationFrame((t) => this.rafHandler(t));
  }
}
