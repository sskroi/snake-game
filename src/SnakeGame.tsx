import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SnakeGame.module.css";
import { SnakeEngine } from "./snakeEngine";
import { TransparentModal } from "./ui/TransparentModal";
import { useGameControls } from "./hooks/gameControl";
import { Renderer } from "./renderer";

const TICK_RATE = 140;

export const SnakeGame = () => {
  const engine = useRef<SnakeEngine>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer>(null);
  const [gameStatus, setGameStatus] = useState("");
  const [paused, setPaused] = useState(true);
  const [bestScore, setBestScore] = useState(() =>
    localStorage.getItem("bestScore"),
  );

  const [sizeData, setSizeData] = useState<{
    rows: number;
    cols: number;
    cellSize: number;
  } | null>(null);

  useEffect(() => {
    const sizeData = calcBoardSize(window.innerWidth, window.innerHeight);
    setSizeData(sizeData);
  }, []);

  const restart = useCallback(
    (unpause: boolean = true) => {
      if (sizeData !== null && paused && canvasRef.current) {
        engine.current = new SnakeEngine(sizeData.rows, sizeData.cols);

        renderer.current = new Renderer(
          canvasRef.current,
          sizeData.cellSize,
          sizeData.rows,
          sizeData.cols,
          TICK_RATE,
        );

        engine.current.subscribeStateUpdate((s) =>
          renderer.current!.updateState(s),
        );

        if (unpause) {
          setPaused(false);
        }
        setGameStatus(engine.current.getStatus());
      }
    },
    [sizeData, paused],
  );

  useEffect(() => {
    restart(false);
  }, [sizeData]);

  useEffect(() => {
    const gameOverHandler = () => {
      setPaused(true);

      const score = engine.current!.getScore();
      if (bestScore === null || score > +bestScore) {
        setBestScore(score.toString());
        localStorage.setItem("bestScore", score.toString());
      }
    };

    const tickHandler = () => {
      if (
        engine.current &&
        engine.current.getStatus() !== "gameOver" &&
        !paused
      ) {
        const state = engine.current.nextTick();

        if (state.status === "gameOver") {
          gameOverHandler();
        }
        setGameStatus(state.status);
      }
    };

    const interval = setInterval(tickHandler, TICK_RATE);
    return () => clearInterval(interval);
  }, [paused, bestScore]);

  const touchHandlers = useGameControls({
    onChangeDirection: (dir) => engine.current?.changeDirection(dir),
    onPause: setPaused,
    onRestart: restart,
  });

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
