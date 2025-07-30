# frozen_string_literal: true

# This file is part of the Game of Life Rails application.
# It defines the GameOfLife model which implements the logic for the Game of Life simulation.
class GameOfLife
  def initialize(grid)
    @grid = grid
    @rows = grid.size
    @cols = grid.first.size
  end

  def next_generation
    @grid.map.with_index do |row, i|
      row.map.with_index do |cell, j|
        neighbors = count_neighbors(i, j)
        next_state(cell, neighbors)
      end
    end
  end

  private

  def count_neighbors(row_idx, col_idx)
    neighbors = 0
    (-1..1).each do |dx|
      (-1..1).each do |dy|
        next if dx.zero? && dy.zero?

        x = (row_idx + dx) % @rows
        y = (col_idx + dy) % @cols
        neighbors += 1 if @grid[x][y]['alive']
      end
    end
    neighbors
  end

  def next_state(cell, neighbors)
    if cell['alive']
      { 'alive' => [2, 3].include?(neighbors), 'age' => cell['age'] + 1 }
    else
      { 'alive' => neighbors == 3, 'age' => 0 }
    end
  end
end
