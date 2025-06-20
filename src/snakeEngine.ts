import type { Direction, GameStatus, Point, SnakeState } from "./types";

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const posEquals = (a: Point, b: Point) => a.r === b.r && a.c === b.c;

export class SnakeEngine {
  readonly rows: number;
  readonly cols: number;
  private snake: Point[];
  private food: Point;
  private direction: Direction;
  private status: GameStatus;

  constructor(rows: number, cols: number) {
    if (rows < 5 || cols < 5) {
      throw new Error("Too small snake grid size");
    }

    this.rows = rows;
    this.cols = cols;

    const snakeHead: Point = { r: Math.floor(rows / 2), c: cols <= 6 ? 1 : 2 };
    this.snake = [snakeHead, { r: snakeHead.r, c: snakeHead.c - 1 }];

    this.food = { r: snakeHead.r, c: snakeHead.c + (cols <= 6 ? 2 : 3) };
    this.direction = "right";
    this.status = "gameOn";
  }

  getStatus() {
    return this.status;
  }

  getScore() {
    return Math.max(this.snake.length - 2, 0);
  }

  getState(): SnakeState {
    return {
      gameStatus: this.status,
      snake: this.snake.slice(),
      food: this.food,
      direction: this.direction,
    };
  }

  changeDirection(newDirection: Direction) {
    if (OPPOSITE_DIRECTIONS[newDirection] !== this.direction) {
      this.direction = newDirection;
    }
  }

  getDirection() {
    return this.direction;
  }

  private generateNewFood() {
    const candidates: Point[] = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        var cand = { r, c };
        if (!this.isSnakeCell(cand) && !posEquals(cand, this.food)) {
          candidates.push(cand);
        }
      }
    }

    this.food = candidates[Math.floor(Math.random() * candidates.length)];
  }

  private calcNewHeadPos() {
    const headPos: Point = { ...this.snake[0] };

    switch (this.direction) {
      case "up":
        headPos.r -= 1;
        break;
      case "down":
        headPos.r += 1;
        break;
      case "left":
        headPos.c -= 1;
        break;
      case "right":
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

  nextTick(): GameStatus {
    if (this.status === "gameOver") {
      throw new Error("can't play after game over");
    }

    const headPos = this.calcNewHeadPos();

    if (posEquals(headPos, this.food)) {
      this.status = "eaten";
      this.generateNewFood();
    } else {
      this.status = "gameOn";
      this.snake.pop();
    }

    if (this.isOutOfBounds(headPos) || this.isSnakeCell(headPos)) {
      return (this.status = "gameOver");
    }

    this.snake.unshift(headPos);

    return this.status;
  }
}
