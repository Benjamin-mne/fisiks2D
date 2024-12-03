import { Fisiks2DVector } from "./Fisiks2DVector";

export enum ShapeType { Box, Circle};  

export class FisiksShape {
    public static DrawCircle(context: CanvasRenderingContext2D, position: Fisiks2DVector, color: string, radius: number): void{
        context.beginPath();
        context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();    
    }

    public static DrawBox(context: CanvasRenderingContext2D, position: Fisiks2DVector, color: string, width: number, height: number): void{
        context.beginPath();
        context.rect(position.x, position.y, width, height);
        context.fillStyle = color;
        context.fill();
    }

    public static DrawVertices(context: CanvasRenderingContext2D, vertices: Fisiks2DVector[], color: string){
        for (const vertex of vertices) {
            context.beginPath();
            context.arc(vertex.x, vertex.y, 3, 0, 2 * Math.PI);
            context.fillStyle = color;
            context.fill();  
        }
    }

    public static DrawPolygon(context: CanvasRenderingContext2D, vertices: Fisiks2DVector[], color: string ): void {
        
        if (vertices.length < 3) {
            throw new Error("A polygon needs at least three vertices.");
        }
    
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
    
        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }
    
        context.closePath();
        context.fillStyle = color;
        context.fill();
    }
}