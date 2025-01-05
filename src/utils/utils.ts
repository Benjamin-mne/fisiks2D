import { Fisiks2DVector } from "../Fisiks2DVector";

export type id = `${string}-${string}-${string}-${string}`

export function generateId(): id {
    const segment = () => Math.random().toString(36).substring(2, 6); 
    return `${segment()}-${segment()}-${segment()}-${segment()}` as id;
}

export class Segment {
    readonly pointA: Fisiks2DVector;
    readonly pointB: Fisiks2DVector;

    constructor(pointA: Fisiks2DVector, pointB: Fisiks2DVector){
        this.pointA = pointA;
        this.pointB = pointB;
    }

    getDistance(): Fisiks2DVector {
        const distance: Fisiks2DVector = Fisiks2DVector.Difference(this.pointA, this.pointB); 
        return distance;
    }
}