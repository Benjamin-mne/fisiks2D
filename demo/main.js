import { Fisiks2DVector, FisiksBody, FisiksDisplay, ShapeType, FisiksBodyObserver } from "../dist/bundle.js"; 
import { getRandomColor, getRandomInRange } from "./helpers/mocks.js";

const display = new FisiksDisplay(800, 500);

document.body.appendChild(display.GetCanvas());
const ctx = display.GetContext();

const floor = new FisiksBody({
    context: ctx,
    width: display.GetCanvas().width + 100,
    height: 30,
    position: new Fisiks2DVector(-50, display.GetCanvas().height - 30),
    color: 'white',
    shape: ShapeType.Box,
    isStatic: true    
});

display.AddBody(floor);
display.SetGravity(new Fisiks2DVector(0, 100 * 9.8))


display.RegisterBehavior((body) => {
    let offSetX = 0;
    let offSetY = 0;

    if (body.shape === ShapeType.Circle) {
        offSetX = body.radius;
        offSetY = body.radius;
    }

    if (body.shape === ShapeType.Box) {
        offSetX = body.width / 2;
        offSetY = body.height / 2;
    }

    const positionX = body.position.x;
    const positionY = body.position.y;

    if (positionX  + offSetX < 0 && body.linearVelocity.x < 0) {
        body.MoveTo(new Fisiks2DVector(display.width + offSetX, positionY));
    }

    if (positionX > display.width && body.linearVelocity.x > 0) {
        body.MoveTo(new Fisiks2DVector(0 - offSetX, positionY));
    }

    if (positionY + offSetY < 0 && body.linearVelocity.y < 0) {
        body.MoveTo(new Fisiks2DVector(positionX, display.height + offSetY));
    }

    if (positionY - offSetY > display.height && body.linearVelocity.y > 0) {
        body.MoveTo(new Fisiks2DVector(positionX, 0 - offSetY));
    }
});

display.RegisterBehavior((body) => {
    body.ApplyForce(new Fisiks2DVector(0, body.mass));
})

display.addObserver(new FisiksBodyObserver());

display.GetCanvas().addEventListener('click', (e) => {
    const position = new Fisiks2DVector(e.x, e.y);

    const body = new FisiksBody({
        context: ctx,
        position,
        color: getRandomColor(),
        shape: ShapeType.Circle,
        radius: getRandomInRange(10, 50),
        controllable: display.bodyList.length > 1 ? false : true,
    });

    display.AddBody(body);
})

display.StartGameLoop();
