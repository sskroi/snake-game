type Point = [number, number];

const CT = {
  EMPTY: "empty",
  BODY: "body",
  HEAD: "head",
  FOOD: "food",
  WALL: "wall",
} as const;
export type CellType = (typeof CT)[keyof typeof CT];

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

const posEquals = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];

export class SnakeEngine {
  private grid: CellType[][];
  private snake: Point[];
  private food: Point;
  private direction: DireactionType;
  private status: GameStatusType;

  private static initEmptyGrid(h: number, w: number) {
    if (h < 10 || w < 10) {
      throw new Error("too small size of grid");
    }
    // for walls
    h += 2;
    w += 2;

    const grid: CellType[][] = new Array(h);
    let i = 0,
      j = 0;
    for (i = 0; i < h; i++) {
      grid[i] = new Array(w);
      for (j = 0; j < w; j++) {
        grid[i][j] = CT.EMPTY;
      }
    }

    // setup walls on border
    for (i = 0; i < h; i++) {
      grid[i][0] = CT.WALL;
      grid[i][w - 1] = CT.WALL;
    }
    for (j = 1; j < w; j++) {
      grid[0][j] = CT.WALL;
      grid[h - 1][j] = CT.WALL;
    }

    return grid;
  }

  constructor(gridH: number = 16, gridW: number = 16) {
    this.grid = SnakeEngine.initEmptyGrid(gridH, gridW);

    const snakeHead: Point = [Math.floor(this.grid.length / 2), 4];
    this.snake = [snakeHead, [snakeHead[0], snakeHead[1] - 1]];

    this.grid[snakeHead[0]][snakeHead[1]] = CT.HEAD;
    for (let i = 1; i < this.snake.length; i++) {
      this.grid[this.snake[i][0]][this.snake[i][1]] = CT.BODY;
    }

    this.food = [snakeHead[0], snakeHead[1] + 4];
    this.grid[this.food[0]][this.food[1]] = CT.FOOD;

    this.direction = DIRECTION.RIGHT;

    this.status = STATUS.GAME_ON;
  }

  getGrid() {
    const grid = this.grid.slice();
    grid.shift();
    grid.pop();
    return grid.map((v) => {
      const newV = v.slice();
      newV.shift();
      newV.pop();
      return newV;
    });
  }

  getStatus() {
    return this.status;
  }

  getScore() {
    return this.snake.length - 2;
  }

  changeDirection(dir: DireactionType) {
    if (
      (dir === DIRECTION.UP && this.snake[1][0] === this.snake[0][0] - 1) ||
      (dir === DIRECTION.DOWN && this.snake[1][0] === this.snake[0][0] + 1) ||
      (dir === DIRECTION.LEFT && this.snake[1][1] === this.snake[0][1] - 1) ||
      (dir === DIRECTION.RIGHT && this.snake[1][1] === this.snake[0][1] + 1)
    ) {
      return;
    }

    this.direction = dir;
  }

  private generateNewFood() {
    const candidates: Point[] = [];

    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[0].length; j++) {
        if (this.grid[i][j] === CT.EMPTY) {
          candidates.push([i, j]);
        }
      }
    }

    const newFoodPos =
      candidates[Math.floor(Math.random() * candidates.length)];

    this.food = newFoodPos;
    this.grid[newFoodPos[0]][newFoodPos[1]] = CT.FOOD;
  }

  nextTick(): GameStatusType {
    if (this.status === STATUS.GAME_OVER) {
      throw new Error("can't play after game over");
    }

    const headPos = this.snake[0].slice() as Point;

    switch (this.direction) {
      case DIRECTION.UP:
        headPos[0] -= 1;
        break;
      case DIRECTION.DOWN:
        headPos[0] += 1;
        break;
      case DIRECTION.LEFT:
        headPos[1] -= 1;
        break;
      case DIRECTION.RIGHT:
        headPos[1] += 1;
        break;
    }

    this.snake.unshift(headPos);
    this.grid[this.snake[1][0]][this.snake[1][1]] = CT.BODY;

    if (posEquals(headPos, this.food)) {
      this.status = STATUS.EATEN;
      this.generateNewFood();
    } else {
      this.status = STATUS.GAME_ON;
      const toClear = this.snake.pop()!;
      this.grid[toClear[0]][toClear[1]] = CT.EMPTY;
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (posEquals(this.snake[i], headPos)) {
        this.status = STATUS.GAME_OVER;
      }
    }

    if (this.grid[headPos[0]][headPos[1]] === CT.WALL) {
      this.status = STATUS.GAME_OVER;
    }

    this.grid[headPos[0]][headPos[1]] = CT.HEAD;

    return this.status;
  }
}
