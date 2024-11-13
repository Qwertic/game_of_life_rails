Rails.application.config.action_cable.cable = {
  adapter: 'redis',
  url: ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" }
}