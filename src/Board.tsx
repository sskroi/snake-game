import { useEffect, useRef, type CanvasHTMLAttributes, type FC } from "react";
import styles from "./Board.module.css";
import type { ToRenderCell } from "./snakeEngine";

interface BoardProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
  toRender: ToRenderCell[] | undefined;
  cellSize: number;
  rows: number;
  cols: number;
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

export const Board: FC<BoardProps> = ({
  toRender,
  cellSize,
  rows,
  cols,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!toRender) return;

    const ctx = canvasRef.current!.getContext("2d")!;

    const drawRect = (color: string, row: number, col: number) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        row * cellSize + 1,
        col * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
      );
    };

    for (const v of toRender) {
      switch (v.type) {
        case "empty":
          ctx.clearRect(
            v.c * cellSize + 1,
            v.r * cellSize + 1,
            cellSize - 2,
            cellSize - 2,
          );
          break;
        case "body":
          drawRect("#6CD757", v.c, v.r);
          break;
        case "head":
          drawRect("#B7D53E", v.c, v.r);
          break;
        case "food":
          drawRect("#E96929", v.c, v.r);
          break;
      }
    }
  }, [toRender, cellSize]);

  useEffect(() => {
    const ctx = canvasRef.current!.getContext("2d")!;
    renderGrid(ctx, cellSize, rows, cols);
  }, [cellSize, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.board}
      height={rows * cellSize}
      width={cols * cellSize}
      {...props}
    />
  );
};
