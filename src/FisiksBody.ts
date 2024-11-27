import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksShape } from "./FisiksShape";

export enum ShapeType { Box, Circle};  

export class FisiksBody {
    context: CanvasRenderingContext2D | null = null;
    position: Fisiks2DVector = Fisiks2DVector.Zero;
    color: string = 'blue';

    private linearVelocity: Fisiks2DVector = Fisiks2DVector.Zero;
    private rotation: number = 0;
    private rotationalVelocity: number = 0;

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

        this.area = Math.PI * radius * radius;
        this.density = this.area;
        this.mass = this.area;

        FisiksShape.DrawCircle(this.context, this.position, this.color, this.radius);
    }

    public CreateBox(width: number, height: number){
        if(!this.context){
            throw new Error("No context provided.");
        }

        this.width = width;
        this.height = height;
        this.area = width * height;
        this.density = this.area;
        this.mass = this.area;

        FisiksShape.DrawBox(this.context, this.position, this.color, this.width, this.height);
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