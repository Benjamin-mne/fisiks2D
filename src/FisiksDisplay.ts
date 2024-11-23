export class FisiksDisplay {
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    oldTimeStamp: number = 0;

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
    }


    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    startGameLoop(): void {
        requestAnimationFrame(this.GameLoop.bind(this));
    }

    private GameLoop(timeStamp: number): void {
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update(secondsPassed)
        // Collisions
        // Draw()

        requestAnimationFrame(this.GameLoop.bind(this));
    }
}
