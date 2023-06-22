import { Board } from './models/Board';

export class PuzzleGame {
    //seconds to end game
    time = 180;
    //score to end game
    scoreTarget = 100;

    score = 0;

    board: Board;

    constructor() {
        this.board = new Board();
    }
}

new PuzzleGame();
