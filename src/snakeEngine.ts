import { cloneDeep } from "lodash";
import type { Direction, GameStatus, Cell, SnakeState } from "./types";
import { OPPOSITE_DIRECTION } from "./utils";

type StateUpdateListener = (state: SnakeState) => void;

const posEquals = (a: Cell, b: Cell) => a.r === b.r && a.c === b.c;

export class SnakeEngine {
  readonly rows: number;
  readonly cols: number;

  private snake: Cell[];
  private food: Cell;

  private directionQueue: Direction[];

  private tick = 0;
  private status: GameStatus;

  private subscribers: StateUpdateListener[] = [];

  constructor(rows: number, cols: number) {
    if (rows < 5 || cols < 5) {
      throw new Error("Too small snake grid size");
    }

    this.rows = rows;
    this.cols = cols;

    const snakeHead: Cell = { r: Math.floor(rows / 2), c: cols <= 6 ? 1 : 2 };
    this.snake = [snakeHead, { r: snakeHead.r, c: snakeHead.c - 1 }];

    this.food = { r: snakeHead.r, c: snakeHead.c + (cols <= 6 ? 2 : 3) };
    this.directionQueue = ["right"];
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
      status: this.status,
      snake: cloneDeep(this.snake),
      food: this.food,
      direction: this.directionQueue[0],
      tick: this.tick,
    };
  }

  changeDirection(newDirection: Direction) {
    if (OPPOSITE_DIRECTION[newDirection] !== this.directionQueue.slice(-1)[0]) {
      this.directionQueue.push(newDirection);
    }
  }

  getDirection() {
    return this.directionQueue;
  }

  private generateNewFood() {
    const candidates: Cell[] = [];

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
    const headPos: Cell = { ...this.snake[0] };

    if (this.directionQueue.length > 1) {
      this.directionQueue.shift();
    }
    const direction = this.directionQueue[0];

    switch (direction) {
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

  private isOutOfBounds(p: Cell) {
    if (p.r < 0 || p.r >= this.rows || p.c < 0 || p.c >= this.cols) {
      return true;
    }
    return false;
  }

  private isSnakeCell(p: Cell) {
    return this.snake.some((v) => posEquals(p, v));
  }

  nextTick(): SnakeState {
    if (this.status === "gameOver") {
      throw new Error("can't play after game over");
    }
    this.tick++;

    const headPos = this.calcNewHeadPos();

    if (posEquals(headPos, this.food)) {
      this.status = "eaten";
      this.generateNewFood();
    } else {
      this.status = "gameOn";
      this.snake.pop();
    }

    if (this.isOutOfBounds(headPos) || this.isSnakeCell(headPos)) {
      this.status = "gameOver";
    } else {
      this.snake.unshift(headPos);
    }

    this.sendUpdates();
    return this.getState();
  }

  private sendUpdates() {
    for (const listener of this.subscribers) {
      listener(this.getState());
    }
  }

  subscribeStateUpdate(listener: StateUpdateListener) {
    this.subscribers.push(listener);
  }

  unsubscribeStateUpdate(listener: StateUpdateListener) {
    this.subscribers = this.subscribers.filter((v) => v !== listener);
  }
}
