import { FisiksBody } from "./FisiksBody";
import { FisiksBodyController } from "./FisiksBodyController";
import { FisiksCollisions } from "./FisiksCollisions";
import { ShapeType } from "./FisiksShape";

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


    GetCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    GetContext(): CanvasRenderingContext2D {
        return this.context;
    }

    StartGameLoop(): void {
        requestAnimationFrame(this.GameLoop.bind(this));
    }

    AddBody(body: FisiksBody): void {
        this.bodyList.push(body)
    }

    private GameLoop(timeStamp: number): void {
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);



        for (let i = 0; i < this.bodyList.length; i++) {
            const body = this.bodyList[i];

            if(body.shape === ShapeType.Box){
                body.Rotate(Math.PI / 4 * secondsPassed);
            }

            body.Draw();
            body.Update();
        }

        FisiksBodyController(this.bodyList[1], secondsPassed, 300);

        for (let i = 0; i < this.bodyList.length - 1; i++) {
            let bodyA: FisiksBody = this.bodyList[i];

            for (let j = i + 1; j < this.bodyList.length; j++) {
                let bodyB: FisiksBody = this.bodyList[j];
                
                FisiksCollisions.ResolveCollisions(bodyA, bodyB);
            }            
        }

        requestAnimationFrame(this.GameLoop.bind(this));
    }
}
