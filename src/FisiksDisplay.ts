import { FisiksBody } from "./FisiksBody";
import { FisiksBodyController } from "./FisiksBodyController";

export class FisiksDisplay {
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    oldTimeStamp: number = 0;
    bodyList: FisiksBody[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        const ctx = this.canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Could not get the 2D context of the canvas.");
        }

        this.context = ctx;
        this.bodyList = [];
    }


    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    startGameLoop(): void {
        requestAnimationFrame(this.GameLoop.bind(this));
    }

    addBody(body: FisiksBody): void {
        this.bodyList.push(body)
    }

    private GameLoop(timeStamp: number): void {
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        FisiksBodyController(this.bodyList[0], secondsPassed);

        for (let i = 0; i < this.bodyList.length; i++) {
            const body = this.bodyList[i];
            body.Draw();
            body.Update();
        }

        requestAnimationFrame(this.GameLoop.bind(this));

    }
}
