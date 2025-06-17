import { useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import styles from "./SnakeGame.module.css";
import { SnakeEngine } from "./snakeEngine";
import { TransparentModal } from "./ui/TransparentModal";

export const SnakeGame = () => {
  const engine = useRef<SnakeEngine>(null);
  const [grid, setGrid] = useState(() => engine.current?.getGrid());
  const [gameStatus, setGameStatus] = useState("");
  const [paused, setPaused] = useState(true);
  const [bestScore, setBestScore] = useState(() =>
    localStorage.getItem("bestScore"),
  );

  const [sizeData, setSizeData] = useState({
    w: 0,
    h: 0,
    rows: 0,
    cols: 0,
    cellSize: 40,
  });
  useEffect(() => {
    let cellSize = 28;

    let width = 0;
    if ((width = window.innerWidth - 30) > 768) {
      width = 800;
      cellSize = 40;
    }

    const height = window.innerHeight - 140;

    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    setSizeData((s) => ({
      ...s,
      cols,
      rows,
      h: cellSize * rows,
      w: cellSize * cols,
      cellSize,
    }));
  }, []);

  useEffect(() => {
    const keyDownHandler = (ev: KeyboardEvent) => {
      switch (ev.key) {
        case " ":
          if (paused) {
            engine.current = new SnakeEngine(sizeData.rows, sizeData.cols);
            setGameStatus(engine.current.getStatus());
            setPaused(false);
          }
          break;
        case "ArrowUp":
          engine.current?.changeDirection("up");
          break;
        case "ArrowDown":
          engine.current?.changeDirection("down");
          break;
        case "ArrowLeft":
          engine.current?.changeDirection("left");
          break;
        case "ArrowRight":
          engine.current?.changeDirection("right");
          break;
      }
    };

    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [paused, sizeData]);

  useEffect(() => {
    const tickHandler = () => {
      if (
        engine.current &&
        engine.current.getStatus() !== "gameOver" &&
        !paused
      ) {
        const status = engine.current.nextTick();
        if (status === "gameOver") {
          setPaused(true);

          const score = engine.current.getScore();
          if (bestScore === null || score > +bestScore) {
            setBestScore(score.toString());
            localStorage.setItem("bestScore", score.toString());
          }
        }
        setGrid(engine.current.getGrid());
        setGameStatus(status);
      }
    };

    const interval = setInterval(tickHandler, 166);
    return () => clearInterval(interval);
  }, [paused, bestScore]);

  const touchData = useRef({ startX: -1, startY: -1 });
  const touchStartHandler = (ev: React.TouchEvent) => {
    const touch = ev.changedTouches[0];
    touchData.current.startX = touch.clientX;
    touchData.current.startY = touch.clientY;
  };

  const touchEndHandler = (ev: React.TouchEvent) => {
    if (paused) {
      engine.current = new SnakeEngine(sizeData.rows, sizeData.cols);
      setGameStatus(engine.current.getStatus());
      setPaused(false);
      return;
    }

    const touch = ev.changedTouches[0];
    const dx = touch.clientX - touchData.current.startX;
    const dy = touch.clientY - touchData.current.startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 10) {
        engine.current?.changeDirection("right");
      } else if (dx < -10) {
        engine.current?.changeDirection("left");
      }
    } else {
      if (dy > 10) {
        engine.current?.changeDirection("down");
      } else if (dy < -10) {
        engine.current?.changeDirection("up");
      }
    }
  };

  return (
    <main
      className={styles.snakeGame}
      onTouchStart={touchStartHandler}
      onTouchEnd={touchEndHandler}
      style={{ touchAction: "none" }}
      onTouchMove={(ev) => ev.preventDefault()}
    >
      <Board
        grid={grid}
        cellSize={sizeData.cellSize}
        width={sizeData.w}
        height={sizeData.h}
      />
      <div className={styles.score}>SCORE: {engine.current?.getScore()}</div>
      <TransparentModal open={paused}>
        <div className={styles.modalText}>
          {gameStatus === "gameOver" && (
            <>
              <p>GAME OVER </p>
              <p>SCORE: {engine.current?.getScore()}</p>
              {bestScore !== undefined && <p>BEST SCORE: {bestScore}</p>}
            </>
          )}
          <p>Press SPACE to start</p>
        </div>
      </TransparentModal>
    </main>
  );
};
