import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SnakeGame.module.css";
import { SnakeEngine } from "./snakeEngine";
import { TransparentModal } from "./ui/TransparentModal";
import { useGameControls } from "./hooks/gameControl";
import { Renderer } from "./renderer";

export const SnakeGame = () => {
  const engine = useRef<SnakeEngine>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer>(null);
  const [gameStatus, setGameStatus] = useState("");
  const [paused, setPaused] = useState(true);
  const [bestScore, setBestScore] = useState(() =>
    localStorage.getItem("bestScore"),
  );

  const [sizeData, setSizeData] = useState({
    rows: 0,
    cols: 0,
    cellSize: 0,
  });

  useEffect(() => {
    const sizeData = calcBoardSize(window.innerWidth, window.innerHeight);
    setSizeData(sizeData);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      renderer.current = new Renderer(
        canvasRef.current,
        sizeData.cellSize,
        sizeData.rows,
        sizeData.cols,
      );
    }
  }, [sizeData]);

  const restart = useCallback(() => {
    if (paused) {
      engine.current = new SnakeEngine(sizeData.rows, sizeData.cols);
      setGameStatus(engine.current.getStatus());
      setPaused(false);
    }
  }, [sizeData, paused]);

  const touchHandlers = useGameControls({
    onChangeDirection: (dir) => engine.current?.changeDirection(dir),
    onPause: setPaused,
    onRestart: restart,
  });

  useEffect(() => {
    const tickHandler = () => {
      if (
        engine.current &&
        engine.current.getStatus() !== "gameOver" &&
        !paused
      ) {
        const status = engine.current.nextTick();
        renderer.current?.render(engine.current.getState());
        if (status === "gameOver") {
          setPaused(true);

          const score = engine.current.getScore();
          if (bestScore === null || score > +bestScore) {
            setBestScore(score.toString());
            localStorage.setItem("bestScore", score.toString());
          }
        }
        setGameStatus(status);
      }
    };

    const interval = setInterval(tickHandler, 140);
    return () => clearInterval(interval);
  }, [paused, bestScore]);

  return (
    <main
      className={styles.snakeGame}
      style={{ touchAction: "none" }}
      {...touchHandlers}
    >
      <canvas ref={canvasRef} className={styles.board} />
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
