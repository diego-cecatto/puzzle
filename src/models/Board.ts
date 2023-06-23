import * as PIXI from 'pixi.js';
import { Piece } from './Piece';

export class Board {
    size = 8;
    cellSize = 80;

    board: PIXI.Application<HTMLCanvasElement>;

    pieces: Piece[][] = [];

    selectedPieces: Piece[] = [];

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
        if (this.selectedPieces.indexOf(piece) !== -1) {
            this.selectedPieces = [];
            return;
        }
        this.selectedPieces.push(piece);
        if (this.selectedPieces.length == 2) {
            try {
                this.swapPieces(this.selectedPieces[0], this.selectedPieces[1]);
            } finally {
                this.selectedPieces = [];
            }
        }
    }

    swapPieces(piece1: Piece, piece2: Piece): void {
        var positions: PieceSwapPositions = {
            piece1: {
                x: piece1.row(this.cellSize),
                y: piece1.col(this.cellSize),
            },
            piece2: {
                x: piece2.row(this.cellSize),
                y: piece2.col(this.cellSize),
            },
        };
        console.log(piece1, piece2);
        if (!this.validMove(positions)) {
            return;
        }
        this.pieces[positions.piece1.x][positions.piece1.y] = piece1;
        this.pieces[positions.piece2.x][positions.piece1.y] = piece2;
        const tempPosition = new PIXI.Point(
            piece1.rendered?.position.x,
            piece1.rendered?.position.y
        );
        piece1.rendered?.position.set(
            piece2.rendered?.position.x,
            piece2.rendered?.position.y
        );
        piece2.rendered?.position.set(tempPosition.x, tempPosition.y);
    }

    validMove(positions: PieceSwapPositions) {
        var diffY = positions.piece2.y - positions.piece1.y;
        var diffX = positions.piece2.x - positions.piece1.x;
        console.log(diffX, diffY);
        return (
            ((diffY >= 0 && diffY <= 1) || (diffY <= 0 && diffY >= -1)) &&
            ((diffX >= 0 && diffX <= 1) || (diffX <= 0 && diffX >= -1))
        );
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
