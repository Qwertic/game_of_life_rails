class GameController < ApplicationController
  before_action :authenticate_user!
  layout 'game_of_life'

  def index
    redirect_to new_user_session_path unless user_signed_in?
  end

  def create
    grid = game_params[:grid]
    return head :bad_request if grid.empty?

    # Check for existing job in Redis
    existing_job = Sidekiq.redis { |r| r.get("game_of_life_job_user_#{current_user.id}") }
    
    if existing_job
      Rails.logger.info "Found existing job for user #{current_user.id}: #{existing_job}"
      return render json: { 'job_id' => existing_job }
    end

    job_id = SecureRandom.uuid
    
    # Store the job ID in Redis with the user ID
    Sidekiq.redis do |r| 
      r.setex("game_of_life_job_user_#{current_user.id}", 1.hour.to_i, job_id)
    end

    GameOfLifeJob.perform_later(
      grid: grid,
      job_id: job_id,
      user_id: current_user.id
    )

    render json: { 'job_id' => job_id }
  end

  def cancel
    job_id = params[:job_id]
    
    # Remove the job reference from Redis
    Sidekiq.redis do |r|
      r.del("game_of_life_job_user_#{current_user.id}")
    end
    
    GameOfLifeJob.cancel!(job_id)
    head :ok
  end

  private

   def game_params
      # Permit everything under `grid`, and then manually validate it
      params.require(:game).permit(grid: {}).tap do |whitelisted|
        whitelisted[:grid] = params[:game][:grid].map do |row|
          row.map { |cell| cell.permit(:alive, :age) }
        end
      end
   end
end
