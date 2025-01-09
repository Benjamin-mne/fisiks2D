import { FisiksBody } from "./FisiksBody";

export interface FisiksObserver {
    update(body: FisiksBody): void;
}

export class FisiksBodyObserver implements FisiksObserver {
    update(body: FisiksBody): void {
        /*
        if (body.isColliding) {
            console.log(`Body ${body.id} is colliding`);
        }
        */
    }
}
