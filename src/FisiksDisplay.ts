import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksAxisAlignedBoundingBox } from "./FisiksAABB";
import { FisiksBody, FisiksBodyBox, FisiksBodyCircle } from "./FisiksBody";
import { FisiksCollisionManifold } from "./FisiksCollisionManifold";
import { CollisionDetails, FisiksCollisions } from "./FisiksCollisions";
import { FisiksObserver } from "./FisiksObservers";
import { FisiksShape } from "./FisiksShape";
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

    contactList: Set<FisiksCollisionManifold> = new Set(); 

    private showVertices: boolean = false;
    private showAABB: boolean = false;
    private showContactPoints: boolean = false;

    private externalBehaviors: ((body: FisiksBody) => void)[] = [];
    private observers: FisiksObserver[] = [];

    setShowVertices(value: boolean){
        this.showVertices = value;
    }

    getShowVertices(){
        return this.showVertices;
    }

    setShowAABB(value: boolean){
        this.showAABB = value;
    }

    getShowAABB(){
        return this.showAABB;
    }

    addObserver(observer: FisiksObserver): void {
        this.observers.push(observer);
    }

    removeObserver(observer: FisiksObserver): void {
        const index = this.observers.indexOf(observer);
        if (index >= 0) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(body: FisiksBody): void {
        for (let observer of this.observers) {
            observer.update(body);
        }
    }

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

    AddBody(body: FisiksBody): void {
        this.bodyList.push(body);
        this.bodyMap.set(body.getId(), body); 
    }
    
    RemoveBody(id: id): void {
        this.bodyList = this.bodyList.filter(body => body.getId() !== id);
        this.bodyMap.delete(id); 
    }
    
    GetBody(id: id): FisiksBody | undefined {
        return this.bodyMap.get(id);
    }

    SetGravity(amount: Fisiks2DVector){
        this.gravity = amount;
    }

    StartGameLoop(): void {
        requestAnimationFrame(this.GameLoop.bind(this));
    }

    private clearContext() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } 

    private GameLoop(timeStamp: number): void {
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        this.clearContext()

        const iterations = 30; 
        const subStepTime = secondsPassed / iterations;
        

        for (let step = 0; step < iterations; step++) {
            this.UpdateBodies(subStepTime);
            this.RenderBodies();
            this.HandleCollisions();
        }

        requestAnimationFrame(this.GameLoop.bind(this));
    }

    private UpdateBodies(subStepTime: number): void {
        for (let body of this.bodyList) {
            for (const behavior of this.externalBehaviors) {
                behavior(body);
            }

            body.Step(subStepTime, this.gravity);
        }
    }

    private RenderBodies(){
        for (let body of this.bodyList) {
            body.Draw();
        
            if(this.getShowVertices() || this.getShowAABB()){
                const context = body.getContext()

                if(context instanceof CanvasRenderingContext2D){
                    let points = [body.getCenter()]
                    const AABB = body.getAABB();

                    if(this.getShowAABB() && AABB instanceof FisiksAxisAlignedBoundingBox){
                        points.push(AABB.min);
                        points.push(AABB.max);
                    }

                    FisiksShape.DrawPoints(context, points)

                    if(body instanceof FisiksBodyBox){
                        FisiksShape.DrawPoints(context, body.getVertices())
                    }
                }
            } 

            this.notifyObservers(body);
        }
    }


    private HandleCollisions(): void {
        this.contactList.clear();

        for (let i = 0; i < this.bodyList.length - 1; i++) {
            const bodyA = this.bodyList[i];
            const bodyAAABB = bodyA.getAABB();

            for (let j = i + 1; j < this.bodyList.length; j++) {
                const bodyB = this.bodyList[j];
                const bodyBAABB = bodyB.getAABB(); 

                if (bodyAAABB instanceof Error || bodyBAABB instanceof Error) continue;
                if (!FisiksCollisions.BroadPhase(bodyAAABB, bodyBAABB)) continue;

                const Details: CollisionDetails | undefined = FisiksCollisions.NarrowPashe(bodyA, bodyB);

                if (Details) {
                    const { bodyA, bodyB, normal, depth, contactPoints } = Details;

                    const contact: FisiksCollisionManifold = new FisiksCollisionManifold(
                        bodyA, bodyB, normal, depth, contactPoints
                    );

                    this.contactList.add(contact);
                }
            }
        }

        for (const contact of this.contactList) {
            const { bodyA, bodyB, normal, depth, contactPoints } = contact;

            if(this.showContactPoints){
                FisiksShape.DrawPoints(this.GetContext(), contactPoints);
            }

            FisiksCollisions.SeparateBodies(bodyA, bodyB, normal, depth);
            FisiksCollisions.SolveCollision(bodyA, bodyB, normal);
            //FisiksCollisions.SolveCollisionWithRotation(contact)
        }
    }
}
