import * as PIXI from 'pixi.js';
import { Piece } from './Piece';
import { Dictionary } from '../utils/Dictionary';
import { Coordinate, PieceSwapPositions } from '../types/Coordinate';

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
        for (let row = 0; row < this.size; row++) {
            this.pieces[row] = [];
            for (let col = 0; col < this.size; col++) {
                this.summonPiece(row, col);
            }
        }
    }

    private summonPiece(row: number, col: number) {
        const piece = Piece.random(this.cellSize, this.cellSize);
        var renderedPiece = piece.render();
        renderedPiece.position.set(col * this.cellSize, row * this.cellSize);
        renderedPiece.interactive = true;
        renderedPiece.on('pointerdown', () => this.selectPiece(piece));
        const text = new PIXI.Text(
            `[${piece.row(this.cellSize)},${piece.col(this.cellSize)}]`,
            { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff }
        );
        text.x = 20;
        text.y = 20;
        renderedPiece.addChild(text);
        this.pieces[row][col] = piece;
        this.board.stage.addChild(renderedPiece);
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

    swapPieces(piece1: Piece, piece2: Piece, deleteOccurences = true): void {
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
        if (!this.validMove(positions)) {
            return;
        }
        this.pieces[positions.piece1.x][positions.piece1.y] = piece2;
        this.pieces[positions.piece2.x][positions.piece2.y] = piece1;
        const tempPosition = new PIXI.Point(
            piece1.rendered?.position.x,
            piece1.rendered?.position.y
        );
        piece1.rendered?.position.set(
            piece2.rendered?.position.x,
            piece2.rendered?.position.y
        );
        piece2.rendered?.position.set(tempPosition.x, tempPosition.y);
        if (deleteOccurences) {
            if (!this.removePieces(piece1) && !this.removePieces(piece2)) {
                this.swapPieces(piece1, piece2, false);
            } else {
                this.summonDeletedPieces(this.reorderBoard());
            }
        }
    }

    summonDeletedPieces(deleteds: Coordinate[]) {
        deleteds.forEach((deleted) => {
            this.summonPiece(deleted.x, deleted.y);
        });
    }

    removePieces(piece: Piece) {
        const matches = this.findMatches(piece);
        let removed: Coordinate[] = [];
        if (matches.length < 3) {
            return false;
        }
        matches.each((key, item) => {
            const toRemove = {
                x: item.row(this.cellSize),
                y: item.col(this.cellSize),
            };
            removed.push(toRemove);
            this.pieces[toRemove.x][toRemove.y].deleted = true;
            this.board.stage.removeChild(item.rendered!);
        });
        return true;
    }

    reorderBoard() {
        var remainings: Coordinate[] = [];
        for (var col = this.pieces[0].length - 1; col >= 0; col--) {
            var deleteds: Coordinate[] = [];
            for (var line = this.pieces.length - 1; line >= 0; line--) {
                var piece = this.pieces[line][col];
                if (piece.deleted) {
                    deleteds.push({
                        x: piece.row(this.cellSize),
                        y: piece.col(this.cellSize),
                    });
                } else {
                    if (deleteds.length) {
                        const deleted = deleteds[0];
                        deleteds.push({
                            x: piece.row(this.cellSize),
                            y: piece.col(this.cellSize),
                        });
                        piece.rendered?.position.set(
                            deleted.y * this.cellSize,
                            deleted.x * this.cellSize
                        );
                        this.pieces[deleted.x][deleted.y] = piece;
                        deleteds.shift();
                    }
                }
            }
            remainings.push(...deleteds);
        }
        return remainings;
    }

    validMove(positions: PieceSwapPositions) {
        var diffY = positions.piece2.y - positions.piece1.y;
        var diffX = positions.piece2.x - positions.piece1.x;
        return (
            ((diffY >= 0 && diffY <= 1) || (diffY <= 0 && diffY >= -1)) &&
            ((diffX >= 0 && diffX <= 1) || (diffX <= 0 && diffX >= -1))
        );
    }

    findMatches(piece: Piece): Dictionary<Piece> {
        const matches = new Dictionary<Piece>();
        matches.add(
            `[${piece.row(this.cellSize)},${piece.col(this.cellSize)}]`,
            piece
        );
        this.getHorizontalMatches(piece, matches);
        this.getVerticalMatches(piece, matches);
        return matches;
    }

    getHorizontalMatches(piece: Piece, matches: Dictionary<Piece>) {
        const row = piece.row(this.cellSize);
        const col = piece.col(this.cellSize);
        let leftCol = col - 1;
        while (
            leftCol >= 0 &&
            this.pieces[row][leftCol].color === piece.color &&
            !matches.exist(`[${row},${leftCol}]`)
        ) {
            matches.add(`[${row},${leftCol}]`, this.pieces[row][leftCol]);
            this.getVerticalMatches(this.pieces[row][leftCol], matches);
            leftCol--;
        }
        let rightCol = col + 1;
        while (
            rightCol < this.size &&
            this.pieces[row][rightCol].color === piece.color &&
            !matches.exist(`[${row},${rightCol}]`)
        ) {
            matches.add(`[${row},${rightCol}]`, this.pieces[row][rightCol]);
            this.getVerticalMatches(this.pieces[row][rightCol], matches);
            rightCol++;
        }
        return matches;
    }

    getVerticalMatches(piece: Piece, matches: Dictionary<Piece>) {
        const row = piece.row(this.cellSize);
        const col = piece.col(this.cellSize);
        let aboveRow = row - 1;
        while (
            aboveRow >= 0 &&
            this.pieces[aboveRow][col].color === piece.color &&
            !matches.exist(`[${aboveRow},${col}]`)
        ) {
            matches.add(`[${aboveRow},${col}]`, this.pieces[aboveRow][col]);
            this.getHorizontalMatches(this.pieces[aboveRow][col], matches);
            aboveRow--;
        }
        let belowRow = row + 1;
        while (
            belowRow < this.size &&
            this.pieces[belowRow][col].color === piece.color &&
            !matches.exist(`[${belowRow},${col}]`)
        ) {
            matches.add(`[${belowRow},${col}]`, this.pieces[belowRow][col]);
            this.getHorizontalMatches(this.pieces[belowRow][col], matches);
            belowRow++;
        }

        return matches;
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
