class GameOfLifeChannel < ApplicationCable::Channel
  def subscribed
    channel_name = "game_of_life_channel_user_#{current_user.id}"
    Rails.logger.info "Client subscribing to channel: #{channel_name}"
    stream_from channel_name
  end

  def unsubscribed
    stop_all_streams
  end
end
