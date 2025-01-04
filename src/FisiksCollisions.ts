import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksBody, ShapeType } from "./FisiksBody";

export interface CollisionDetails {
    bodyA: FisiksBody, 
    bodyB: FisiksBody, 
    normal: Fisiks2DVector, 
    depth: number
}

export class FisiksCollisions {
    public static NarrowPashe(BodyA: FisiksBody, BodyB: FisiksBody): CollisionDetails | undefined {
        if(BodyA.shape === ShapeType.Circle && BodyB.shape === ShapeType.Circle){
            return this.IntersectCircles(BodyA, BodyB);
        }

        if(BodyA.shape === ShapeType.Box && BodyB.shape === ShapeType.Box){
            return this.IntersectPolygons(BodyA, BodyB);
        }

        if(BodyA.shape === ShapeType.Circle && BodyB.shape === ShapeType.Box){
            return this.IntersectCirclePolygon(BodyA, BodyB);
        } 

        if(BodyA.shape === ShapeType.Box && BodyB.shape === ShapeType.Circle){
            return this.IntersectCirclePolygon(BodyB, BodyA);
        } 
    }

    static SolveCollision(bodyA: FisiksBody, bodyB: FisiksBody, normal: Fisiks2DVector, depth: number): void {
        bodyA.isColliding = true;
        bodyB.isColliding = true;

        if (bodyA.isStatic && bodyB.isStatic) {
            bodyA.isColliding = false;
            bodyB.isColliding = false;
            return
        };
    
        if (bodyA.isStatic) {
            bodyB.Move(Fisiks2DVector.ScalarMultiplication(depth, normal));
        } else if (bodyB.isStatic) {
            bodyA.Move(Fisiks2DVector.ScalarMultiplication(-depth, normal));
        } else {
            let halfDepth = depth / 2;
            bodyA.Move(Fisiks2DVector.ScalarMultiplication(-halfDepth, normal));
            bodyB.Move(Fisiks2DVector.ScalarMultiplication(halfDepth, normal));
        }
    
        let inverseMassA = bodyA.isStatic ? 0 : (1 / bodyA.mass);
        let inverseMassB = bodyB.isStatic ? 0 : (1 / bodyB.mass);
    
        let restitution = Math.min(bodyA.restitution, bodyB.restitution);
        let relativeVelocity = Fisiks2DVector.Difference(bodyB.linearVelocity, bodyA.linearVelocity);
    
        if (Fisiks2DVector.DotProduct(relativeVelocity, normal) > 0) return; 
    
        let impulseNumerator = -(1 + restitution) * Fisiks2DVector.DotProduct(relativeVelocity, normal);
        let impulseDenominator = inverseMassA + inverseMassB;
    
        if (impulseDenominator === 0) return;
    
        let impulse = impulseNumerator / impulseDenominator;
        let impulseVector = Fisiks2DVector.ScalarMultiplication(impulse, normal);

        bodyA.linearVelocity = Fisiks2DVector.Add(
            bodyA.linearVelocity,
            Fisiks2DVector.ScalarMultiplication(-inverseMassA, impulseVector)
        );

        bodyB.linearVelocity = Fisiks2DVector.Add(
            bodyB.linearVelocity,
            Fisiks2DVector.ScalarMultiplication(inverseMassB, impulseVector)
        );

        bodyA.isColliding = false;
        bodyB.isColliding = false;
    }

    static IntersectPolygons(PolygonA: FisiksBody, PolygonB: FisiksBody): CollisionDetails | undefined {
        const verticesA: Fisiks2DVector[] = PolygonA.vertices;
        const verticesB: Fisiks2DVector[] = PolygonB.vertices;

        let normal: Fisiks2DVector = Fisiks2DVector.Zero;
        let depth: number = Number.MAX_VALUE; 

        for (let i = 0; i < verticesA.length; i++) {
            const VertexA: Fisiks2DVector = verticesA[i];
            const VertexB: Fisiks2DVector = verticesA[(i + 1) % verticesA.length];
            const edge: Fisiks2DVector = Fisiks2DVector.Difference(VertexB, VertexA);
            const axis: Fisiks2DVector = Fisiks2DVector.Normalize(new Fisiks2DVector(edge.y * -1, edge.x));
            
            const { min: minA, max: maxA } = this.ProjectVertices(verticesA, axis);
            const { min: minB, max: maxB } = this.ProjectVertices(verticesB, axis);

            const epsilon = 1e-6;

            if (minA > maxB + epsilon || minB > maxA + epsilon) {
                return;
            }

            const axisDepth: number = Math.min(maxB - minA, maxA - minB); 
            
            if(axisDepth < depth){
                depth = axisDepth;
                normal = axis;
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
                return;
            }

            const axisDepth: number = Math.min(maxB - minA, maxA - minB); 
            
            if(axisDepth < depth){
                depth = axisDepth;
                normal = axis;
            }
        }

        depth = depth / normal.GetMagnitude();
        normal = Fisiks2DVector.Normalize(normal);

        let direction: Fisiks2DVector = Fisiks2DVector.Difference(PolygonB.rotationCenter, PolygonA.rotationCenter); 
        
        if(Fisiks2DVector.DotProduct(direction, normal) < 0){
            normal = Fisiks2DVector.ScalarMultiplication(-1, normal);
        }

        const Details: CollisionDetails = {
            bodyA: PolygonA,
            bodyB: PolygonB,
            normal,
            depth
        } 

        return Details;
    }

    static IntersectCirclePolygon(Circle: FisiksBody, Polygon: FisiksBody): CollisionDetails | undefined {
        const vertices: Fisiks2DVector[] = Polygon.vertices;

        let normal: Fisiks2DVector = Fisiks2DVector.Zero;
        let depth: number = Number.MAX_VALUE; 

        let axis: Fisiks2DVector = Fisiks2DVector.Zero;
        const epsilon = 1e-6;

        for (let i = 0; i < vertices.length; i++) {
            const VertexA: Fisiks2DVector = vertices[i];
            const VertexB: Fisiks2DVector = vertices[(i + 1) % vertices.length];
            const edge: Fisiks2DVector = Fisiks2DVector.Difference(VertexB, VertexA);

            if (edge.GetMagnitude() < epsilon) continue;

            axis = Fisiks2DVector.Normalize(new Fisiks2DVector(edge.y * -1, edge.x));
            
            const { min: minA, max: maxA } = this.ProjectVertices(vertices, axis);
            const { min: minB, max: maxB } = this.ProjectCircle(Circle, axis);

            if (minA > maxB + epsilon || minB > maxA + epsilon) {
                return;
            }

            const axisDepth: number = Math.min(maxB - minA, maxA - minB); 
            
            if(axisDepth < depth){
                depth = axisDepth;
                normal = axis;
            }
        }

        const closesPointIndex: number = this.FindClosesPointIndex(Circle, vertices);
        if (closesPointIndex === -1) return;

        const closesPoint: Fisiks2DVector = vertices[closesPointIndex];

        axis = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(closesPoint, Circle.position));

        const { min: minA, max: maxA } = this.ProjectVertices(vertices, axis);
        const { min: minB, max: maxB } = this.ProjectCircle(Circle, axis);

        if (minA > maxB + epsilon || minB > maxA + epsilon) {
            return;
        }

        const axisDepth: number = Math.min(maxB - minA, maxA - minB); 
        
        if(axisDepth < depth){
            depth = axisDepth;
            normal = axis;
        }

        const magnitude = normal.GetMagnitude();

        if (magnitude < epsilon) return;

        depth = depth / magnitude;
        normal = Fisiks2DVector.Normalize(normal);

        if (!Polygon.rotationCenter || !Circle.position) return;

        let direction: Fisiks2DVector = Fisiks2DVector.Difference(Polygon.rotationCenter, Circle.position); 
        
        if (direction.GetMagnitude() < epsilon) return;

        if(Fisiks2DVector.DotProduct(direction, normal) < 0){
            normal = Fisiks2DVector.ScalarMultiplication(-1, normal);
        }

        const Details: CollisionDetails = {
            bodyA: Circle,
            bodyB: Polygon,
            normal,
            depth
        } 

        return Details;
    }

    static IntersectCircles(CircleA: FisiksBody, CircleB: FisiksBody): CollisionDetails | undefined {
        let normal: Fisiks2DVector = Fisiks2DVector.Zero;
        let depth: number = 0;

        let distance: number = Fisiks2DVector.Distance(CircleA.position, CircleB.position);
        let radii: number = CircleA.radius + CircleB.radius;
        
        if(distance >= radii){
            return;
        }

        normal = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.position, CircleA.position));
        depth = radii - distance;

        const Details: CollisionDetails = {
            bodyA: CircleA,
            bodyB: CircleB,
            normal,
            depth
        } 

        return Details;
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

    static ProjectCircle(circle: FisiksBody, axis: Fisiks2DVector): { min: number, max: number } {
        let direction: Fisiks2DVector = Fisiks2DVector.Normalize(axis);
        let directionRadius: Fisiks2DVector = Fisiks2DVector.ScalarMultiplication(circle.radius, direction);

        let point1: Fisiks2DVector = Fisiks2DVector.Add(circle.position, directionRadius);
        let point2: Fisiks2DVector = Fisiks2DVector.Difference(circle.position, directionRadius);

        const min: number = Math.min(Fisiks2DVector.DotProduct(point1, axis), Fisiks2DVector.DotProduct(point2, axis));
        const max: number = Math.max(Fisiks2DVector.DotProduct(point1, axis), Fisiks2DVector.DotProduct(point2, axis));

        return { min, max };
    }

    static FindClosesPointIndex(Circle: FisiksBody, vertices: Fisiks2DVector[]): number {
        let result: number = -1; 
        let minDistance: number = Number.MAX_VALUE;
    
        for (let i = 0; i < vertices.length; i++) {
            const vertex: Fisiks2DVector = vertices[i];
            const distance: number = Fisiks2DVector.Distance(vertex, Circle.position);

            if(distance < minDistance){
                minDistance = distance;
                result = i;
            }
        }

        return result;
    }
}