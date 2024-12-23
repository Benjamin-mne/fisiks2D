import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksBody } from "./FisiksBody";
import { FisiksBodyController } from "./FisiksBodyController";
import { FisiksCollisions } from "./FisiksCollisions";
import { id } from "./utils/utils";

export class FisiksDisplay {
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    oldTimeStamp: number = 0;

    bodyList: FisiksBody[] = [];
    bodyMap: Map<id, FisiksBody> = new Map();
    gravity: Fisiks2DVector = Fisiks2DVector.Zero; 

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
        this.bodyMap.clear();
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
        this.bodyList.push(body);
        this.bodyMap.set(body.id, body); 
    }
    
    RemoveBody(id: id): void {
        this.bodyList = this.bodyList.filter(body => body.id !== id);
        this.bodyMap.delete(id); 
    }
    
    GetBody(id: id): FisiksBody | undefined {
        return this.bodyMap.get(id);
    }

    SetGravity(amount: Fisiks2DVector){
        this.gravity = amount;
    }

    ForEachBody(method: (body: FisiksBody) => void = () => {}): void {
        for (const body of this.bodyList) {
            method(body);
    
            for (const behavior of this.externalBehaviors) {
                behavior(body);
            }
        }
    }

    private Interpolate(body: FisiksBody, alpha: number): void {
        body.position = Fisiks2DVector.Add(
            Fisiks2DVector.ScalarMultiplication(1 - alpha, body.previousPosition),
            Fisiks2DVector.ScalarMultiplication(alpha, body.position)
        );
    
        body.linearVelocity = Fisiks2DVector.Add(
            Fisiks2DVector.ScalarMultiplication(1 - alpha, body.previousVelocity),
            Fisiks2DVector.ScalarMultiplication(alpha, body.linearVelocity)
        );
    
        body.rotation = body.previousRotation + (alpha * (body.rotation - body.previousRotation));
    }
    

    private GameLoop(timeStamp: number): void {
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;
    
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        const alpha = secondsPassed / (1 / 60);
    
        this.ForEachBody((body) => {
            body.previousPosition = body.position;
            body.previousVelocity = body.linearVelocity;
            body.previousRotation = body.rotation;
        });
    
        this.ForEachBody();
    
        for (let i = 0; i < this.bodyList.length; i++) {
            const body = this.bodyList[i];
            
            if(body.controllable){
                FisiksBodyController(this.bodyList[i], secondsPassed, 300);
            }
    
            body.Steap(secondsPassed, this.gravity);
            body.Draw();
    
            this.Interpolate(body, alpha);
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
