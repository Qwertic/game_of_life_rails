# frozen_string_literal: true

# Description: This job is responsible for computing the next generation of the Game of Life grid.
# It is called by the GameOfLifeChannel when the client requests the next generation.
# The compute_next_generation method calculates the next generation of the grid based on the rules of the Game of Life.
# The get_wrapped_index lambda function is used to handle the wrapping of the grid when calculating the neighbors.
# The perform method broadcasts the new grid to the client using ActionCable.
#
# The compute_next_generation method calculates the next generation of the grid based on the rules of the Game of Life.
# It iterates over each cell in the grid and counts the number of alive neighbors for each cell.
# It then determines the state of the cell in the next generation based on the number of alive neighbors
# and the current state of the cell.

# The get_wrapped_index lambda function is used to handle the wrapping of the grid when
# calculating the neighbors of a cell.
# It takes an index and the maximum value for that index and returns the wrapped index.
# This ensures that the neighbors of a cell are correctly calculated even when the cell is at the edge of the grid.

# The perform method is called by the GameOfLifeChannel when the client requests the next generation of the grid.
# It computes the next generation of the grid using the compute_next_generation method and broadcasts the new grid to
# the client using ActionCable.

# Overall, this job is responsible for computing the next generation of the Game of Life grid and
# broadcasting it to the client using ActionCable.

# app/jobs/game_of_life_job.rb
class GameOfLifeJob < ApplicationJob
  queue_as :default

  JOB_TIL = 5.minutes

  def perform(grid:, job_id:, user_id:)
    return if grid.nil?

    channel_name = "game_of_life_channel_user_#{user_id}"
    Rails.logger.info "Starting GameOfLifeJob for user: #{user_id}"

    game = GameOfLife.new(grid)
    start_time = Time.now

    begin
      loop do
        new_grid = game.next_generation
        Rails.logger.info 'Broadcasting new grid state'

        ActionCable.server.broadcast(
          channel_name,
          {
            type: 'grid_update',
            grid: new_grid,
            timestamp: Time.now.to_i
          }
        )

        break if new_grid == grid

        grid = new_grid
        game = GameOfLife.new(grid)

        break if cancelled?(job_id) || Time.now - start_time > JOB_TIL
      end
    ensure
      # Clean up Redis key when job finishes or fails
      Sidekiq.redis do |r|
        r.del("game_of_life_job_user_#{user_id}")
      end
    end
  end

  def self.cancel!(job_id)
    Sidekiq.redis { |c| c.set("cancelled-#{job_id}", 1, ex: 86_400) }
  end

  private

  def cancelled?(job_id)
    Sidekiq.redis { |c| c.get("cancelled-#{job_id}") }.present?
  end
end
