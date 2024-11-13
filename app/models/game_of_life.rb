class GameOfLife
  def initialize(grid)
    @grid = grid
    @rows = grid.size
    @cols = grid.first.size
  end

  def next_generation
    new_grid = @grid.map.with_index do |row, i|
      row.map.with_index do |cell, j|
        neighbors = count_neighbors(i, j)
        next_state(cell, neighbors)
      end
    end
    new_grid
  end

  private

  def count_neighbors(i, j)
    neighbors = 0
    (-1..1).each do |dx|
      (-1..1).each do |dy|
        next if dx == 0 && dy == 0

        x = (i + dx) % @rows
        y = (j + dy) % @cols
        neighbors += 1 if @grid[x][y]["alive"]
      end
    end
    neighbors
  end

  def next_state(cell, neighbors)
    if cell["alive"]
      { "alive" => neighbors == 2 || neighbors == 3, "age" => cell["age"] + 1 }
    else
      { "alive" => neighbors == 3, "age" => 0 }
    end
  end
end
