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
type DireactionType = (typeof DIRECTION)[keyof typeof DIRECTION];

const STATUS = {
  GAME_ON: "gameOn",
  GAME_OVER: "gameOver",
  EATEN: "eaten",
} as const;
type GameStatusType = (typeof STATUS)[keyof typeof STATUS];

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

  changeDirection(dir: DireactionType) {
    if (
      (dir === DIRECTION.UP && this.snake[1].r === this.snake[0].r - 1) ||
      (dir === DIRECTION.DOWN && this.snake[1].r === this.snake[0].r + 1) ||
      (dir === DIRECTION.LEFT && this.snake[1].c === this.snake[0].c - 1) ||
      (dir === DIRECTION.RIGHT && this.snake[1].c === this.snake[0].c + 1)
    ) {
      return;
    }

    this.direction = dir;
  }

  private unshiftSnake(v: Point) {
    this.snake.unshift(v);
    this.toRender.push({ ...v, type: CT.HEAD });
  }

  private generateNewFood() {
    let candidate: Point;

    const randValue = (maxValue: number) =>
      Math.floor(Math.random() * maxValue);

    do {
      candidate = { r: randValue(this.rows), c: randValue(this.cols) };
    } while (
      this.snake.some((v) => posEquals(v, candidate)) ||
      posEquals(this.food, candidate)
    );

    this.food = candidate;
    this.toRender.push({ ...candidate, type: CT.FOOD });
  }

  nextTick(): GameStatusType {
    if (this.status === STATUS.GAME_OVER) {
      throw new Error("can't play after game over");
    }

    this.toRender.length = 0;

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

    this.toRender.push({ ...this.snake[0], type: CT.BODY });

    if (posEquals(headPos, this.food)) {
      this.status = STATUS.EATEN;
      this.generateNewFood();
    } else {
      this.status = STATUS.GAME_ON;
      this.toRender.push({ ...this.snake.pop()!, type: CT.EMPTY });
    }

    if (
      headPos.r < 0 ||
      headPos.r >= this.rows ||
      headPos.c < 0 ||
      headPos.c >= this.cols
    ) {
      return (this.status = STATUS.GAME_OVER);
    }

    for (const v of this.snake) {
      if (posEquals(v, headPos)) {
        return (this.status = STATUS.GAME_OVER);
      }
    }

    this.unshiftSnake(headPos);

    return this.status;
  }
}
