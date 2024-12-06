import { Fisiks2DVector, FisiksBodyController, FisiksDisplay, ShapeType } from "../dist/bundle.js"; 
import { getFisiksBodyList } from "./helpers/mocks.js";

const display = new FisiksDisplay(800, 500);

document.body.appendChild(display.GetCanvas());
const ctx = display.GetContext();

const mockFisiksBody = getFisiksBodyList(ctx, 10);

for (const body of mockFisiksBody) {
    display.AddBody(body);
}

display.StartGameLoop();

display.RegisterBehavior((body) => {
    let offSetX = 0;
    let offSetY = 0;

    if(body.shape === ShapeType.Circle){
        offSetX = body.radius;
        offSetY = body.radius;
    }

    if(body.shape === ShapeType.Box){
        offSetX = body.width / 2;
        offSetY = body.height / 2; 
    }

    if (body.rotationCenter.x - offSetX < 0) {
        body.linearVelocity.x = Math.abs(body.linearVelocity.x);
        body.MoveTo(new Fisiks2DVector(0 + offSetX, body.position.y));
    }

    if (body.rotationCenter.x + offSetX > display.width) {
        body.linearVelocity.x = -body.linearVelocity.x;
        body.MoveTo(new Fisiks2DVector(display.width - offSetX, body.position.y));
    }

    if (body.rotationCenter.y - offSetY < 0) {
        body.linearVelocity.y = Math.abs(body.linearVelocity.y);
        body.MoveTo(new Fisiks2DVector(body.position.x, 0 + offSetY));
    }

    if (body.rotationCenter.y + offSetY > display.height) {
        body.linearVelocity.y = -body.linearVelocity.y;
        body.MoveTo(new Fisiks2DVector(body.position.x, display.height - offSetY));
    }
});