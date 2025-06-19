export type Point = { r: number; c: number };

export type Direction = "up" | "right" | "down" | "left";
export type GameStatus = "gameOn" | "gameOver" | "eaten";

export interface SnakeState {
  gameStatus: GameStatus;
  snake: Point[];
  food: Point;
  direction: Direction;
}
