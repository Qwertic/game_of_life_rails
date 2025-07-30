# frozen_string_literal: true

# This file is part of the Game of Life Rails application.
# It defines the GameOfLifeChannel which handles WebSocket connections for the Game of Life simulation
class GameOfLifeChannel < ApplicationCable::Channel
  def subscribed
    channel_name = "game_of_life_channel_user_#{current_user.id}"
    stream_from channel_name
  end

  def unsubscribed
    stop_all_streams
  end

  def receive(data)
    transmit(data)
  end
end
