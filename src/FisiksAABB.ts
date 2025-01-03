import { Fisiks2DVector } from "./Fisiks2DVector";

export class FisiksAxisAlignedBoundingBox {
    public readonly min: Fisiks2DVector;
    public readonly max: Fisiks2DVector;

    constructor(min: Fisiks2DVector, max: Fisiks2DVector){
        this.min = min;
        this.max = max;
    }
}