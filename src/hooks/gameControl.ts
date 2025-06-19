import { useEffect, useRef } from "react";

type DirectionType = "up" | "down" | "left" | "right";
type GameControlCallbacks = {
  onChangeDirection: (dir: DirectionType) => void;
  onRestart: () => void;
  onPause: (paused: boolean) => void;
};

export function useGameControls({
  onChangeDirection,
  onRestart,
  onPause,
}: GameControlCallbacks) {
  const touchData = useRef({ startX: -1, startY: -1 });

  // keyboard controls
  useEffect(() => {
    const keyDownHandler = (ev: KeyboardEvent) => {
      switch (ev.code) {
        case "Space":
          onPause(false);
          onRestart();
          break;
        case "ArrowUp":
          onChangeDirection("up");
          break;
        case "ArrowDown":
          onChangeDirection("down");
          break;
        case "ArrowLeft":
          onChangeDirection("left");
          break;
        case "ArrowRight":
          onChangeDirection("right");
          break;
      }
    };

    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [onChangeDirection, onRestart, onPause]);

  // touch controls
  const onTouchStart = (ev: React.TouchEvent) => {
    const touch = ev.changedTouches[0];
    touchData.current.startX = touch.clientX;
    touchData.current.startY = touch.clientY;
  };

  const onTouchEnd = () => {
    onRestart();
  };

  const onTouchMove = (ev: React.TouchEvent) => {
    ev.preventDefault();
    const touch = ev.changedTouches[0];
    const dx = touch.clientX - touchData.current.startX;
    const dy = touch.clientY - touchData.current.startY;
    const threshold = 30;

    const changeDirection = (dir: DirectionType) => {
      onChangeDirection(dir);
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

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
