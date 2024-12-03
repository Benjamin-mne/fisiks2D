import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksShape } from "./FisiksShape";
import { FisiksTransform } from "./FisiksTransform";

export enum ShapeType { Box, Circle};  

export class FisiksBody {
    context: CanvasRenderingContext2D | null = null;
    position: Fisiks2DVector = Fisiks2DVector.Zero;
    color: string = 'blue';

    linearVelocity: Fisiks2DVector = Fisiks2DVector.Zero;
    rotationCenter: Fisiks2DVector = Fisiks2DVector.Zero;
    rotation: number = 0;
    rotationalVelocity: number = 0;

    vertices: Fisiks2DVector[] = [];
    transformedVertices: Fisiks2DVector[] = [];


    public area: number = 0;
    public density: number = 0;
    public mass: number = 0;
    public restitution: number = 0;

    public shape: ShapeType = ShapeType.Circle;
    public radius: number = 50; 
    public width: number = 100;  
    public height: number = 100; 

    public isStatic: boolean = false;

    constructor(params: Partial<FisiksBody>) {
        Object.assign(this, params);
    }

    public CreateCircle(radius: number){
        if(!this.context){
            throw new Error("No context provided.");
        }

        this.rotationCenter = this.position;
        this.area = Math.PI * radius * radius;
        this.density = this.area;
        this.mass = this.area;

        FisiksShape.DrawCircle(this.context, this.position, this.color, this.radius);
    }

    public CreateBox(width: number, height: number){
        if(!this.context){
            throw new Error("No context provided.");
        }

        this.rotationCenter = new Fisiks2DVector(this.position.x + width/2, this.position.y + height/2);
        this.width = width;
        this.height = height;
        this.area = width * height;
        this.density = this.area;
        this.mass = this.area;
        
        if(this.transformedVertices.length === 0){
            this.vertices = this.CreateBoxVertices(width, height);
        } else {
            this.vertices = this.transformedVertices;
        }

        FisiksShape.DrawPolygon(this.context, this.vertices, this.color);

        if(this.transformedVertices.length !== 0){
            FisiksShape.DrawVertices(this.context, this.transformedVertices.concat([this.rotationCenter]), 'blue');
        } else {
            FisiksShape.DrawVertices(this.context, this.vertices, 'red');
        }
    }

    CreateBoxVertices(width: number, height: number): Fisiks2DVector[]{
        let vertices: Fisiks2DVector[] = [];
        
        let left: number = this.position.x;
        let right: number = this.position.x + width;
        let bottom: number = this.position.y + height;
        let top: number = this.position.y;

        vertices[0] = new Fisiks2DVector(left, top);
        vertices[1] = new Fisiks2DVector(right, top);
        vertices[2] = new Fisiks2DVector(right, bottom);
        vertices[3] = new Fisiks2DVector(left, bottom);

        return vertices;
    }

    CreateBoxTriangules(): number[]{
        let triangles: number[] = [];

        triangles[0] = 0;
        triangles[1] = 1;
        triangles[2] = 2;
        triangles[3] = 0;
        triangles[4] = 2;
        triangles[5] = 3;

        return triangles;
    }

    GetTranformedVertices(): Fisiks2DVector[] {
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex: Fisiks2DVector = this.vertices[i];
            const transform: FisiksTransform = new FisiksTransform(this.rotationCenter, this.rotation);
            const rotatedVertex = Fisiks2DVector.Transform(vertex, transform);
            
            this.transformedVertices[i] = rotatedVertex;
        }
    
        return this.transformedVertices;
    }
    

    Rotate(amount: number){
        this.rotation = amount;
        this.GetTranformedVertices();
    }

    Move(amount: Fisiks2DVector){
        this.position = Fisiks2DVector.Add(this.position, amount);
    }

    Draw(){
        if(this.shape === ShapeType.Circle){
            this.CreateCircle(this.radius);
        }
        else if(this.shape === ShapeType.Box){
            this.CreateBox(this.width, this.height);
        }
        else {
            throw new Error("Property does not exist on ShapeType");
        }
    }

    Update(){

    }
}