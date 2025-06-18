type Point = { r: number; c: number };

const CT = {
  EMPTY: "empty",
  BODY: "body",
  HEAD: "head",
  FOOD: "food",
  WALL: "wall",
} as const;
type CellType = (typeof CT)[keyof typeof CT];
export type ToRenderCell = { type: CellType } & Point;

const DIRECTION = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
} as const;
export type DireactionType = (typeof DIRECTION)[keyof typeof DIRECTION];

const STATUS = {
  GAME_ON: "gameOn",
  GAME_OVER: "gameOver",
  EATEN: "eaten",
} as const;
type GameStatusType = (typeof STATUS)[keyof typeof STATUS];

const OPPOSITE_DIRECTIONS: Record<DireactionType, DireactionType> = {
  [DIRECTION.UP]: DIRECTION.DOWN,
  [DIRECTION.DOWN]: DIRECTION.UP,
  [DIRECTION.LEFT]: DIRECTION.RIGHT,
  [DIRECTION.RIGHT]: DIRECTION.LEFT,
};

const posEquals = (a: Point, b: Point) => a.r === b.r && a.c === b.c;

export class SnakeEngine {
  readonly rows: number;
  readonly cols: number;
  private snake: Point[];
  private food: Point;
  private toRender: ToRenderCell[];
  private direction: DireactionType;
  private status: GameStatusType;

  constructor(rows: number, cols: number) {
    if (rows < 5 || cols < 5) {
      throw new Error("Too small snake grid size");
    }

    this.rows = rows;
    this.cols = cols;

    const snakeHead: Point = { r: Math.floor(rows / 2), c: cols <= 6 ? 1 : 2 };
    this.snake = [snakeHead, { r: snakeHead.r, c: snakeHead.c - 1 }];

    this.food = { r: snakeHead.r, c: snakeHead.c + (cols <= 6 ? 2 : 3) };
    this.direction = DIRECTION.RIGHT;
    this.status = STATUS.GAME_ON;
    this.toRender = [
      { ...this.food, type: CT.FOOD },
      { ...snakeHead, type: CT.HEAD },
      { ...this.snake[1], type: CT.BODY },
    ];
  }

  getStatus() {
    return this.status;
  }

  getScore() {
    return Math.max(this.snake.length - 2, 0);
  }

  getToRender() {
    return this.toRender.slice();
  }

  changeDirection(newDirection: DireactionType) {
    if (OPPOSITE_DIRECTIONS[newDirection] !== this.direction) {
      this.direction = newDirection;
    }
  }

  private unshiftSnake(v: Point) {
    this.snake.unshift(v);
    this.toRender.push({ ...v, type: CT.HEAD });
  }

  private generateNewFood() {
    let candidates: Point[] = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        var cand = { r, c };
        if (!this.isSnakeCell(cand) && !posEquals(cand, this.food)) {
          candidates.push(cand);
        }
      }
    }

    this.food = candidates[Math.floor(Math.random() * candidates.length)];
    this.toRender.push({ ...this.food, type: CT.FOOD });
  }

  private calcNewHeadPos() {
    const headPos: Point = { ...this.snake[0] };

    switch (this.direction) {
      case DIRECTION.UP:
        headPos.r -= 1;
        break;
      case DIRECTION.DOWN:
        headPos.r += 1;
        break;
      case DIRECTION.LEFT:
        headPos.c -= 1;
        break;
      case DIRECTION.RIGHT:
        headPos.c += 1;
        break;
    }

    return headPos;
  }

  private isOutOfBounds(p: Point) {
    if (p.r < 0 || p.r >= this.rows || p.c < 0 || p.c >= this.cols) {
      return true;
    }
    return false;
  }

  private isSnakeCell(p: Point) {
    return this.snake.some((v) => posEquals(p, v));
  }

  nextTick(): GameStatusType {
    if (this.status === STATUS.GAME_OVER) {
      throw new Error("can't play after game over");
    }

    this.toRender.length = 0;

    const headPos = this.calcNewHeadPos();

    this.toRender.push({ ...this.snake[0], type: CT.BODY });

    if (posEquals(headPos, this.food)) {
      this.status = STATUS.EATEN;
      this.generateNewFood();
    } else {
      this.status = STATUS.GAME_ON;
      this.toRender.push({ ...this.snake.pop()!, type: CT.EMPTY });
    }

    if (this.isOutOfBounds(headPos) || this.isSnakeCell(headPos)) {
      return (this.status = STATUS.GAME_OVER);
    }

    this.unshiftSnake(headPos);

    return this.status;
  }
}
