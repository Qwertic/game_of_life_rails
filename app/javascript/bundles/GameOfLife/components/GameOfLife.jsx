import React, { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

import Sidebar from "./Sidebar";
import { Separator } from "./ui/Separator";
import GameOfLifeControls from "./GameOfLifeControls";
import {
  generateGrid,
  isGridEmpty,
  drawGrid,
  toggleCell,
  generateEmptyGrid,
  getCellFromClick,
  DEFAULT_ROWS,
  DEFAULT_COLS,
  DEFAULT_CELL_SIZE,
} from "lib/utils";
import { apiStartSimulation, apiCancelJob } from "lib/gameOfLifeApi";
import { createGameOfLifeSubscription } from "lib/gameOfLifeSubscription";

const GameOfLife = () => {
  const rows = DEFAULT_ROWS; // Set grid size
  const cols = DEFAULT_COLS;
  const cellSize = DEFAULT_CELL_SIZE;

  // State Variables
  const [grid, setGrid] = useState(() => generateGrid(rows, cols));
  const [running, setRunning] = useState(false);
  const [jobId, setJobId] = useState(null);
  const canvasRef = useRef(null);

  const hasActiveJob = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  // Cancel the running job
  const cancelJob = useCallback(() => {
    if (jobId) {
      apiCancelJob(jobId).then(() => {
        setJobId(null);
        hasActiveJob.current = false;
      });
    }
  }, [jobId]);

  // Function to start the simulation with a given grid
  const startSimulation = useCallback((initialGrid) => {
    toast("Starting simulation");
    apiStartSimulation(initialGrid)
      .then((data) => {
        setJobId(data.job_id);
        hasActiveJob.current = true;
      })
      .catch((error) => {
        console.error("Error starting simulation:", error);
        toast.error("Failed to start simulation. Please try again.");
        hasActiveJob.current = false;
        setRunning(false);
      });
  }, []);

  // Function to clear the grid
  const clearGrid = useCallback(() => {
    const emptyGrid = generateEmptyGrid(rows, cols);
    setGrid(emptyGrid);
    if (hasActiveJob.current) {
      cancelJob();
      setRunning(false);
      hasActiveJob.current = false;
    }

    toast("Grid cleared");
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

    toast("Grid reset");
  }, [rows, cols, cancelJob]);

  // Handle canvas click to update grid and pause simulation
  const handleCanvasClick = useCallback(
    (e) => {
      const { x, y } = getCellFromClick(e, cellSize);
      const newGrid = toggleCell(grid, x, y);
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
    const subscription = createGameOfLifeSubscription({
      onGridUpdate: (grid) => {
        setGrid(grid);
        drawGrid(grid, canvasRef, cols, rows, cellSize);
      },
      onJobStatus: (data) => {
        if (data.status === "running" && data.job_id) {
          setJobId(data.job_id);
          setRunning(true);
          hasActiveJob.current = true;
        } else {
          setJobId(null);
          setRunning(false);
          hasActiveJob.current = false;
        }
      },
      onConnect: () => {
        console.log("Successfully connected to GameOfLifeChannel");
      },
      onDisconnect: () => {
        console.log("Disconnected from GameOfLifeChannel");
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [canvasRef, cols, rows, cellSize]);

  // Modified effect to handle play/pause/resume
  useEffect(() => {
    if (running && !hasActiveJob.current) {
      toast("Starting new game simulation");
      startSimulation(grid);
      setIsPaused(false);
    } else if (!running && hasActiveJob.current) {
      toast("Stopping game simulation");
      cancelJob();
      hasActiveJob.current = false;
      setIsPaused(true);
    }
  }, [running, grid, startSimulation, cancelJob]);

  // Render the grid on the canvas
  const drawGridCallback = useCallback(
    (grid) => {
      drawGrid(grid, canvasRef, cols, rows, cellSize);
    },
    [canvasRef, cols, rows, cellSize]
  );

  // Update the canvas on grid change
  useEffect(() => {
    drawGridCallback(grid);
  }, [grid, drawGridCallback]);

  // Add beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasActiveJob.current) {
        // Cancel the running simulation
        cancelJob();

        // Show confirmation dialog
        e.preventDefault();
        e.returnValue =
          "You have a running simulation. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (hasActiveJob.current) {
        cancelJob();
      }
    };
  }, [cancelJob]);

  return (
    <div className="w-full flex gap-4">
      <div className="flex flex-col">
        <canvas
          ref={canvasRef}
          width={cols * cellSize}
          height={rows * cellSize}
          className="border border-border rounded-xl cursor-pointer transition-colors shadow-xs shadow-gray-500"
          onClick={handleCanvasClick}
        />
      </div>
      <div className="flex h-full flex-col ml-4 mx-auto rounded-xl border-border bg-background items-stretch">
        <Sidebar />
        <Separator className="bg-gray-600" />
        <GameOfLifeControls
          grid={grid}
          running={running}
          isPaused={isPaused}
          isGridEmpty={isGridEmpty}
          setRunning={setRunning}
          resetGrid={resetGrid}
          clearGrid={clearGrid}
        />
      </div>
    </div>
  );
};

export default GameOfLife;
