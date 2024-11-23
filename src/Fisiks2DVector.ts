export class Fisiks2DVector {
    public readonly x: number;
    public readonly y: number;
    
    public static readonly Zero: Fisiks2DVector = new Fisiks2DVector(0, 0); 

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static Add(addent: Fisiks2DVector, otherAddent: Fisiks2DVector): Fisiks2DVector {
        return new Fisiks2DVector(addent.x + otherAddent.x, addent.y + otherAddent.y); 
    }

    public static Difference(minuend: Fisiks2DVector, subtrahend: Fisiks2DVector): Fisiks2DVector {
        return new Fisiks2DVector(minuend.x - subtrahend.x, minuend.y - subtrahend.y);
    }

    public static ScalarMultiplication(scalar: number, vector: Fisiks2DVector) {
        return new Fisiks2DVector(scalar * vector.x, scalar * vector.y);
    }

    public static Normalize(vector: Fisiks2DVector): Fisiks2DVector {
        const magnitude: number = vector.GetMagnitude();
        return new Fisiks2DVector(vector.x / magnitude, vector.y / magnitude);
    }

    public static Distance(vector: Fisiks2DVector, otherVector: Fisiks2DVector): number {
        const dx: number = otherVector.x - vector.x;
        const dy: number = otherVector.y - vector.y; 

        return Math.sqrt(dx * dx + dy * dy);
    }

    public static DotProduct(vector: Fisiks2DVector, otherVector: Fisiks2DVector): number {
        return vector.x * otherVector.x + vector.y * otherVector.y;
    }

    public static CrossProduct(vector: Fisiks2DVector, otherVector: Fisiks2DVector): number {
        return vector.x * otherVector.y - vector.y * otherVector.x;
    }

    public GetMagnitude(): number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    public AreEquals(otherVector: Fisiks2DVector): boolean {
        return (this.x === otherVector.x) && (this.y === otherVector.y);
    };
}