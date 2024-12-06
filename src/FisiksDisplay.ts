import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksBody } from "./FisiksBody";
import { FisiksBodyController } from "./FisiksBodyController";
import { FisiksCollisions } from "./FisiksCollisions";

export class FisiksDisplay {
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    oldTimeStamp: number = 0;
    bodyList: FisiksBody[];

    gravity: Fisiks2DVector = new Fisiks2DVector(0, 9.8); 

    private externalBehaviors: ((body: FisiksBody) => void)[] = [];

    RegisterBehavior(behavior: (body: FisiksBody) => void): void {
        this.externalBehaviors.push(behavior);
    }

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

    RemoveBody(index: number): void {
        this.bodyList = this.bodyList.filter((_, idx) => idx === index);
    }

    ForEachBody(method: (body: FisiksBody) => void = () => {}): void {
        for (const body of this.bodyList) {
            method(body);
    
            for (const behavior of this.externalBehaviors) {
                behavior(body);
            }
        }
    }

    private GameLoop(timeStamp: number): void {
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ForEachBody();

        for (let i = 0; i < this.bodyList.length; i++) {
            const body = this.bodyList[i];
            if(body.controllable){
                FisiksBodyController(this.bodyList[1], secondsPassed, 300);
            }

            body.Steap(secondsPassed);
            body.Draw();
        }

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
