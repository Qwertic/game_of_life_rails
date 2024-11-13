const { environment } = require("@rails/webpacker");
environment.plugins.append(
  "Provide",
  new webpack.ProvidePlugin({
    ActionCable: "@rails/actioncable",
  })
);

module.exports = environment;
