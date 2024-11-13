import React, { useState, useCallback, useRef, useEffect } from "react";
import { createConsumer } from "@rails/actioncable";

import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import Sidebar from "./Sidebar";
import { Separator } from "./ui/Separator";

import { PlayIcon } from "../icons/Play";
import { PauseIcon } from "../icons/Pause";
import { CircleChevronRight } from "../icons/Step";
import { RefreshIcon } from "../icons/Refresh";
import { DeleteIcon } from "../icons/Trash";

const DENSITY = 0.2;

// Game of Life Component
const GameOfLife = () => {
  const rows = 45; // Set grid size
  const cols = 60;
  const cellSize = 15;

  // Generate a random grid based on density
  const generateGrid = (rows, cols) => {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        alive: Math.random() < DENSITY,
        age: 0,
      }))
    );
  };

  // State Variables
  const [grid, setGrid] = useState(() => generateGrid(rows, cols));
  const [running, setRunning] = useState(false);
  const [jobId, setJobId] = useState(null);
  const canvasRef = useRef(null);

  const hasActiveJob = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  // Function to check if grid is empty
  const isGridEmpty = useCallback((grid) => {
    return grid.every((row) => row.every((cell) => !cell.alive));
  }, []);

  // Cancel the running job
  const cancelJob = useCallback(() => {
    if (jobId) {
      fetch(`/game_of_life/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
        body: JSON.stringify({ job_id: jobId }),
      }).then(() => {
        setJobId(null);
        hasActiveJob.current = false;
      });
    }
  }, [jobId]);

  // Function to start the simulation with a given grid
  const startSimulation = useCallback((initialGrid) => {
    console.log("Starting simulation with grid...");
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");

    fetch("/game_of_life", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ game: { grid: initialGrid } }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Server response:", data);
        setJobId(data.job_id);
        hasActiveJob.current = true;
      })
      .catch((error) => {
        console.error("Error starting simulation:", error);
        hasActiveJob.current = false;
        setRunning(false);
      });
  }, []);

  // Function to clear the grid
  const clearGrid = useCallback(() => {
    const emptyGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        alive: false,
        age: 0,
      }))
    );
    setGrid(emptyGrid);
    if (hasActiveJob.current) {
      cancelJob();
      setRunning(false);
      hasActiveJob.current = false;
    }
  }, [rows, cols, cancelJob]);

  // Modified reset function to handle simulation restart
  const resetGrid = useCallback(() => {
    const newGrid = generateGrid(rows, cols);
    setGrid(newGrid);

    if (hasActiveJob.current) {
      cancelJob();
      hasActiveJob.current = false;
      setTimeout(() => {
        setRunning(true);
      }, 100);
    }
  }, [rows, cols, cancelJob]);

  // Handle canvas click to update grid and pause simulation
  const handleCanvasClick = useCallback(
    (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = Math.floor((e.clientY - rect.top) / cellSize);
      const y = Math.floor((e.clientX - rect.left) / cellSize);

      const newGrid = grid.map((row, rowIndex) =>
        row.map((col, colIndex) => ({
          ...col,
          alive: rowIndex === x && colIndex === y ? !col.alive : col.alive,
        }))
      );

      setGrid(newGrid);

      // If simulation is running, pause it
      if (hasActiveJob.current) {
        cancelJob();
        hasActiveJob.current = false;
        setRunning(false);
        setIsPaused(true);
      }
    },
    [grid, cancelJob]
  );

  // Set up WebSocket connection
  useEffect(() => {
    console.log("Setting up WebSocket connection...");

    const cable = createConsumer();

    const subscription = cable.subscriptions.create(
      { channel: "GameOfLifeChannel" },
      {
        connected() {
          console.log("Successfully connected to GameOfLifeChannel");
        },
        disconnected() {
          console.log("Disconnected from GameOfLifeChannel");
        },
        received(data) {
          console.log("Raw message received:", data);
          if (data && data.type === "grid_update" && data.grid) {
            console.log("Updating grid with received data");
            setGrid(data.grid);
            drawGrid(data.grid);
          }
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Modified effect to handle play/pause/resume
  useEffect(() => {
    if (running && !hasActiveJob.current) {
      console.log("Starting new game simulation...");
      startSimulation(grid);
      setIsPaused(false);
    } else if (!running && hasActiveJob.current) {
      console.log("Stopping game simulation...");
      cancelJob();
      hasActiveJob.current = false;
      setIsPaused(true);
    }
  }, [running, grid, startSimulation, cancelJob]);

  // Render the grid on the canvas
  const drawGrid = useCallback(
    (grid) => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, cols * cellSize, rows * cellSize);

      grid.forEach((row, i) =>
        row.forEach((cell, j) => {
          ctx.fillStyle = cell.alive
            ? `hsl(${(cell.age * 10) % 360}, 100%, 60%)`
            : `#111827`;
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        })
      );
    },
    [cols, rows]
  );

  // Update the canvas on grid change
  useEffect(() => {
    drawGrid(grid);
  }, [grid]);

  return (
    <div className="w-full flex">
      <div className="flex flex-col">
        <canvas
          ref={canvasRef}
          width={cols * cellSize}
          height={rows * cellSize}
          className="border border-gray-800 rounded-xl cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>
      <div className="flex flex-col ml-4 mx-auto rounded-xl border-border bg-background/80">
        <Sidebar />
        <Separator className="bg-gray-600" />
        <div className="p-4 rounded-b-xl">
          <h2 className="text-lg font-semibold text-white">Controls</h2>
          <div className="flex py-2 w-1/2 gap-2">
            <Button
              size="icon"
              variant="default"
              onClick={() => setRunning(!running)}
              disabled={isGridEmpty(grid)}
              title={running ? (isPaused ? "Resume" : "Pause") : "Play"}
            >
              {running && !isPaused ? <PauseIcon /> : <PlayIcon />}
            </Button>

            <Button
              size="icon"
              variant="default"
              onClick={resetGrid}
              title="Reset Grid"
            >
              <RefreshIcon />
            </Button>

            <Button
              size="icon"
              variant="default"
              onClick={clearGrid}
              title="Clear Grid"
            >
              <DeleteIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOfLife;
