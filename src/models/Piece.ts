import * as PIXI from 'pixi.js';

export class Piece {
    public rendered: PIXI.Graphics | null = null;

    constructor(
        public color: string,
        private width: number,
        private height: number
    ) {}

    static random(width: number, height: number) {
        var colors = Object.keys(EnumColorPieces);
        var colorIndex = Math.floor(Math.random() * colors.length);
        return new Piece(colors[colorIndex], width, height);
    }
    // x: number, y: number, cellSize: number
    render() {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(new PIXI.Color(this.color).toNumber());
        graphics.drawRect(0, 0, this.width, this.height);
        graphics.endFill();
        this.rendered = graphics;
        return graphics;
    }

    row(cellSize: number): number {
        if (!this.rendered) {
            throw 'Not possible to retrieve when object is not set';
        }
        return this.rendered.position.x - cellSize;
    }

    col(cellSize: number): number {
        if (!this.rendered) {
            throw 'Not possible to retrieve when object is not set';
        }
        return this.rendered.position.y - cellSize;
    }
}

export const EnumColorPieces = {
    red: 'red',
    green: 'green',
    blue: 'blue',
    orange: 'orange',
    purple: 'purple',
};
