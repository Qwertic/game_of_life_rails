# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
require 'rails_helper'

RSpec.describe GameOfLife do
  def make_grid(rows, cols, alive_coords = [])
    Array.new(rows) do |i|
      Array.new(cols) { |j| { 'alive' => alive_coords.include?([i, j]), 'age' => 0 } }
    end
  end

  let(:empty_grid) { make_grid(3, 3) }
  let(:single_alive) { make_grid(3, 3, [[1, 1]]) }
  let(:block_grid) { make_grid(3, 3, [[1, 1], [1, 2], [2, 1], [2, 2]]) }
  let(:all_alive) { make_grid(3, 3, (0..2).to_a.product((0..2).to_a)) }
  let(:blinker) { make_grid(3, 3, [[1, 0], [1, 1], [1, 2]]) }

  describe '#next_generation' do
    it 'returns a grid of the same size' do
      game = GameOfLife.new(empty_grid)
      next_gen = game.next_generation
      expect(next_gen.size).to eq(3)
      expect(next_gen[0].size).to eq(3)
    end

    it 'kills a lone cell (underpopulation)' do
      game = GameOfLife.new(single_alive)
      next_gen = game.next_generation
      expect(next_gen[1][1]['alive']).to be false
    end

    it 'keeps block pattern stable (still life)' do
      game = GameOfLife.new(block_grid)
      next_gen = game.next_generation
      [[1, 1], [1, 2], [2, 1], [2, 2]].each do |(i, j)|
        expect(next_gen[i][j]['alive']).to be true
      end
    end

    it 'increments age for surviving cells' do
      game = GameOfLife.new(block_grid)
      next_gen = game.next_generation
      expect(next_gen[1][1]['age']).to eq(1)
    end

    it 'revives a cell with exactly three neighbors (reproduction)' do
      grid = make_grid(3, 3, [[0, 0], [0, 1], [1, 0]])
      game = GameOfLife.new(grid)
      next_gen = game.next_generation
      expect(next_gen[1][1]['alive']).to be true
      expect(next_gen[1][1]['age']).to eq(0)
    end

    it 'resets age for revived cells' do
      grid = make_grid(3, 3, [[0, 0], [0, 1], [1, 0]])
      grid[1][1]['age'] = 5
      game = GameOfLife.new(grid)
      next_gen = game.next_generation
      expect(next_gen[1][1]['age']).to eq(0)
    end

    it 'handles all cells alive (overpopulation)' do
      game = GameOfLife.new(all_alive)
      next_gen = game.next_generation
      expect(next_gen.flatten.any? { |cell| !cell['alive'] }).to be true
    end

    it 'oscillates blinker pattern (centered, no wrapping)' do
      blinker5 = make_grid(5, 5, [[2, 1], [2, 2], [2, 3]])
      game = GameOfLife.new(blinker5)
      next_gen = game.next_generation
      # After one gen, vertical blinker at [1,2], [2,2], [3,2]
      expect(next_gen[1][2]['alive']).to be true
      expect(next_gen[2][2]['alive']).to be true
      expect(next_gen[3][2]['alive']).to be true
      expect(next_gen[2][1]['alive']).to be false
      expect(next_gen[2][3]['alive']).to be false
    end

    it 'wraps edges (torus logic)' do
      grid = make_grid(3, 3, [[0, 2], [2, 0], [2, 2]])
      grid[0][0]['alive'] = true
      game = GameOfLife.new(grid)
      next_gen = game.next_generation
      # Cell at (1,1) should have 4 neighbors due to wrapping
      expect(next_gen[1][1]['alive']).to be false # 4 neighbors, so stays dead
    end
  end
end
# rubocop:enable Metrics/BlockLength
