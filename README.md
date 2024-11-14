# A Game of Life in Ruby on Rails

This is an implementation of the Game of Life in Ruby on Rails. The simulation is displayed in a grid of cells, each of which is either alive or dead.

The simulation is calculated server side, using a well known algorith of finding the next state of each cell based on the number of live neighbors.

The client is updated using websocket to display the new state of the cells.

An asynchronous job is used to calculate the next state of the cells, and the client is updated using ActionCable.

This way the simulation can be run in the background, and the client can be updated in real time.

Basic comands for this simulation are:

- Start the simulation
- Stop the simulation
- Clear the grid
- Randomize the grid
- Toggle the state of a cell

Further improvements could be:

- Add a way to change the size of the grid
- Add a way to change the speed of the simulation
- Add a way to change the rules of the simulation
- Add a way to save and load the state of the grid

## Installation

If you want to run this project locally, you can follow these steps:

1. Clone the repository

```bash
git clone git@github.com:Qwertic/game_of_life_rails.git
```

2. Install the gems

```bash
bundle install
```

3. Install packages

```bash
npm install
```

4. Create the database

```bash
rails db:create
```

5. Run the migrations

```bash
rails db:migrate
```

6. Create the seed data

```bash
rails db:seed
```

7. Start the server

```bash
bin/dev
```

8. Open your browser and go to `http://localhost:3000`

## Usage

After loging in with the credentials of the seed data, you will be redirected to the simulation page.

You can start the simulation by clicking the `Start` button. The simulation will run until you click the `Stop` button.

You can clear the grid by clicking the `Clear` button. You can restart by reseting the grid and clicking the `Start` button.
