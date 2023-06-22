import * as PIXI from 'pixi.js';

export class Piece {
    constructor(
        private color: string,
        private width: number,
        private height: number
    ) {
        console.log(`you have a new piece ${this.color}`);
    }

    static random(width: number, height: number) {
        var colors = Object.keys(EnumColorPieces);
        var colorIndex = Math.floor(Math.random() * colors.length);
        return new Piece(colors[colorIndex], width, height);
    }

    render() {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(new PIXI.Color(this.color).toNumber());
        graphics.drawRect(0, 0, this.width, this.height);
        graphics.endFill();
        return graphics;
    }
}

export const EnumColorPieces = {
    red: 'red',
    green: 'green',
    blue: 'blue',
    orange: 'orange',
    purple: 'purple',
};
