import React from "react";

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full p-4 antialiased">
      <h1 className="text-4xl font-bold text-white">Game of Life</h1>
      <p className="text-sm py-8 text-gray-300">
        The Game of Life is a cellular automaton devised by the British
        mathematician John Horton Conway in 1970. It is a zero-player game,
        meaning that its evolution is determined by its initial state, requiring
        no further input. One interacts with the Game of Life by creating an
        initial configuration and observing how it evolves.
      </p>
      <p className="text-sm text-gray-300">
        In this implementation, you can click on the grid to{" "}
        <span className="font-bold">toggle</span> cells,{" "}
        <span className="font-bold">start</span> and{" "}
        <span className="font-bold">stop</span> the simulation,{" "}
        <span className="font-bold">reset</span> and{" "}
        <span className="font-bold">clear</span> the grid
        <br />
        <br />A <span className="font">toroidal</span> grid is used, meaning
        that the grid wraps around at the edges to create an{" "}
        <span className="font">infinite</span> grid.
      </p>
    </div>
  );
}
