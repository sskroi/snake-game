import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import styles from "./SnakeGame.module.css";
import {
  SnakeEngine,
  type SnakeDireactionType,
  type ToRenderCell,
} from "./snakeEngine";
import { TransparentModal } from "./ui/TransparentModal";

export const SnakeGame = () => {
  const engine = useRef<SnakeEngine>(null);
  const [toRender, setToRender] = useState<ToRenderCell[]>([]);
  const [gameStatus, setGameStatus] = useState("");
  const [paused, setPaused] = useState(true);
  const [bestScore, setBestScore] = useState(() =>
    localStorage.getItem("bestScore"),
  );
  const [tryCount, setTryCount] = useState(1);

  const [sizeData, setSizeData] = useState({
    rows: 0,
    cols: 0,
    cellSize: 0,
  });

  useEffect(() => {
    const sizeData = calcBoardSize(window.innerWidth, window.innerHeight);

    setSizeData(sizeData);
  }, []);

  const restart = useCallback(() => {
    engine.current = new SnakeEngine(sizeData.rows, sizeData.cols);
    setGameStatus(engine.current.getStatus());
    setToRender(engine.current.getToRender());
    setPaused(false);
    setTryCount((s) => s + 1);
  }, [sizeData.rows, sizeData.cols]);

  useEffect(() => {
    const keyDownHandler = (ev: KeyboardEvent) => {
      switch (ev.key) {
        case " ":
          if (paused) {
            restart();
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
  }, [paused, sizeData, restart]);

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
        setToRender(engine.current.getToRender());
        setGameStatus(status);
      }
    };

    const interval = setInterval(tickHandler, 140);
    return () => clearInterval(interval);
  }, [paused, bestScore]);

  const touchData = useRef({ startX: -1, startY: -1 });

  const touchStartHandler = (ev: React.TouchEvent) => {
    const touch = ev.changedTouches[0];
    touchData.current.startX = touch.clientX;
    touchData.current.startY = touch.clientY;
  };

  const touchEndHandler = () => {
    if (paused) {
      restart();
    }
  };

  const touchMoveHandler = (ev: React.TouchEvent) => {
    ev.preventDefault();
    const touch = ev.changedTouches[0];
    const dx = touch.clientX - touchData.current.startX;
    const dy = touch.clientY - touchData.current.startY;
    const threshold = 30;

    const changeDirection = (dir: SnakeDireactionType) => {
      engine.current?.changeDirection(dir);
      touchData.current.startX = touch.clientX;
      touchData.current.startY = touch.clientY;
    };

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) {
        changeDirection("right");
      } else if (dx < -threshold) {
        changeDirection("left");
      }
    } else {
      if (dy > threshold) {
        changeDirection("down");
      } else if (dy < -threshold) {
        changeDirection("up");
      }
    }
  };

  return (
    <main
      className={styles.snakeGame}
      onTouchStart={touchStartHandler}
      onTouchMove={touchMoveHandler}
      onTouchEnd={touchEndHandler}
      style={{ touchAction: "none" }}
    >
      <Board
        key={tryCount.toString()}
        toRender={toRender}
        cellSize={sizeData.cellSize}
        rows={sizeData.rows}
        cols={sizeData.cols}
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

function calcBoardSize(windowWidth: number, windowHeight: number) {
  let cellSize = -1;
  let width = windowWidth;
  let height = windowHeight;

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

  if (width > 992) {
    width = Math.floor(width * 0.5);
    cellSize = 40;
    height -= 100;
  } else if (width > 768) {
    width = Math.floor(width * 0.85);
    cellSize = 32;
    height -= 80;
  } else {
    width = width - rem - 4;
    cellSize = 28;
    height -= 60;
  }

  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);

  return { rows, cols, cellSize };
}
