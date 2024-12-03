import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksShape } from "./FisiksShape";
<<<<<<< HEAD
import { FisiksTransform } from "./FisiksTransform";
=======
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986

export enum ShapeType { Box, Circle};  

export class FisiksBody {
    context: CanvasRenderingContext2D | null = null;
    position: Fisiks2DVector = Fisiks2DVector.Zero;
    color: string = 'blue';

    linearVelocity: Fisiks2DVector = Fisiks2DVector.Zero;
<<<<<<< HEAD
    rotationCenter: Fisiks2DVector = Fisiks2DVector.Zero;
=======
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986
    rotation: number = 0;
    rotationalVelocity: number = 0;

    vertices: Fisiks2DVector[] = [];
<<<<<<< HEAD
    transformedVertices: Fisiks2DVector[] = [];

=======
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986

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

<<<<<<< HEAD
        this.rotationCenter = this.position;
=======
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986
        this.area = Math.PI * radius * radius;
        this.density = this.area;
        this.mass = this.area;

        FisiksShape.DrawCircle(this.context, this.position, this.color, this.radius);
    }

    public CreateBox(width: number, height: number){
        if(!this.context){
            throw new Error("No context provided.");
        }

<<<<<<< HEAD
        this.rotationCenter = new Fisiks2DVector(this.position.x + width/2, this.position.y + height/2);
=======
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986
        this.width = width;
        this.height = height;
        this.area = width * height;
        this.density = this.area;
        this.mass = this.area;
<<<<<<< HEAD
        
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
=======
        this.vertices = this.CreateBoxVertices(width, height);

        FisiksShape.DrawBox(this.context, this.position, this.color, this.width, this.height);
        FisiksShape.DrawVertices(this.context, this.vertices, 'red');
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986
    }

    CreateBoxVertices(width: number, height: number): Fisiks2DVector[]{
        let vertices: Fisiks2DVector[] = [];
        
        let left: number = this.position.x;
<<<<<<< HEAD
        let right: number = this.position.x + width;
        let bottom: number = this.position.y + height;
=======
        let right: number = this.position.x + width - 5;
        let bottom: number = this.position.y + height - 5;
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986
        let top: number = this.position.y;

        vertices[0] = new Fisiks2DVector(left, top);
        vertices[1] = new Fisiks2DVector(right, top);
<<<<<<< HEAD
        vertices[2] = new Fisiks2DVector(right, bottom);
        vertices[3] = new Fisiks2DVector(left, bottom);
=======
        vertices[2] = new Fisiks2DVector(left, bottom);
        vertices[3] = new Fisiks2DVector(right, bottom);
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986

        return vertices;
    }

<<<<<<< HEAD
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
=======
    Move(amount: Fisiks2DVector)
    {
>>>>>>> e7313d02ae604463c0b2cfad7b36baf90b96d986
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