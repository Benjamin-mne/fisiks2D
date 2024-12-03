import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksBody, ShapeType } from "./FisiksBody";
import { FisiksShape } from "./FisiksShape";

export class FisiksCollisions {
    public static ResolveCollisions(BodyA: FisiksBody, BodyB: FisiksBody){
        if(BodyA.shape === ShapeType.Circle && BodyB.shape === ShapeType.Circle){
            this.IntersectCircles(BodyA, BodyB);
        }

        if(BodyA.shape === ShapeType.Box && BodyB.shape === ShapeType.Box){
            if(this.IntersectPolygons(BodyA, BodyB)){
                if((BodyA.context === null || BodyB.context === null)){
                    return
                } else {
                    FisiksShape.DrawVertices(BodyA.context, BodyA.transformedVertices, 'red');
                    FisiksShape.DrawVertices(BodyB.context, BodyB.transformedVertices, 'red');
                }
            }
        }
    }

    static IntersectPolygons(PolygonA: FisiksBody, PolygonB: FisiksBody): boolean{
        const verticesA: Fisiks2DVector[] = PolygonA.vertices;
        const verticesB: Fisiks2DVector[] = PolygonB.vertices;

        for (let i = 0; i < verticesA.length; i++) {
            const VertexA: Fisiks2DVector = verticesA[i];
            const VertexB: Fisiks2DVector = verticesA[(i + 1) % verticesA.length];
            const edge: Fisiks2DVector = Fisiks2DVector.Difference(VertexB, VertexA);
            const axis: Fisiks2DVector = Fisiks2DVector.Normalize(new Fisiks2DVector(edge.y * -1, edge.x));
            
            const { min: minA, max: maxA } = this.ProjectVertices(verticesA, axis);
            const { min: minB, max: maxB } = this.ProjectVertices(verticesB, axis);

            const epsilon = 1e-6;

            if (minA > maxB + epsilon || minB > maxA + epsilon) {
                return false;
            }
        }

        for (let i = 0; i < verticesB.length; i++) {
            const VertexA: Fisiks2DVector = verticesB[i];
            const VertexB: Fisiks2DVector = verticesB[(i + 1) % verticesB.length];
            const edge: Fisiks2DVector = Fisiks2DVector.Difference(VertexB, VertexA);
            const axis: Fisiks2DVector = Fisiks2DVector.Normalize(new Fisiks2DVector(edge.y * -1, edge.x));
            
            const { min: minA, max: maxA } = this.ProjectVertices(verticesA, axis);
            const { min: minB, max: maxB } = this.ProjectVertices(verticesB, axis);

            const epsilon = 1e-6; 
            
            if (minA > maxB + epsilon || minB > maxA + epsilon) {
                return false;
            }
            
        }

        return true;
    }

    static ProjectVertices(vertices: Fisiks2DVector[], axis: Fisiks2DVector): { min: number, max: number } {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
    
        for (const vertex of vertices) {
            const projection = Fisiks2DVector.DotProduct(vertex, axis);
            min = Math.min(min, projection);
            max = Math.max(max, projection);
        }
    
        return { min, max };
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