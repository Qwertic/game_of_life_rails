import React from "react";

import GameOfLife from "./components/GameOfLife";
import { Toaster } from "./components/ui/Sonner";

export default function App() {
  return (
    <>
      <Toaster />
      <GameOfLife />
    </>
  );
}
