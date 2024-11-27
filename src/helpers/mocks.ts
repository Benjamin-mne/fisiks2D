import { Fisiks2DVector } from "../Fisiks2DVector";
import { FisiksBody } from "../FisiksBody";
import { ShapeType } from "../FisiksShape";

/**
 * Genera un color aleatorio en formato hexadecimal.
 */
function getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Genera un valor aleatorio entre un rango dado.
 */
function getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Genera un cuerpo aleatorio de tipo círculo.
 */
function generateRandomCircle(ctx: CanvasRenderingContext2D): FisiksBody {
    return new FisiksBody({
        context: ctx,
        position: new Fisiks2DVector(
            getRandomInRange(50, 450), // Posición aleatoria en X
            getRandomInRange(50, 500)  // Posición aleatoria en Y
        ),
        color: getRandomColor(),
        shape: ShapeType.Circle,
        radius: getRandomInRange(10, 50), // Radio aleatorio
    });
}

/**
 * Genera un cuerpo aleatorio de tipo caja.
 */
function generateRandomBox(ctx: CanvasRenderingContext2D): FisiksBody {
    return new FisiksBody({
        context: ctx,
        position: new Fisiks2DVector(
            getRandomInRange(50, 450), // Posición aleatoria en X
            getRandomInRange(50, 450)  // Posición aleatoria en Y
        ),
        color: getRandomColor(),
        shape: ShapeType.Box,
        width: getRandomInRange(20, 100), // Ancho aleatorio
        height: getRandomInRange(20, 100), // Altura aleatoria
    });
}

/**
 * Genera una lista de cuerpos FisiksBody aleatorios.
 */
export function getFisiksBodyList(ctx: CanvasRenderingContext2D, quantity: number): FisiksBody[] {
    const bodies: FisiksBody[] = [];

    for (let i = 0; i < quantity; i++) {
        if (i % 2 === 0) {
            bodies.push(generateRandomCircle(ctx));
        } else {
            bodies.push(generateRandomBox(ctx));
        }
    }

    return bodies;
}
