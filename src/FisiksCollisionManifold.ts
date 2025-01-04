import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksBody } from "./FisiksBody";

export class FisiksCollisionManifold {
    readonly bodyA: FisiksBody; 
    readonly bodyB: FisiksBody;
    readonly normal: Fisiks2DVector;
    readonly depth: number;
    readonly contactPoints: Fisiks2DVector[];

    constructor(bodyA: FisiksBody, bodyB: FisiksBody, normal: Fisiks2DVector, depth: number, contactPoints: Fisiks2DVector[]){
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.normal = normal;
        this.depth = depth;
        this.contactPoints = contactPoints;
    }
}