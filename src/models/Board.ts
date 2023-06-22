import * as PIXI from 'pixi.js';
import { Piece } from './Piece';

export class Board {
    size = 8;
    cellSize = 80;

    board: PIXI.Application<HTMLCanvasElement>;

    pieces: Piece[][] = [];

    constructor() {
        this.board = new PIXI.Application<HTMLCanvasElement>({
            width: this.size * this.cellSize,
            height: this.size * this.cellSize,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
        });

        document.body.appendChild(this.board.view);
        this.summonPieces();
        var security = 0;
        while (!this.checkValidOptions() && security < 100) {
            security++;
            this.summonPieces();
        }
        if (security == 99) {
            throw 'Invalid board';
        }
    }

    private summonPieces() {
        this.pieces = [];
        for (let i = 0; i < this.size; i++) {
            this.pieces[i] = [];
            for (let j = 0; j < this.size; j++) {
                const piece = Piece.random(this.cellSize, this.cellSize);
                var renderedPiece = piece.render();
                renderedPiece.position.set(
                    i * this.cellSize,
                    j * this.cellSize
                );
                renderedPiece.interactive = true;
                renderedPiece.on('pointerdown', () => this.selectPiece(piece));

                this.pieces[i][j] = piece;
                this.board.stage.addChild(renderedPiece);
            }
        }
    }

    selectPiece(piece: Piece) {
        console.log(`piece ${piece}`);
    }

    checkValidOptions(): boolean {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const piece = this.pieces[i][j];

                // Verifique se a troca com a peça à direita é válida
                if (j < this.size - 1) {
                    const rightPiece = this.pieces[i][j + 1];
                    const nextRightPiece = this.pieces[i][j + 2];

                    // Verifique se a troca resulta em uma correspondência válida
                    if (
                        (nextRightPiece &&
                            piece.color === nextRightPiece.color) ||
                        (rightPiece &&
                            nextRightPiece &&
                            rightPiece.color === nextRightPiece.color)
                    ) {
                        return true;
                    }
                }

                // Verifique se a troca com a peça abaixo é válida
                if (i < this.size - 1) {
                    const downPiece = this.pieces[i + 1][j];
                    const nextDownPiece = this.pieces[i + 2][j];

                    // Verifique se a troca resulta em uma correspondência válida
                    if (
                        (nextDownPiece &&
                            piece.color === nextDownPiece.color) ||
                        (downPiece &&
                            nextDownPiece &&
                            downPiece.color === nextDownPiece.color)
                    ) {
                        return true;
                    }
                }

                // Verifique se a troca com a peça à esquerda é válida
                if (j > 0) {
                    const leftPiece = this.pieces[i][j - 1];
                    const nextLeftPiece = this.pieces[i][j - 2];

                    // Verifique se a troca resulta em uma correspondência válida
                    if (
                        (nextLeftPiece &&
                            piece.color === nextLeftPiece.color) ||
                        (leftPiece &&
                            nextLeftPiece &&
                            leftPiece.color === nextLeftPiece.color)
                    ) {
                        return true;
                    }
                }

                // Verifique se a troca com a peça acima é válida
                if (i > 0) {
                    const upPiece = this.pieces[i - 1][j];
                    const nextUpPiece = this.pieces[i - 2][j];

                    // Verifique se a troca resulta em uma correspondência válida
                    if (
                        (nextUpPiece && piece.color === nextUpPiece.color) ||
                        (upPiece &&
                            nextUpPiece &&
                            upPiece.color === nextUpPiece.color)
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
