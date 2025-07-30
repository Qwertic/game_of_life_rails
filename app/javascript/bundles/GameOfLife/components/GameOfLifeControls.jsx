import React from "react";
import { Button } from "./ui/Button";
import { PlayIcon } from "../icons/Play";
import { PauseIcon } from "../icons/Pause";
import { RefreshIcon } from "../icons/Refresh";
import { DeleteIcon } from "../icons/Trash";

const GameOfLifeControls = ({
  running,
  isPaused,
  disabled,
  resetGrid,
  clearGrid,
  onPlayPause,
}) => (
  <div className="p-4 rounded-b-xl">
    <h2 className="text-lg font-semibold text-white">Simulation Controller</h2>
    <div className="flex py-2 w-1/2 gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={onPlayPause}
        disabled={disabled}
        title={running ? (isPaused ? "Resume" : "Pause") : "Play"}
      >
        {running && !isPaused ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={resetGrid}
        title="Reset Grid"
      >
        <RefreshIcon />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={clearGrid}
        title="Clear Grid"
      >
        <DeleteIcon />
      </Button>
    </div>
  </div>
);

export default GameOfLifeControls;
