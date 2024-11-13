import ReactOnRails from "react-on-rails";

import GameOfLife from "../bundles/GameOfLife/components/GameOfLifeServer";

// This is how react_on_rails can see the GameOfLife in the browser.
ReactOnRails.register({
  GameOfLife,
});
