import { Fisiks2DVector } from "./Fisiks2DVector";
import { FisiksBody } from "./FisiksBody";

const keys: Record<string, boolean> = {
    a: false,
    s: false,
    d: false,
    w: false,
};

document.addEventListener('keydown', (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

export function FisiksBodyController(body: FisiksBody, secondsPassed: number, forceMagnitude: number = 400) {
    let dx = 0;
    let dy = 0;

    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;

    if (dx !== 0 || dy !== 0) {
        const forceDirection = Fisiks2DVector.Normalize(new Fisiks2DVector(dx, dy));
        const force = Fisiks2DVector.ScalarMultiplication(forceMagnitude, forceDirection);

        body.ApplyForce(force);
    }
}
