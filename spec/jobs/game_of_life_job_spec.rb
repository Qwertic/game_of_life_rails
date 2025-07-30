# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable Metrics/BlockLength
RSpec.describe GameOfLifeJob, type: :job do
  let(:user) { FactoryBot.create(:user) }
  let(:job_id) { 'test-job-123' }
  let(:grid) { Array.new(3) { Array.new(3) { { 'alive' => false, 'age' => 0 } } } }

  before do
    allow(ActionCable.server).to receive(:broadcast)
    allow(Sidekiq).to receive(:redis).and_yield(double(del: true, set: true, get: nil))
  end

  it 'broadcasts a grid update for the next generation' do
    expect(ActionCable.server).to receive(:broadcast).with(
      "game_of_life_channel_user_#{user.id}",
      hash_including(type: 'grid_update', grid: kind_of(Array))
    )
    described_class.perform_now(grid:, job_id:, user_id: user.id)
  end

  it 'broadcasts job status event (start)' do
    expect(ActionCable.server).to receive(:broadcast).with(
      "game_of_life_channel_user_#{user.id}",
      hash_including(type: 'job_status', status: 'running', job_id:)
    )
    described_class.perform_now(grid:, job_id:, user_id: user.id)
  end

  it 'returns early and does not broadcast if grid is nil' do
    expect(ActionCable.server).not_to receive(:broadcast)
    described_class.perform_now(grid: nil, job_id:, user_id: user.id)
  end

  it 'returns early and does not broadcast if user_id is nil' do
    expect(ActionCable.server).not_to receive(:broadcast)
    described_class.perform_now(grid:, job_id:, user_id: nil)
  end

  it 'returns early and does not broadcast if job_id is nil' do
    expect(ActionCable.server).not_to receive(:broadcast)
    described_class.perform_now(grid:, job_id: nil, user_id: user.id)
  end

  it 'returns early and does not broadcast if grid is not an array' do
    expect(ActionCable.server).not_to receive(:broadcast)
    described_class.perform_now(grid: 'not-a-grid', job_id:, user_id: user.id)
  end

  it 'can be cancelled via cancel!' do
    redis = double(set: true, get: '1', del: true)
    allow(Sidekiq).to receive(:redis).and_yield(redis)
    described_class.cancel!(job_id)
    expect(redis).to have_received(:set).with("cancelled-#{job_id}", 1, ex: 86_400)
  end

  it 'broadcasts error and cleans up redis on exception' do
    allow(GameOfLife).to receive(:new).and_raise(StandardError, 'fail!')
    redis = double(del: true, set: true, get: nil)
    allow(Sidekiq).to receive(:redis).and_yield(redis)
    expect(ActionCable.server).to receive(:broadcast).with(
      "game_of_life_channel_user_#{user.id}",
      hash_including(type: 'job_status', status: 'error', job_id:, message: /fail/)
    )
    expect(redis).to receive(:del).with("game_of_life_job_user_#{user.id}")
    expect do
      described_class.perform_now(grid:, job_id:, user_id: user.id)
    end.to raise_error(StandardError)
  end

  it 'cleans up redis key after job finishes' do
    redis = double(del: true, set: true, get: nil)
    allow(Sidekiq).to receive(:redis).and_yield(redis)
    described_class.perform_now(grid:, job_id:, user_id: user.id)
    expect(redis).to have_received(:del).with("game_of_life_job_user_#{user.id}")
  end

  it 'uses correct ActionCable channel for user' do
    expect(ActionCable.server).to receive(:broadcast).with(
      "game_of_life_channel_user_#{user.id}",
      hash_including(type: 'grid_update')
    )
    described_class.perform_now(grid:, job_id:, user_id: user.id)
  end
end

# rubocop:enable Metrics/BlockLength
