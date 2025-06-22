import type { Direction, Cell, SnakeState } from "./types";

const GRID_COLOR_1 = "#575757";
const GRID_COLOR_2 = "#5E5E5E";

type Point = { x: number; y: number };

const SNAKE_COLOR = "#6CD757";

const cellEquals = (a: Cell, b: Cell) => a.r === b.r && a.c === b.c;

type DirectionNone = Direction | "none";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private rows: number;
  private cols: number;
  private tickRate: number;

  private animStartTime: number = 0;
  private curRAF: number | null = null;
  private curTickRendering: number = -1;

  private curSt: SnakeState | null = null;
  private pTickSt: SnakeState | null = null;

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

    this.grid();
  }

  private pointFromCell(pos: Cell): Point {
    return { x: pos.c * this.cellSize, y: pos.r * this.cellSize };
  }
  private midPointFromCell(pos: Cell): Point {
    const sz = this.cellSize;
    return { x: pos.c * sz + sz / 2, y: pos.r * sz + sz / 2 };
  }

  private grid() {
    const rows = this.rows;
    const cols = this.cols;
    const ctx = this.ctx;
    const sz = this.cellSize;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if ((r & 1) === (c & 1)) {
          ctx.fillStyle = GRID_COLOR_1;
        } else {
          ctx.fillStyle = GRID_COLOR_2;
        }
        this.ctx.fillRect(c * sz, r * sz, sz, sz);
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
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private rectFromCell(color: string, pos: Cell) {
    this.ctx.fillStyle = color;
    const sz = this.cellSize;
    this.ctx.fillRect(pos.c * sz, pos.r * sz, sz, sz);
  }

  private food() {
    this.rectFromCell("#E96929", this.curSt!.food);
  }

  private diff(cur: Cell, prev: Cell, offset: number, color: string) {
    const pos = this.pointFromCell(prev);
    switch (getDirection(cur, prev)) {
      case "up":
        pos.y += offset;
        break;
      case "right":
        pos.x -= offset;
        break;
      case "down":
        pos.y -= offset;
        break;
      case "left":
        pos.x += offset;
        break;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(pos.x, pos.y, this.cellSize, this.cellSize);
  }

  private isAngleMidCell(i: number) {
    const a = this.curSt!.snake[i - 1];
    const b = this.curSt!.snake[i + 1];
    return a.c !== b.c && a.r !== b.r;
  }

  private borderPoint(base: Cell, to: Cell): Point {
    const sz = this.cellSize;
    const baseX = base.c * sz;
    const baseY = base.r * sz;
    const offset = sz / 2;
    switch (getDirection(base, to)) {
      case "up":
        return { x: baseX + offset, y: baseY };
      case "right":
        return { x: baseX + sz, y: baseY + offset };
      case "down":
        return { x: baseX + offset, y: baseY + sz };
      case "left":
        return { x: baseX, y: baseY + offset };
      default:
        return { x: baseX, y: baseY };
    }
  }

  private snakeMidChunk(
    stCell: Cell,
    midCell: Cell,
    endCell: Cell,
    width: number,
  ) {
    const c = this.ctx;

    const st = this.borderPoint(midCell, stCell);
    const end = this.borderPoint(midCell, endCell);
    const mid = this.midPointFromCell(midCell);

    c.beginPath();
    c.moveTo(st.x, st.y);
    c.bezierCurveTo(st.x, st.y, mid.x, mid.y, end.x, end.y);
    c.strokeStyle = SNAKE_COLOR;
    c.lineWidth = width;
    c.stroke();
  }

  private tail(
    beforeCell: Cell,
    tail: Cell,
    offset: number,
    width: number,
    color: string,
  ) {
    let startAngle: number, endAngle: number;
    const pi = Math.PI;

    const pos = this.midPointFromCell(tail);
    const dir = getDirection(tail, beforeCell);
    moveToDirection(pos, dir, offset);
    const lineEndPos = moveToDirection({ ...pos }, dir, width / 2 + 3);

    switch (dir) {
      case "up":
        startAngle = 0;
        endAngle = -pi;
        break;
      case "none":
      case "right":
        startAngle = pi / 2;
        endAngle = pi * 1.5;
        break;
      case "down":
        startAngle = pi;
        endAngle = pi * 2;
        break;
      case "left":
        startAngle = pi * 1.5;
        endAngle = pi / 2;
        break;
    }

    const c = this.ctx;
    c.beginPath();
    c.arc(pos.x, pos.y, width / 2, startAngle, endAngle);
    c.closePath();
    c.fillStyle = color;
    c.fill();

    c.beginPath();
    c.moveTo(pos.x, pos.y);
    c.lineTo(lineEndPos.x, lineEndPos.y);
    c.lineWidth = width;
    c.strokeStyle = color;
    c.stroke();
  }

  private snake(offset: number) {
    const snake = this.curSt!.snake;
    let curWidth = this.cellSize - 6;

    for (let i = 1; i < snake.length - 1; i++) {
      this.snakeMidChunk(snake[i - 1], snake[i], snake[i + 1], curWidth);
    }

    if (this.pTickSt && this.curSt!.status !== "gameOver") {
      this.diff(this.curSt!.snake[0], this.pTickSt.snake[0], offset, "#FFAB00");
    } else {
      this.rectFromCell("#FFAB00", this.curSt!.snake[0]);

      if (this.curSt!.status === "gameOver") {
        this.gameOverCross(this.curSt!.snake[0]);
      }
    }

    // let tail: Cell;

    // if (!this.pTickSt) {
    //   tail = this.curSt!.snake.at(-1)!;
    // } else {
    // tail = this.pTickSt.snake.at(-1)!;
    // if (this.pTickSt.snake.length === this.curSt!.snake.length) {
    if (this.pTickSt && this.curSt!.status !== "eaten") {
      this.tail(
        this.curSt!.snake.at(-1)!,
        this.pTickSt!.snake.at(-1)!,
        offset,
        curWidth,
        "#6CD757",
      );
    }

    // if (this.pTickSt && this.curSt!.status !== "eaten") {
    //   this.snakeMidChunk(
    //     snake.at(-2)!,
    //     snake.at(-1)!,
    //     this.pTickSt.snake.at(-1)!,
    //     curWidth,
    //   );
    // }

    // this.snakeMidChunk(
    //   snake.at(-2)!,
    //   snake.at(-1)!,
    //   this.pTickSt.snake.at(-1)!,
    //   curWidth,
    // );
    // } else {
    //   this.rectFromCell("#6CD757", tail);
    // }
    // }
  }

  private tickAnimProgress(t: DOMHighResTimeStamp) {
    return Math.min((t - this.animStartTime) / this.tickRate, 1);
  }

  private rafHandler(curTime: DOMHighResTimeStamp) {
    if (this.curSt!.tick !== this.curTickRendering) {
      this.curTickRendering = this.curSt!.tick;
      this.animStartTime = curTime;
    }

    const progress = this.tickAnimProgress(curTime);
    const offset = Math.round(progress * this.cellSize);

    if (progress !== 1) {
      this.grid();
      this.snake(offset);
      this.food();
    }

    this.curRAF = requestAnimationFrame((t) => this.rafHandler(t));
  }

  updateState(st: SnakeState) {
    if (this.curSt !== null && st.tick !== this.curSt.tick) {
      this.pTickSt = this.curSt;
    }
    this.curSt = st;

    if (this.curRAF === null) {
      this.curRAF = requestAnimationFrame((t) => this.rafHandler(t));
    }
  }
}

function getDirection(base: Cell, to: Cell): DirectionNone {
  if (to.r + 1 === base.r) {
    return "up";
  } else if (to.r - 1 === base.r) {
    return "down";
  } else if (to.c - 1 === base.c) {
    return "right";
  } else if (to.c + 1 === base.c) {
    return "left";
  } else if (cellEquals(base, to)) {
    return "none";
  } else {
    throw new Error(
      `Incorrect getDirection call with data: (${base.r} ${base.c}) (${to.r} ${to.c})`,
    );
  }
}

function moveToDirection(
  pos: Point,
  direction: DirectionNone,
  offset: number,
): Point {
  switch (direction) {
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
    case "none":
      break;
  }
  return pos;
}
