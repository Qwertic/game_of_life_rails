# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable Metrics/BlockLength
RSpec.describe GameOfLifeChannel, type: :channel do
  let(:user) { FactoryBot.create(:user) }

  before do
    stub_connection current_user: user
  end

  it 'subscribes to the correct channel for the user' do
    subscribe
    expect(subscription).to be_confirmed
    expect(subscription.streams).to include("game_of_life_channel_user_#{user.id}")
  end

  it 'stops all streams on unsubscribe' do
    subscribe
    expect(subscription).to be_confirmed
    perform :unsubscribed
    expect(subscription.streams).to be_empty
  end

  it 'receives broadcasted messages on the user channel' do
    subscribe
    expect(subscription).to be_confirmed
    message = { 'type' => 'job_status', 'status' => 'running', 'job_id' => 'abc123' }
    expected = message.merge('action' => 'receive')
    perform :receive, message
    expect(transmissions.last).to eq(expected)
  end

  it 'receives grid update broadcasts' do
    subscribe
    expect(subscription).to be_confirmed
    grid_message = { 'type' => 'grid_update', 'grid' => [[true, false], [false, true]] }
    expected = grid_message.merge('action' => 'receive')
    perform :receive, grid_message
    expect(transmissions.last).to eq(expected)
  end
end

# rubocop:enable Metrics/BlockLength
