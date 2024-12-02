import { Fisiks2DVector } from "./Fisiks2DVector";

export class FisiksTransform {
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly sin: number;
    public readonly cos: number;

    constructor(position: Fisiks2DVector, angle: number){
        this.positionX = position.x;
        this.positionY = position.y;
        this.sin = Math.sin(angle);
        this.cos = Math.cos(angle);
    }

    public static readonly Zero: FisiksTransform = new FisiksTransform(Fisiks2DVector.Zero, 0);
}