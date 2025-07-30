class GameController < ApplicationController
  before_action :authenticate_user!
  layout 'game_of_life'

  def index
    redirect_to new_user_session_path unless user_signed_in?
  end

  def create
    grid = game_params[:grid]
    return head :bad_request if grid.empty?

    job_id = find_or_create_job(grid)

    render json: { 'job_id' => job_id }
  end

  def cancel
    job_id = params[:job_id]
    remove_job_reference
    broadcast_job_status('idle', nil, 'Simulation stopped')
    GameOfLifeJob.cancel!(job_id)

    head :ok
  end

  private

  def find_or_create_job(grid)
    existing_job = find_existing_job
    return existing_job if existing_job

    create_new_job(grid)
  end

  def find_existing_job
    job_id = Sidekiq.redis { |r| r.get("game_of_life_job_user_#{current_user.id}") }

    if job_id
      Rails.logger.info "Found existing job for user #{current_user.id}: #{job_id}"
      broadcast_job_status('running', job_id, 'Simulation already running')

      return job_id
    end

    nil
  end

  def create_new_job(grid)
    job_id = SecureRandom.uuid

    Sidekiq.redis { |r| r.setex("game_of_life_job_user_#{current_user.id}", 1.hour.to_i, job_id) }

    broadcast_job_status('running', job_id, 'Simulation started')
    GameOfLifeJob.perform_later(grid:, job_id:, user_id: current_user.id)

    job_id
  end

  def remove_job_reference
    Sidekiq.redis { |r| r.del("game_of_life_job_user_#{current_user.id}") }
  end

  def broadcast_job_status(status, job_id, message)
    ActionCable.server.broadcast(
      "game_of_life_channel_user_#{current_user.id}",
      {
        type: 'job_status',
        status:,
        job_id:,
        message:
      }
    )
  end

  def game_params
    # Permit everything under `grid`, and then manually validate it
    params.require(:game).permit(grid: {}).tap do |whitelisted|
      whitelisted[:grid] = params[:game][:grid].map do |row|
        row.map { |cell| cell.permit(:alive, :age) }
      end
    end
  end
end
