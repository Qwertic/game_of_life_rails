require 'rails_helper'

RSpec.configure do |config|
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include FactoryBot::Syntax::Methods
end

describe GameController, type: :controller do
  let(:grid) { Array.new(3) { Array.new(3) { { 'alive' => false, 'age' => 0 } } } }
  let(:user) { FactoryBot.create(:user) }

  before do
    sign_in user
  end

  describe 'POST #create (game_of_life)' do
    it 'returns success and job id' do
      allow(GameOfLifeJob).to receive(:perform_later).and_return(double(job_id: '123'))
      post :create, params: { game: { grid: } }, as: :json
      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body)).to include('job_id')
    end
  end

  describe 'POST #cancel' do
    it 'returns success' do
      post :cancel, params: { job_id: '123' }, as: :json
      expect(response).to have_http_status(:success)
    end
  end

  describe 'unauthenticated user' do
    before do
      sign_out user
    end

    it 'returns 401 for POST #create' do
      post :create, params: { game: { grid: } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns 401 for POST #cancel' do
      post :cancel, params: { job_id: '123' }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
