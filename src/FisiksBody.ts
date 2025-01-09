import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksAxisAlignedBoundingBox } from "./FisiksAABB";
import { FisiksShape } from "./FisiksShape";
import { FisiksTransform } from "./FisiksTransform";
import { generateId, id } from "./utils/utils";

export class FisiksBody {
    private readonly id: id = generateId(); 
    private readonly context: CanvasRenderingContext2D | null;

    private previousPosition: Fisiks2DVector = Fisiks2DVector.Zero;
    private position: Fisiks2DVector;
    
    private center: Fisiks2DVector = Fisiks2DVector.Zero;
    private color: string = 'white';

    private linearVelocity: Fisiks2DVector = Fisiks2DVector.Zero;
    private previousVelocity: Fisiks2DVector = Fisiks2DVector.Zero;

    private previousRotation: number = 0;
    private rotationalVelocity: Fisiks2DVector = Fisiks2DVector.Zero;

    private angle: number = 0;
    private angularVelocity: number = 0;

    private inertia: number = 0;
    private force: Fisiks2DVector = Fisiks2DVector.Zero;
    private isColliding: boolean = false;

    private area: number = 0;
    private density: number = 0;
    private mass: number = 0;
    private restitution: number = 0.5;

    private isStatic: boolean = false;

    constructor(context: CanvasRenderingContext2D | null, position: Fisiks2DVector){
        this.context = context;
        this.position = position;
    }

    setPreviousVelocity(velocity: Fisiks2DVector){
        this.previousVelocity = velocity;
    }

    getPreviousVelocity(){
        return this.previousVelocity
    }

    setPreviousPosition(position: Fisiks2DVector){
        this.previousPosition = position;
    }

    getPreviousPosition(){
        return this.previousPosition
    }

    setPreviousRotation(amount: number){
        this.previousRotation = amount;
    }

    getPreviousRotation(){
        return this.previousRotation;
    }

    getId(){
        return this.id;
    }

    getContext(){
        return this.context;
    }
    
    setPosition(position: Fisiks2DVector){
        this.position = position;
    }

    getPosition(){
        return this.position
    }

    setCenter(center: Fisiks2DVector){
        this.center = center;
    }

    getCenter(){
        return this.center;
    }

    setColor(color: string){
        this.color = color;
    }

    getColor(){
        return this.color;
    }

    setArea(area: number){
        this.area = area;
    }

    setMass(mass: number){
        this.mass = mass;
    }

    getMass(){
        return this.mass
    }

    setDensity(density: number){
        this.density = density;
    }

    setRestitution(restitution: number){
        this.restitution = restitution; 
    }

    getRestitution(){
        return this.restitution;
    }

    setStatic(condition: boolean){
        this.isStatic = condition;
    }

    getStatic(){
        return this.isStatic;
    }

    setInertia(inertia: number){
        this.inertia = inertia;
    }

    getInertia(){
        return this.inertia;
    }

    setLinearVelocity(linearVelocity: Fisiks2DVector){
        this.linearVelocity = linearVelocity;
    }

    getLinearVelocity(){
        return this.linearVelocity
    }

    setRotationalVelocity(rotationalVelocity: number){
        this.rotationalVelocity = this.rotationalVelocity;
    }

    getRotationalVelocity(){
        return this.rotationalVelocity;
    }

    setAngularVelocity(angularVelocity: number){
        this.angularVelocity = angularVelocity;
    }

    getAngularVelocity(){
        return this.angularVelocity;
    }

    setAngle(angle: number){
        this.angle = angle;
    }

    getAngle(){
        return this.angle
    }

    setForce(amount: Fisiks2DVector){
        this.force = amount;
    }

    getForce(){
        return this.force
    }

    Rotate(amount: number){};
    Draw(){};
    Step(time: number, gravity: Fisiks2DVector){};
    Move(amount: Fisiks2DVector){};
    MoveTo(position: Fisiks2DVector){};
    drawVertices(){};
    drawAABB(){};

    getAABB(): FisiksAxisAlignedBoundingBox | Error {
        return new Error('Not init.')
    }

    ApplyForce(amount: Fisiks2DVector): void{
        this.force = amount;
    }

}

export class FisiksBodyCircle extends FisiksBody {
    private radius: number; 

    constructor(context: CanvasRenderingContext2D | null, position: Fisiks2DVector, radius: number){
        super(context, position)
        this.radius = radius;

        const AREA_MASS_DENSITY: number = Math.PI * Math.pow(radius, 2);
        const INERTIA = 0.5 * AREA_MASS_DENSITY * Math.pow(this.radius, 2);

        this.setCenter(position);
        this.setArea(AREA_MASS_DENSITY);
        this.setDensity(AREA_MASS_DENSITY);
        this.setMass(AREA_MASS_DENSITY);
        this.setInertia(INERTIA);
    }

    override setPosition(position: Fisiks2DVector){
        super.setPosition(position);
        this.setCenter(position);
    }
    
    getRadius(){
        return this.radius;
    }

    override Draw(){
        const context = this.getContext();

        if (context instanceof CanvasRenderingContext2D) {
            FisiksShape.DrawCircle(context, this.getPosition(), this.getColor(), this.radius);
        } else {
            throw new Error("No context provided.");
        }
    }

    override drawVertices(){
        const context = super.getContext();

        if (context instanceof CanvasRenderingContext2D) {
            FisiksShape.DrawPoints(context, [this.getPosition()]);
        } else {
            throw new Error("No context provided.");
        }
    }

    override drawAABB(){
        const context = this.getContext();
        const AABB = this.getAABB();

        if (context instanceof CanvasRenderingContext2D) {
            FisiksShape.DrawPoints(context, [AABB.min, AABB.max]);
        } else {
            throw new Error("No context provided.");
        }
    }

    getAABB(){
        let max: Fisiks2DVector = new Fisiks2DVector(Number.MIN_VALUE, Number.MIN_VALUE); 
        let min: Fisiks2DVector = new Fisiks2DVector(Number.MAX_VALUE, Number.MAX_VALUE);

        min = new Fisiks2DVector(
            this.getCenter().x - this.radius, 
            this.getCenter().y - this.radius
        );

        max = new Fisiks2DVector(
            this.getCenter().x + this.radius,
            this.getCenter().y + this.radius
        )

        return new FisiksAxisAlignedBoundingBox(min, max);
    }

    override MoveTo(position: Fisiks2DVector){
        this.setPosition(position);
        this.setCenter(position); 
    }

    override Move(amount: Fisiks2DVector): void {
        const newPosition = Fisiks2DVector.Add(this.getPosition(), amount);
        this.setPosition(newPosition);

        const newCenter = Fisiks2DVector.Add(this.getCenter(), amount)
        this.setCenter(newCenter);
    }

    override Step(time: number, gravity: Fisiks2DVector): void {
        if (this.getStatic()) return; 
        if (this.getMass() === 0) return;
    
        const gravityEffect = Fisiks2DVector.ScalarMultiplication(time, gravity);
        const newLinearVelocity = Fisiks2DVector.Add(this.getLinearVelocity(), gravityEffect);
        this.setLinearVelocity(newLinearVelocity);
    
        const newPosition = Fisiks2DVector.Add(this.getPosition(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
        this.setPosition(newPosition);
    
        const newCenter = Fisiks2DVector.Add(this.getCenter(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
        this.setCenter(newCenter);
    
        const newAngle = this.getAngle() + this.getAngularVelocity() * time;
        this.setAngle(newAngle);
    
        this.setForce(Fisiks2DVector.Zero);
    }
}

export class FisiksBodyBox extends FisiksBody {
    private width: number = 100;  
    private height: number = 100; 
    private vertices: Fisiks2DVector[] = [];
    private transformedVertices: Fisiks2DVector[] = [];

    constructor(context: CanvasRenderingContext2D | null, position: Fisiks2DVector, width: number, height: number){
        super(context, position)
        this.width = width;
        this.height = height;

        const CENTER = new Fisiks2DVector(position.x + width/2, position.y + height/2);
        const AREA_MASS_DENSITY: number = width * height;

        this.setCenter(CENTER);
        this.setArea(AREA_MASS_DENSITY);
        this.setMass(AREA_MASS_DENSITY);
        this.setDensity(AREA_MASS_DENSITY);

        const INERTIA = (1 / 12) * this.getMass() * (Math.pow(this.height, 2) + Math.pow(this.width, 2))

        this.setInertia(INERTIA);

        if(this.transformedVertices.length === 0){
            this.vertices = this.CreateBoxVertices(width, height);
        } else {
            this.vertices = this.transformedVertices;
        }
    }

    getHeight(){
        return this.height;
    }

    getWidth(){
        return this.width;
    }

    getVertices(){
        return this.vertices;
    }

    override setPosition(position: Fisiks2DVector){
        super.setPosition(position);

        const newCenter = new Fisiks2DVector(position.x + this.width/2, position.y + this.height/2)
        this.setCenter(newCenter);

        const newVertices = this.CreateBoxVertices(this.width, this.height);
        this.vertices = newVertices;
    }

    override Draw(){
        const context = this.getContext();

        if (context instanceof CanvasRenderingContext2D) {
            FisiksShape.DrawPolygon(context, this.vertices, this.getColor());
        } else {
            throw new Error("No context provided.");
        }
    }

    drawVertices(){
        const context = this.getContext();

        if (context instanceof CanvasRenderingContext2D) {
            FisiksShape.DrawPoints(context, this.vertices.concat([this.getCenter()]));
        } else {
            throw new Error("No context provided.");
        }
    }

    override drawAABB(){
        const context = this.getContext();
        const AABB = this.getAABB();

        if (context instanceof CanvasRenderingContext2D) {
            FisiksShape.DrawPoints(context, [AABB.min, AABB.max]);
        } else {
            throw new Error("No context provided.");
        }
    }

    getAABB(): FisiksAxisAlignedBoundingBox {
        let max: Fisiks2DVector = new Fisiks2DVector(Number.MIN_VALUE, Number.MIN_VALUE); 
        let min: Fisiks2DVector = new Fisiks2DVector(Number.MAX_VALUE, Number.MAX_VALUE);

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

    CreateBoxVertices(width: number, height: number): Fisiks2DVector[]{
        let vertices: Fisiks2DVector[] = [];
        
        let left: number = this.getPosition().x;
        let right: number = this.getPosition().x + width;
        let bottom: number = this.getPosition().y + height;
        let top: number = this.getPosition().y;

        vertices[0] = new Fisiks2DVector(left, top);
        vertices[1] = new Fisiks2DVector(right, top);
        vertices[2] = new Fisiks2DVector(right, bottom);
        vertices[3] = new Fisiks2DVector(left, bottom);

        return vertices;
    }

    GetTranformedVertices(): Fisiks2DVector[] {
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex: Fisiks2DVector = this.vertices[i];
            const transform: FisiksTransform = new FisiksTransform(this.getCenter(), this.getAngle());
            const rotatedVertex = Fisiks2DVector.Transform(vertex, transform);
            
            this.transformedVertices[i] = rotatedVertex;
        }
    
        return this.transformedVertices;
    }

    override MoveTo(position: Fisiks2DVector){
        this.setPosition(position);
        
        const newCenter = new Fisiks2DVector(position.x + this.width/2, position.y + this.height/2);
        this.setCenter(newCenter);

        this.vertices = this.CreateBoxVertices(this.width, this.height)
    }

    override Move(amount: Fisiks2DVector) {
        const newPosition = Fisiks2DVector.Add(this.getPosition(), amount);
        this.setPosition(newPosition);

        const newCenter = Fisiks2DVector.Add(this.getCenter(), amount)
        this.setCenter(newCenter);

        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = Fisiks2DVector.Add(this.vertices[i], amount);                
        }
    }

    override Rotate(amount: number){
        this.setAngle(amount);
        
        const newVertices = this.GetTranformedVertices();
        this.vertices = newVertices;
        
        this.setAngle(0);
    }

    override Step(time: number, gravity: Fisiks2DVector): void {
        if (this.getStatic()) return; // No afecta cuerpos estáticos
        if (this.getMass() === 0) return; // No afecta cuerpos sin masa
    
        const gravityEffect = Fisiks2DVector.ScalarMultiplication(time, gravity);
        const newLinearVelocity = Fisiks2DVector.Add(this.getLinearVelocity(), gravityEffect);
        this.setLinearVelocity(newLinearVelocity);
    
        const newPosition = Fisiks2DVector.Add(this.getPosition(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
        this.setPosition(newPosition);
    
        const newCenter = Fisiks2DVector.Add(this.getCenter(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
        this.setCenter(newCenter);
    
        const newAngle = this.getAngle() + this.getAngularVelocity() * time;
        this.setAngle(newAngle);
    
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = Fisiks2DVector.Add(this.vertices[i], Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
        }
    
        this.setForce(Fisiks2DVector.Zero);
    }
    
}