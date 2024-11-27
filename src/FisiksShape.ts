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
}