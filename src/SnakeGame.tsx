import { useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import styles from "./SnakeGame.module.css";
import { SnakeEngine } from "./snakeEngine";
import { TransparentModal } from "./ui/TransparentModal";

export const SnakeGame = () => {
  const engine = useRef<SnakeEngine>(null);
  if (engine.current === null) {
    engine.current = new SnakeEngine();
  }
  const [grid, setGrid] = useState(() => engine.current!.getGrid());
  const [gameStatus, setGameStatus] = useState(() =>
    engine.current!.getStatus(),
  );
  const [paused, setPaused] = useState(true);
  const [bestScore, setBestScore] = useState(() =>
    localStorage.getItem("bestScore"),
  );

  useEffect(() => {
    const keyDownHandler = (ev: KeyboardEvent) => {
      switch (ev.key) {
        case "ArrowUp":
          engine.current!.changeDirection("up");
          break;
        case "ArrowDown":
          engine.current!.changeDirection("down");
          break;
        case "ArrowLeft":
          engine.current!.changeDirection("left");
          break;
        case "ArrowRight":
          engine.current!.changeDirection("right");
          break;
        case " ":
          if (paused) {
            engine.current = new SnakeEngine();
            setGameStatus(engine.current.getStatus());
            setPaused(false);
          }
          break;
      }
    };

    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [paused]);

  useEffect(() => {
    const tickHandler = () => {
      if (engine.current!.getStatus() !== "gameOver" && !paused) {
        const status = engine.current!.nextTick();
        if (status === "gameOver") {
          setPaused(true);

          const score = engine.current!.getScore();
          if (bestScore === null || score > +bestScore) {
            setBestScore(score.toString());
            localStorage.setItem("bestScore", score.toString());
          }
        }
        setGrid(engine.current!.getGrid());
        setGameStatus(status);
      }
    };

    const interval = setInterval(tickHandler, 166);
    return () => clearInterval(interval);
  }, [paused, bestScore]);

  return (
    <main className={styles.snakeGame}>
      <Board grid={grid} />
      <div className={styles.score}>SCORE: {engine.current!.getScore()}</div>
      <TransparentModal open={paused}>
        <div className={styles.modalText}>
          {gameStatus === "gameOver" && (
            <>
              <p>GAME OVER </p>
              <p>SCORE: {engine.current!.getScore()}</p>
              {bestScore !== undefined && <p>BEST SCORE: {bestScore}</p>}
            </>
          )}
          <p>Press SPACE to start</p>
        </div>
      </TransparentModal>
    </main>
  );
};
