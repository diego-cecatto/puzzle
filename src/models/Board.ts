import * as PIXI from 'pixi.js';
import { Piece } from './Piece';

export class Board {
    size = 8;
    cellSize = 80;

    board: PIXI.Application<HTMLCanvasElement>;

    pieces: Piece[] = [];

    constructor() {
        this.board = new PIXI.Application<HTMLCanvasElement>({
            width: this.size * this.cellSize,
            height: this.size * this.cellSize,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
        });

        document.body.appendChild(this.board.view);
        this.summonPieces();
    }

    private summonPieces() {
        let pieces: Piece[][] = [];
        for (let i = 0; i < this.size; i++) {
            pieces[i] = [];
            for (let j = 0; j < this.size; j++) {
                const piece = Piece.random(this.cellSize, this.cellSize);
                var renderedPiece = piece.render();
                renderedPiece.position.set(
                    i * this.cellSize,
                    j * this.cellSize
                );
                pieces[i][j] = piece;
                this.board.stage.addChild(renderedPiece);
            }
        }
    }
}
