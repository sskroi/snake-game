import type { FC, HTMLAttributes } from "react";
import styles from "./Board.module.css";
import type { CellType } from "./snakeEngine";

interface BoardProps extends HTMLAttributes<HTMLDivElement> {
  grid: CellType[][] | undefined;
}

interface FlatCell {
  row: number;
  col: number;
  type: CellType;
}

export const Board: FC<BoardProps> = ({ grid, ...props }) => {
  const flatCells: FlatCell[] = [];

  if (grid) {
    for (let i = 0; i < grid.length; i++) {
      flatCells.push(...grid[i].map((v, j) => ({ row: i, col: j, type: v })));
    }
  }

  return (
    <div className={styles.board} {...props}>
      {flatCells.map((v) => (
        <div
          key={`r${v.row}c${v.col}`}
          className={`${styles.cell} ${styles[v.type]}`}
          style={{
            gridRow: v.row + 1,
            gridColumn: v.col + 1,
          }}
        ></div>
      ))}
    </div>
  );
};
