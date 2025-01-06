import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksAxisAlignedBoundingBox } from "./FisiksAABB";
import { FisiksShape } from "./FisiksShape";
import { FisiksTransform } from "./FisiksTransform";
import { generateId, id } from "./utils/utils";

export enum ShapeType { Box, Circle};  

export class FisiksBody {
    id: id = generateId(); 
    context: CanvasRenderingContext2D | null = null;
    position: Fisiks2DVector = Fisiks2DVector.Zero;
    previousPosition: Fisiks2DVector = Fisiks2DVector.Zero;
    color: string = 'blue';

    linearVelocity: Fisiks2DVector = Fisiks2DVector.Zero;
    previousVelocity: Fisiks2DVector = Fisiks2DVector.Zero;
    rotationCenter: Fisiks2DVector = Fisiks2DVector.Zero;
    rotationalVelocity: Fisiks2DVector = Fisiks2DVector.Zero;

    angle: number = 0;
    angularVelocity: number = 0;

    inertia: number = 0;

    force: Fisiks2DVector = Fisiks2DVector.Zero;
    previousRotation: number = 0;
    
    vertices: Fisiks2DVector[] = [];
    transformedVertices: Fisiks2DVector[] = [];

    public isColliding: boolean = false;

    public area: number = 0;
    public density: number = 0;
    public mass: number = 0;
    public restitution: number = 0.5;

    public shape: ShapeType = ShapeType.Circle;
    public radius: number = 50; 
    public width: number = 100;  
    public height: number = 100; 

    public isStatic: boolean = false;
    public controllable: boolean = false;

    constructor(params: Partial<FisiksBody>) {
        Object.assign(this, params);
    }

    public CreateCircle(radius: number, showVertices: boolean){
        if(!this.context){
            throw new Error("No context provided.");
        }

        this.rotationCenter = this.position;
        this.area = Math.PI * radius * radius;
        this.density = this.area;
        this.mass = this.area;

        FisiksShape.DrawCircle(this.context, this.position, this.color, this.radius);
        
        const AABB = this.GetAABB();

        if(showVertices){
            if (AABB instanceof FisiksAxisAlignedBoundingBox){
                FisiksShape.DrawVertices(this.context, this.vertices.concat(this.rotationCenter), 'red', AABB)
            } 
        }
    }

    public CreateBox(width: number, height: number, showVertices: boolean){
        if(!this.context){
            throw new Error("No context provided.");
        }

        this.rotationCenter = new Fisiks2DVector(this.position.x + width/2, this.position.y + height/2);
        this.width = width;
        this.height = height;
        this.area = width * height;
        this.density = this.area;
        this.mass = this.area;

        let inertia = this.CalculateRotationalInertia();

        if (typeof inertia === 'number') {
            this.inertia = inertia;
        }
        
        if(this.transformedVertices.length === 0){
            this.vertices = this.CreateBoxVertices(width, height);
        } else {
            this.vertices = this.transformedVertices;
        }

        if(this.angle > 0) {
            this.Rotate(this.angle);
            this.angle = 0;
        }

        FisiksShape.DrawPolygon(this.context, this.vertices, this.color);

        const AABB = new FisiksAxisAlignedBoundingBox(Fisiks2DVector.Zero, Fisiks2DVector.Zero);

        if(showVertices){
            if (AABB instanceof FisiksAxisAlignedBoundingBox){
                const vertices:Fisiks2DVector[] = this.vertices.concat(this.rotationCenter);
                FisiksShape.DrawVertices(this.context, [vertices[4]], 'red', AABB)
            } 
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
            const transform: FisiksTransform = new FisiksTransform(this.rotationCenter, this.angle);
            const rotatedVertex = Fisiks2DVector.Transform(vertex, transform);
            
            this.transformedVertices[i] = rotatedVertex;
        }
    
        return this.transformedVertices;
    }

    GetAABB(): FisiksAxisAlignedBoundingBox | Error {
        let max: Fisiks2DVector = new Fisiks2DVector(Number.MIN_VALUE, Number.MIN_VALUE); 
        let min: Fisiks2DVector = new Fisiks2DVector(Number.MAX_VALUE, Number.MAX_VALUE);

        if(this.shape === ShapeType.Box){
            this.vertices.forEach(vertex => {
                if(vertex.x > max.x){
                    max = new Fisiks2DVector(
                        vertex.x,
                        max.y
                    )
                }
                if(vertex.y > max.y){
                    max = new Fisiks2DVector(
                        max.x,
                        vertex.y
                    )
                }

                if(vertex.x < min.x){
                    min = new Fisiks2DVector(
                        vertex.x,
                        min.y
                    )
                }

                if(vertex.y < min.y){
                    min = new Fisiks2DVector(
                        min.x,
                        vertex.y
                    )
                }
            });

            return new FisiksAxisAlignedBoundingBox(min, max);
        }
        else if (this.shape === ShapeType.Circle){
            min = new Fisiks2DVector(
                this.rotationCenter.x - this.radius, 
                this.rotationCenter.y - this.radius
            );

            max = new Fisiks2DVector(
                this.rotationCenter.x + this.radius,
                this.rotationCenter.y + this.radius
            )

            return new FisiksAxisAlignedBoundingBox(min, max);
        }
        
        throw new Error('AxisAlignedBoundingBox Error!')
    }
    
    Rotate(amount: number){
        this.angle = amount;
        this.GetTranformedVertices();
    }

    CalculateRotationalInertia(): number {
        if (this.shape === ShapeType.Circle) {
            return (1 / 2) * this.mass * (this.radius * this.radius);
        } else if (this.shape === ShapeType.Box) {
            return (1 / 12) * this.mass * (this.height * this.height + this.width * this.width);
        } else {
            throw new Error('No Valid Shape Type.');
        }
    }

    Move(amount: Fisiks2DVector): void {
        this.position = Fisiks2DVector.Add(this.position, amount);
        this.rotationCenter = Fisiks2DVector.Add(this.rotationCenter, amount);

        if(this.shape === ShapeType.Box){
            for (let i = 0; i < this.vertices.length; i++) {
                this.vertices[i] = Fisiks2DVector.Add(this.vertices[i], amount);                
            }
        }
    }

    MoveTo(position: Fisiks2DVector){
        this.position = position;
        this.rotationCenter = new Fisiks2DVector(this.position.x + this.width/2, this.position.y + this.height/2);

        if(this.shape === ShapeType.Box){
            this.vertices = this.CreateBoxVertices(this.width, this.height)
        }
    }

    ApplyForce(amount: Fisiks2DVector): void {
        this.force = amount;
    }

    Step(time: number, gravity: Fisiks2DVector): void{
        if(this.isStatic) return
        if(this.mass === 0) return
        
        //const acceleration: Fisiks2DVector = Fisiks2DVector.ScalarMultiplication(1 / this.mass, this.force);
        //this.linearVelocity = Fisiks2DVector.Add(this.linearVelocity, Fisiks2DVector.ScalarMultiplication(time * 1000, acceleration));

        this.linearVelocity = Fisiks2DVector.Add(
            this.linearVelocity,
            Fisiks2DVector.ScalarMultiplication(time, gravity)
        );

        this.position = Fisiks2DVector.Add(this.position, Fisiks2DVector.ScalarMultiplication(time, this.linearVelocity));
        this.rotationCenter = Fisiks2DVector.Add(this.rotationCenter, Fisiks2DVector.ScalarMultiplication(time, this.rotationalVelocity));
    
        this.angle += this.angularVelocity * time;

        if(this.shape === ShapeType.Box){
            for (let i = 0; i < this.vertices.length; i++) {
                this.vertices[i] = Fisiks2DVector.Add(this.vertices[i], Fisiks2DVector.ScalarMultiplication(time, this.rotationalVelocity));                
            }
        }

        this.force = Fisiks2DVector.Zero;
    }

    Draw(showVertices: boolean){
        if(this.shape === ShapeType.Circle){
            this.CreateCircle(this.radius, showVertices);
        }
        else if(this.shape === ShapeType.Box){
            this.CreateBox(this.width, this.height, showVertices);
        }
        else {
            throw new Error("Property does not exist on ShapeType");
        }
    }
}