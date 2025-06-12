import { useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import styles from "./SnakeGame.module.css";
import { SnakeEngine } from "./snakeEngine";

export const SnakeGame = () => {
  const snakeEngineRef = useRef<SnakeEngine>(null);
  if (snakeEngineRef.current === null) {
    snakeEngineRef.current = new SnakeEngine();
  }
  const engine = snakeEngineRef.current!;

  const [grid, setGrid] = useState(() => engine.getGrid());

  useEffect(() => {
    const keyDownHandler = (ev: KeyboardEvent) => {
      switch (ev.key) {
        case "ArrowUp":
          engine.changeDirection("up");
          break;
        case "ArrowDown":
          engine.changeDirection("down");
          break;
        case "ArrowLeft":
          engine.changeDirection("left");
          break;
        case "ArrowRight":
          engine.changeDirection("right");
          break;
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = engine.nextTick();
      setGrid(engine.getGrid());
    }, 166 * 2);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className={styles.snakeGame}>
      <Board grid={grid} />
    </main>
  );
};
