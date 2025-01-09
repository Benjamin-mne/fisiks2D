import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksAxisAlignedBoundingBox } from "./FisiksAABB";
import { FisiksBody, FisiksBodyBox, FisiksBodyCircle } from "./FisiksBody";
import { FisiksCollisionManifold } from "./FisiksCollisionManifold";
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
        if(BodyA instanceof FisiksBodyCircle && BodyB instanceof FisiksBodyCircle){
            return this.IntersectCircles(BodyA, BodyB);
        }

        if(BodyA instanceof FisiksBodyBox && BodyB instanceof FisiksBodyBox){
            return this.IntersectPolygons(BodyA, BodyB);
        }

        if(BodyA instanceof FisiksBodyCircle && BodyB instanceof FisiksBodyBox){
            return this.IntersectCirclePolygon(BodyA, BodyB);
        } 

        if(BodyA instanceof FisiksBodyBox && BodyB instanceof FisiksBodyCircle){
            return this.IntersectCirclePolygon(BodyB, BodyA);
        } 
    }

    static SolveCollision(bodyA: FisiksBody, bodyB: FisiksBody, normal: Fisiks2DVector): void {
        let inverseMassA = bodyA.getStatic() ? 0 : (1 / bodyA.getMass());
        let inverseMassB = bodyB.getStatic() ? 0 : (1 / bodyB.getMass());
    
        let restitution = Math.min(bodyA.getRestitution(), bodyB.getRestitution());
        let relativeVelocity = Fisiks2DVector.Difference(bodyB.getLinearVelocity(), bodyA.getLinearVelocity());
    
        if (Fisiks2DVector.DotProduct(relativeVelocity, normal) > 0) return; 
    
        let impulseNumerator = -(1 + restitution) * Fisiks2DVector.DotProduct(relativeVelocity, normal);
        let impulseDenominator = inverseMassA + inverseMassB;
    
        if (impulseDenominator === 0) return;
    
        let impulseMag = impulseNumerator / impulseDenominator;
        let impulse = Fisiks2DVector.ScalarMultiplication(impulseMag, normal);

        const newLinearVelocityA = Fisiks2DVector.Add(
            bodyA.getLinearVelocity(),
            Fisiks2DVector.ScalarMultiplication(-inverseMassA, impulse)
        );

        const newLinearVelocityB = Fisiks2DVector.Add(
            bodyB.getLinearVelocity(),
            Fisiks2DVector.ScalarMultiplication(inverseMassB, impulse)
        );

        bodyA.setLinearVelocity(newLinearVelocityA);
        bodyB.setLinearVelocity(newLinearVelocityB);
    }

    static SolveCollisionWithRotation(contact: FisiksCollisionManifold): void {
        // TODO
        
        const { bodyA, bodyB, normal } = contact;

        const inverseMassA = bodyA.getStatic() ? 0 : (1 / bodyA.getMass());
        const inverseMassB = bodyB.getStatic() ? 0 : (1 / bodyB.getMass());

        const restitution = Math.min(bodyA.getRestitution(), bodyB.getRestitution());

        const inverseInertiaA = (bodyA.getInertia() === 0) ? 0 : (1 / bodyA.getInertia());
        const inverseInertiaB = (bodyB.getInertia() === 0) ? 0 : (1 / bodyB.getInertia()); 

        let contactList = contact.contactPoints;
        let impulseList = [];
        let raList = [];
        let rbList = [];

        for(let i = 0; i < contactList.length; i++){
            impulseList[i] = Fisiks2DVector.Zero;
            raList[i] = Fisiks2DVector.Zero;
            rbList[i] = Fisiks2DVector.Zero;
        }

        for(let i = 0; i < contactList.length; i++){
            const ra = Fisiks2DVector.Difference(contactList[i], bodyA.getCenter());
            const rb = Fisiks2DVector.Difference(contactList[i], bodyB.getCenter());

            raList[i] = ra;
            rbList[i] = rb;

            const raPerp = new Fisiks2DVector(-ra.y, ra.x);
            const rbPerp = new Fisiks2DVector(-rb.y, rb.x);

            const angularLinearVelocityA = Fisiks2DVector.ScalarMultiplication(bodyA.getAngularVelocity(), raPerp);
            const angularLinearVelocityB = Fisiks2DVector.ScalarMultiplication(bodyB.getAngularVelocity(), rbPerp);

            const relativeVelocity = Fisiks2DVector.Difference(
                Fisiks2DVector.Add(bodyB.getLinearVelocity(), angularLinearVelocityB),
                Fisiks2DVector.Add(bodyA.getLinearVelocity(), angularLinearVelocityA)
            )

            const contactVelocityMag = Fisiks2DVector.DotProduct(relativeVelocity, normal);

            if (Math.abs(contactVelocityMag) < 0.0001) continue;

            const raPerpDotN = Fisiks2DVector.DotProduct(raPerp, normal);
            const rbPerpDotN = Fisiks2DVector.DotProduct(rbPerp, normal);

            const impulseDenominator = inverseMassA + inverseMassB + 
                (raPerpDotN * raPerpDotN) * inverseInertiaA + 
                (rbPerpDotN * rbPerpDotN) * inverseInertiaB;

            const impulseNumerator = -(1 + restitution) * contactVelocityMag;

            const impulseMag = (impulseNumerator / impulseDenominator);
            const impulse = Fisiks2DVector.ScalarMultiplication(impulseMag, normal);

            impulseList[i] = impulse;
        }

        for(let i = 0; i < contactList.length; i++) {
            const impulse = impulseList[i];
            const ra = raList[i];
            const rb = rbList[i];

            const newlinearVelocityA = Fisiks2DVector.Add(
                bodyA.getLinearVelocity(),
                Fisiks2DVector.ScalarMultiplication(-inverseMassA, impulse)
            );
            bodyA.setLinearVelocity(newlinearVelocityA);

            const newlinearVelocityB = Fisiks2DVector.Add(
                bodyB.getLinearVelocity(),
                Fisiks2DVector.ScalarMultiplication(inverseMassB, impulse)
            );
            bodyB.setLinearVelocity(newlinearVelocityB);

            const newAngularVelocityA = bodyA.getAngularVelocity() - Fisiks2DVector.CrossProduct(ra, impulse) * inverseInertiaA;
            bodyA.setAngularVelocity(newAngularVelocityA);

            const newAngularVelocityB = bodyB.getAngularVelocity() + Fisiks2DVector.CrossProduct(rb, impulse) * inverseInertiaB;
            bodyB.setAngularVelocity(newAngularVelocityB);
        }
    }

    static SeparateBodies(bodyA: FisiksBody, bodyB:FisiksBody, normal: Fisiks2DVector, depth: number){
        if (bodyA.getStatic() && bodyB.getStatic()) {
            return
        };
    
        if (bodyA.getStatic()) {
            bodyB.Move(Fisiks2DVector.ScalarMultiplication(depth, normal));
        } else if (bodyB.getStatic()) {
            bodyA.Move(Fisiks2DVector.ScalarMultiplication(-depth, normal));
        } else {
            let halfDepth = depth / 2;
            bodyA.Move(Fisiks2DVector.ScalarMultiplication(-halfDepth, normal));
            bodyB.Move(Fisiks2DVector.ScalarMultiplication(halfDepth, normal));
        }
    }

    static IntersectPolygons(PolygonA: FisiksBodyBox, PolygonB: FisiksBodyBox): CollisionDetails | undefined {
        const verticesA: Fisiks2DVector[] = PolygonA.getVertices();
        const verticesB: Fisiks2DVector[] = PolygonB.getVertices();

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

        let direction: Fisiks2DVector = Fisiks2DVector.Difference(PolygonB.getCenter(), PolygonA.getCenter()); 
        
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

    static FindContactsPointsPolygons(PolygonA: FisiksBodyBox, PolygonB: FisiksBodyBox): Fisiks2DVector[] {
        let minDistanceSq: number = Number.MAX_VALUE;
        let contactPoints: Fisiks2DVector[] = [];
        const epsilon = 1e-6;
    
        const findContacts = (sourcePolygon: FisiksBodyBox, targetPolygon: FisiksBodyBox) => {
            for (let i = 0; i < sourcePolygon.getVertices().length; i++) {
                const point = sourcePolygon.getVertices()[i];
    
                for (let j = 0; j < targetPolygon.getVertices().length; j++) {
                    const currentVertex = targetPolygon.getVertices()[j];
                    const nextVertex = targetPolygon.getVertices()[(j + 1) % targetPolygon.getVertices().length];
                    const segment = new Segment(currentVertex, nextVertex);
    
                    const { contactPoint, distanceSq } = this.FindDistancePointSegment(point, segment);
    
                    if (distanceSq < minDistanceSq - epsilon) {
                        minDistanceSq = distanceSq;
                        contactPoints = [contactPoint];
                    } else if (Math.abs(distanceSq - minDistanceSq) < epsilon) {
                        contactPoints.push(contactPoint);
                    }
                }
            }
        };
    
        findContacts(PolygonA, PolygonB);
        findContacts(PolygonB, PolygonA);
    
        return contactPoints;
    }
    
    static IntersectCirclePolygon(Circle: FisiksBodyCircle, Polygon: FisiksBodyBox): CollisionDetails | undefined {

        const vertices: Fisiks2DVector[] = Polygon.getVertices();

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

        axis = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(closesPoint, Circle.getPosition()));

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

        if (!Polygon.getCenter() || !Circle.getPosition()) return;

        let direction: Fisiks2DVector = Fisiks2DVector.Difference(Polygon.getCenter(), Circle.getPosition()); 
        
        if (direction.GetMagnitude() < epsilon) return;

        if(Fisiks2DVector.DotProduct(direction, normal) < 0){
            normal = Fisiks2DVector.ScalarMultiplication(-1, normal);
        }

        let contact: Fisiks2DVector = Fisiks2DVector.Zero;
        let minDistanceSq: number = Number.MAX_VALUE;

        for (let i = 0; i < vertices.length; i++) {
            const vertexA: Fisiks2DVector = vertices[i];
            const vertexB: Fisiks2DVector = vertices[(i + 1) % vertices.length];
            const segment: Segment = new Segment(vertexA, vertexB);

            const { distanceSq, contactPoint } = this.FindDistancePointSegment(Circle.getPosition(), segment);

            if (distanceSq < minDistanceSq) {
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

    static IntersectCircles(CircleA: FisiksBodyCircle, CircleB: FisiksBodyCircle): CollisionDetails | undefined {
        let normal: Fisiks2DVector = Fisiks2DVector.Zero;
        let depth: number = 0;

        let distance: number = Fisiks2DVector.Distance(CircleA.getPosition(), CircleB.getPosition());
        let radii: number = CircleA.getRadius() + CircleB.getRadius();
        
        if(distance >= radii){
            return;
        }

        let contactPoint: Fisiks2DVector = Fisiks2DVector.Add(
            CircleA.getPosition(),
            Fisiks2DVector.ScalarMultiplication(
                CircleA.getRadius(),
                Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.getPosition(), CircleA.getPosition())))
            ) 


        normal = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.getPosition(), CircleA.getPosition()));
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
    
        const ABMagnitudeSquared: number = AB.GetSquaredMagnitude();
    
        if (ABMagnitudeSquared === 0) {
            contactPoint = segment.pointA;
        } else {
            const projection: number = Fisiks2DVector.DotProduct(AP, AB);
            const t: number = projection / ABMagnitudeSquared;
    
            if (t <= 0) {
                contactPoint = segment.pointA;
            } else if (t >= 1) {
                contactPoint = segment.pointB;
            } else {
                contactPoint = Fisiks2DVector.Add(
                    segment.pointA,
                    Fisiks2DVector.ScalarMultiplication(t, AB)
                );
            }
        }
    
        const distanceSquared = Fisiks2DVector.SquaredDistance(point, contactPoint);
    
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

    static ProjectCircle(circle: FisiksBodyCircle, axis: Fisiks2DVector): { min: number, max: number } {
        let direction: Fisiks2DVector = Fisiks2DVector.Normalize(axis);
        let directionRadius: Fisiks2DVector = Fisiks2DVector.ScalarMultiplication(circle.getRadius(), direction);

        let point1: Fisiks2DVector = Fisiks2DVector.Add(circle.getPosition(), directionRadius);
        let point2: Fisiks2DVector = Fisiks2DVector.Difference(circle.getPosition(), directionRadius);

        const min: number = Math.min(Fisiks2DVector.DotProduct(point1, axis), Fisiks2DVector.DotProduct(point2, axis));
        const max: number = Math.max(Fisiks2DVector.DotProduct(point1, axis), Fisiks2DVector.DotProduct(point2, axis));

        return { min, max };
    }

    static FindClosesPointIndex(Circle: FisiksBodyCircle, vertices: Fisiks2DVector[]): number {
        let result: number = -1; 
        let minDistance: number = Number.MAX_VALUE;
    
        for (let i = 0; i < vertices.length; i++) {
            const vertex: Fisiks2DVector = vertices[i];
            const distance: number = Fisiks2DVector.Distance(vertex, Circle.getPosition());

            if(distance < minDistance){
                minDistance = distance;
                result = i;
            }
        }

        return result;
    }
}