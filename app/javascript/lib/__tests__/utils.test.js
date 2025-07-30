import {
  cn,
  generateGrid,
  isGridEmpty,
  toggleCell,
  generateEmptyGrid,
  getCellFromClick,
  DENSITY,
  DEFAULT_ROWS,
  DEFAULT_COLS,
} from "../utils";

describe("Game of Life utils", () => {
  describe("generateGrid", () => {
    it("generates a grid of correct size", () => {
      const grid = generateGrid(3, 4);
      expect(grid.length).toBe(3);
      expect(grid[0].length).toBe(4);
    });
    it("respects density", () => {
      const grid = generateGrid(10, 10, 1);
      expect(grid.flat().every((cell) => cell.alive)).toBe(true);
    });
  });

  describe("isGridEmpty", () => {
    it("returns true for empty grid", () => {
      const grid = generateEmptyGrid(2, 2);
      expect(isGridEmpty(grid)).toBe(true);
    });
    it("returns false for non-empty grid", () => {
      const grid = generateEmptyGrid(2, 2);
      grid[0][0].alive = true;
      expect(isGridEmpty(grid)).toBe(false);
    });
  });

  describe("toggleCell", () => {
    it("toggles cell alive state", () => {
      const grid = generateEmptyGrid(2, 2);
      const newGrid = toggleCell(grid, 1, 1);
      expect(newGrid[1][1].alive).toBe(true);
      const toggledBack = toggleCell(newGrid, 1, 1);
      expect(toggledBack[1][1].alive).toBe(false);
    });
  });

  describe("generateEmptyGrid", () => {
    it("creates a grid with all cells dead", () => {
      const grid = generateEmptyGrid(3, 3);
      expect(grid.flat().every((cell) => !cell.alive)).toBe(true);
    });
  });

  describe("getCellFromClick", () => {
    it("calculates cell coordinates from click event", () => {
      const cellSize = 10;
      const mockEvent = {
        clientX: 25,
        clientY: 35,
        target: {
          getBoundingClientRect: () => ({ left: 5, top: 15 }),
        },
      };
      const { x, y } = getCellFromClick(mockEvent, cellSize);
      expect(x).toBe(Math.floor((35 - 15) / 10));
      expect(y).toBe(Math.floor((25 - 5) / 10));
    });
  });
});
