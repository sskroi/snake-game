export type Cell = { r: number; c: number };

export type Direction = "up" | "right" | "down" | "left";
export type GameStatus = "gameOn" | "gameOver" | "eaten";

export interface SnakeState {
  status: GameStatus;
  tick: number;
  snake: Cell[];
  food: Cell;
  direction: Direction;
}
