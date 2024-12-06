import { Fisiks2DVector } from "../../dist/bundle.js";
import { FisiksBody } from "../../dist/bundle.js";
import { ShapeType } from "../../dist/bundle.js";


function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}


function getRandomInRange(min, max){
    return Math.random() * (max - min) + min;
}


function generateRandomCircle(ctx) {
    return new FisiksBody({
        context: ctx,
        position: new Fisiks2DVector(
            getRandomInRange(100, 700), // random position x
            getRandomInRange(100, 400)  // random position y
        ),
        color: getRandomColor(),
        shape: ShapeType.Circle,
        radius: getRandomInRange(10, 50),
    });
}

function generateRandomBox(ctx) {
    return new FisiksBody({
        context: ctx,
        position: new Fisiks2DVector(
            getRandomInRange(100, 450), //  random position x
            getRandomInRange(100, 450)  // random position y
        ),
        color: getRandomColor(),
        shape: ShapeType.Box,
        width: getRandomInRange(20, 80), // random witdh
        height: getRandomInRange(20, 80), // random heigh
    });
}


export function getFisiksBodyList(ctx, quantity) {
    const bodies = [];

    for (let i = 0; i < quantity; i++) {
        if (i % 2 === 0) {
            const body = generateRandomCircle(ctx);
            if(i === 0){
                body.controllable = true;
            }

            bodies.push(body);
        } else {
            // bodies.push(generateRandomBox(ctx));
            bodies.push(generateRandomCircle(ctx));
        }
    }

    return bodies;
}
