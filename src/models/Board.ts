import * as PIXI from 'pixi.js';

export class Board {
    size = 8;
    cellSize = 80;

    app: PIXI.Application<HTMLCanvasElement>;

    constructor() {
        this.app = new PIXI.Application<HTMLCanvasElement>({
            width: this.size * this.cellSize,
            height: this.size * this.cellSize,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
        });

        document.body.appendChild(this.app.view);
    }
}
