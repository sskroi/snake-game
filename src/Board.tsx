import { useEffect, useRef, type CanvasHTMLAttributes, type FC } from "react";
import styles from "./Board.module.css";
import type { CellType } from "./snakeEngine";

interface BoardProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
  grid: CellType[][] | undefined;
  cellSize: number;
}

const renderGrid = (
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  rows: number,
  cols: number,
) => {
  ctx.strokeStyle = "#535353";
  for (let i = 0; i <= rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(cols * cellSize, i * cellSize);
    ctx.stroke();
  }

  for (let j = 0; j <= cols; j++) {
    ctx.beginPath();
    ctx.moveTo(j * cellSize, 0);
    ctx.lineTo(j * cellSize, rows * cellSize);
    ctx.stroke();
  }
};

export const Board: FC<BoardProps> = ({ grid, cellSize, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!grid) return;

    const ctx = canvasRef.current!.getContext("2d")!;
    const rows = grid.length;
    const cols = grid[0].length;

    const drawRect = (color: string, row: number, col: number) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        row * cellSize + 1,
        col * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
      );
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        switch (grid[r][c]) {
          case "empty":
            ctx.clearRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
            break;
          case "body":
            drawRect("#6CD757", c, r);
            break;
          case "head":
            drawRect("#B7D53E", c, r);
            break;
          case "food":
            drawRect("#E96929", c, r);
            break;
        }
      }
    }
  }, [grid]);

  useEffect(() => {
    if (!grid) return;

    const ctx = canvasRef.current!.getContext("2d")!;
    renderGrid(ctx, cellSize, grid.length, grid[0].length);
  }, [cellSize, grid?.length, grid?.[0].length]);

  return <canvas ref={canvasRef} className={styles.board} {...props}></canvas>;
};
