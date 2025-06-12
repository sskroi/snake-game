import type { FC } from "react";
import styles from "./Board.module.css";
import type { CellType } from "./snakeEngine";

interface BoardProps {
  grid: CellType[][];
}

interface FlatCell {
  row: number;
  col: number;
  type: CellType;
}

export const Board: FC<BoardProps> = ({ grid }) => {
  console.log(grid);

  const flatCells: FlatCell[] = [];

  for (let i = 0; i < grid.length; i++) {
    flatCells.push(...grid[i].map((v, j) => ({ row: i, col: j, type: v })));
  }

  return (
    <div className={styles.board}>
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
