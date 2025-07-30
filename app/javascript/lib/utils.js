import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Utility functions for Game of Life

export const DENSITY = 0.2;
export const DEFAULT_ROWS = 45;
export const DEFAULT_COLS = 60;
export const DEFAULT_CELL_SIZE = 15;

export function generateGrid(rows, cols, density = DENSITY) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      alive: Math.random() < density,
      age: 0,
    }))
  );
}

export function isGridEmpty(grid) {
  return grid.every((row) => row.every((cell) => !cell.alive));
}

export function drawGrid(grid, canvasRef, cols, rows, cellSize) {
  if (!canvasRef.current) return;
  const ctx = canvasRef.current.getContext("2d");
  ctx.clearRect(0, 0, cols * cellSize, rows * cellSize);
  grid.forEach((row, i) =>
    row.forEach((cell, j) => {
      ctx.fillStyle = cell.alive
        ? `hsl(${(cell.age * 10) % 360}, 100%, 60%)`
        : `#09090b`;
      ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
    })
  );
}

export function toggleCell(grid, x, y) {
  return grid.map((row, rowIndex) =>
    row.map((col, colIndex) => ({
      ...col,
      alive: rowIndex === x && colIndex === y ? !col.alive : col.alive,
    }))
  );
}

export function generateEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      alive: false,
      age: 0,
    }))
  );
}

export function getCellFromClick(e, cellSize) {
  const rect = e.target.getBoundingClientRect();
  const x = Math.floor((e.clientY - rect.top) / cellSize);
  const y = Math.floor((e.clientX - rect.left) / cellSize);

  return { x, y };
}
