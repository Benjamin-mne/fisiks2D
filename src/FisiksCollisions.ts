import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksBody, ShapeType } from "./FisiksBody";


export class FisiksCollisions {
    public static ResolveCollisions(BodyA: FisiksBody, BodyB: FisiksBody){
        if(BodyA.shape === ShapeType.Circle && BodyB.shape === ShapeType.Circle){
            this.IntersectCircles(BodyA, BodyB);
        }

    }
    
    static IntersectCircles(CircleA: FisiksBody, CircleB: FisiksBody): void {
        let normal: Fisiks2DVector = Fisiks2DVector.Zero;
        let depth: number = 0;

        let distance: number = Fisiks2DVector.Distance(CircleA.position, CircleB.position);
        let radii: number = CircleA.radius + CircleB.radius;
        
        if(distance >= radii){
            return;
        }

        normal = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.position, CircleA.position));
        depth = radii - distance;

        let collisionResolutionVectorA = Fisiks2DVector.ScalarMultiplication(depth / -2, normal);
        let collisionResolutionVectorB = Fisiks2DVector.ScalarMultiplication(depth / 2, normal);

        CircleA.Move(collisionResolutionVectorA);
        CircleB.Move(collisionResolutionVectorB);
    }
}