import { useEffect, useRef } from "react";

type DirectionType = "up" | "down" | "left" | "right";
type GameControlCallbacks = {
  onChangeDirection: (dir: DirectionType) => void;
  onRestart: () => void;
  onPause: (paused: boolean) => void;
};

const SWIPE_THRESHOLD = 36;

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
        case "KeyW":
        case "ArrowUp":
          onChangeDirection("up");
          break;
        case "KeyS":
        case "ArrowDown":
          onChangeDirection("down");
          break;
        case "KeyA":
        case "ArrowLeft":
          onChangeDirection("left");
          break;
        case "KeyD":
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

    const changeDirection = (dir: DirectionType) => {
      onChangeDirection(dir);
      touchData.current.startX = touch.clientX;
      touchData.current.startY = touch.clientY;
    };

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > SWIPE_THRESHOLD) {
        changeDirection("right");
      } else if (dx < -SWIPE_THRESHOLD) {
        changeDirection("left");
      }
    } else {
      if (dy > SWIPE_THRESHOLD) {
        changeDirection("down");
      } else if (dy < -SWIPE_THRESHOLD) {
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
