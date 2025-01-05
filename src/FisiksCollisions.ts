import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksAxisAlignedBoundingBox } from "./FisiksAABB";
import { FisiksBody, ShapeType } from "./FisiksBody";
import { Segment } from "./utils/utils";

export interface CollisionDetails {
    bodyA: FisiksBody, 
    bodyB: FisiksBody, 
    normal: Fisiks2DVector, 
    depth: number,
    contactPoints: Fisiks2DVector[];
}

interface DistanceContactPoint {
    distanceSq: number;
    contactPoint: Fisiks2DVector;
}

export class FisiksCollisions {
    static BroadPhase(A: FisiksAxisAlignedBoundingBox, B: FisiksAxisAlignedBoundingBox) : boolean {
        if(A.max.x <= A.min.x || B.max.x <= A.min.x || A.max.y <= A.min.y || B.max.y <= A.min.y) {
            return false;
        }

        return true;
    }

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

            let axis: Fisiks2DVector = new Fisiks2DVector(edge.y * -1, edge.x);
            axis = Fisiks2DVector.Normalize(axis)

            const projA = this.ProjectVertices(verticesA, axis);
            const projB = this.ProjectVertices(verticesB, axis);

            if(projA.min >= projB.max || projB.min >= projA.max)
            {
                return;
            }

            const axisDepth: number = Math.min(projB.max - projA.min, projA.max - projB.min); 
            
            if(axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        for (let i = 0; i < verticesB.length; i++) {
            const VertexA: Fisiks2DVector = verticesB[i];
            const VertexB: Fisiks2DVector = verticesB[(i + 1) % verticesB.length];
            const edge: Fisiks2DVector = Fisiks2DVector.Difference(VertexB, VertexA);
            
            let axis: Fisiks2DVector = new Fisiks2DVector(edge.y * -1, edge.x);
            axis = Fisiks2DVector.Normalize(axis)

            const projA = this.ProjectVertices(verticesA, axis);
            const projB = this.ProjectVertices(verticesB, axis);

            if (projA.min >= projB.max || projB.min >= projA.max){
                return;
            }

            const axisDepth: number = Math.min(projB.max - projA.min, projA.max - projB.min); 
            
            if(axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        let direction: Fisiks2DVector = Fisiks2DVector.Difference(PolygonB.rotationCenter, PolygonA.rotationCenter); 
        
        if(Fisiks2DVector.DotProduct(direction, normal) < 0){
            normal = Fisiks2DVector.ScalarMultiplication(-1, normal);
        }

        const contactPoints = this.FindContactsPointsPolygons(PolygonA, PolygonB);

        const Details: CollisionDetails = {
            bodyA: PolygonA,
            bodyB: PolygonB,
            normal,
            depth,
            contactPoints
        } 

        return Details;
    }

    static FindContactsPointsPolygons(PolygonA: FisiksBody, PolygonB: FisiksBody): Fisiks2DVector[]{
        let minDistanceSq: number = Number.MAX_VALUE;  
        let contactPoints: Fisiks2DVector[] = [];
        
        for (let i = 0; i < PolygonA.vertices.length; i++) {
            const PointA = PolygonA.vertices[i];
        
            for (let j = 0; j < PolygonB.vertices.length; j++) {
                const CurrentVertexB = PolygonB.vertices[j];
                const NextVertexB = PolygonB.vertices[(j + 1) % PolygonB.vertices.length]; 
                const segment = new Segment(CurrentVertexB, NextVertexB);
                
                const { contactPoint, distanceSq } = this.FindDistancePointSegment(PointA, segment);
                
                const epsilon = 1e-6;

                if (distanceSq < minDistanceSq - epsilon) {
                    minDistanceSq = distanceSq;
                    contactPoints = [contactPoint];  
                } else if (Math.abs(distanceSq - minDistanceSq) < epsilon) {
                    contactPoints.push(contactPoint);
                }
                
            }     
        }

        return contactPoints;
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

        let minDistanceSq: number = Number.MAX_VALUE;  
        let contact: Fisiks2DVector = Fisiks2DVector.Zero;

        for(let i = 0; i < Polygon.vertices.length; i++){

            const vertexA: Fisiks2DVector = Polygon.vertices[i];
            const vertexB: Fisiks2DVector = Polygon.vertices[(i + 1) % Polygon.vertices.length];
            const segment: Segment = new Segment(vertexA, vertexB);
            
            const { distanceSq, contactPoint } = this.FindDistancePointSegment(Circle.rotationCenter, segment);

            if (distanceSq < minDistanceSq){
                minDistanceSq = distanceSq;
                contact = contactPoint;
            }
        }

        const Details: CollisionDetails = {
            bodyA: Circle,
            bodyB: Polygon,
            normal,
            depth,
            contactPoints: [contact]
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

        let contactPoint: Fisiks2DVector = Fisiks2DVector.Add(
            CircleA.position,
            Fisiks2DVector.ScalarMultiplication(
                CircleA.radius,
                Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.position, CircleA.position)))
            ) 


        normal = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.position, CircleA.position));
        depth = radii - distance;

        const Details: CollisionDetails = {
            bodyA: CircleA,
            bodyB: CircleB,
            normal,
            depth,
            contactPoints: [contactPoint]
        } 

        return Details;
    }

    static FindDistancePointSegment(point: Fisiks2DVector, segment: Segment): DistanceContactPoint {
        let contactPoint: Fisiks2DVector; 
        
        const AB: Fisiks2DVector = Fisiks2DVector.Difference(segment.pointB, segment.pointA);
        const AP: Fisiks2DVector = Fisiks2DVector.Difference(point, segment.pointA);
        
        const projection: number = Fisiks2DVector.DotProduct(AP, AB);
        const ABMagnitudeSquared: number = AB.GetSquaredMagnitude(); 
        const distance: number = projection / ABMagnitudeSquared;

        if (distance <= 0){
            contactPoint = segment.pointA;
        } else if (distance >= 1){
            contactPoint = segment.pointB;
        } else {
            contactPoint = Fisiks2DVector.Add(
                segment.pointA,
                Fisiks2DVector.ScalarMultiplication(distance, AB)
            )
        }

        const distanceSquared = Fisiks2DVector.SquaredDistance(point, contactPoint)

        return {
            distanceSq: distanceSquared,
            contactPoint
        };
    }

    static ProjectVertices(vertices: Fisiks2DVector[], axis: Fisiks2DVector): { min: number, max: number } {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
    
        for(let i = 0; i < vertices.length; i++){
            const vertex: Fisiks2DVector = vertices[i];
            const projection: number = Fisiks2DVector.DotProduct(vertex, axis);
            
            if(projection < min) { min = projection;}
            if(projection > max) { max = projection;}
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