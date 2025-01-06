import { Fisiks2DVector, FisiksBody, FisiksDisplay, ShapeType, FisiksBodyObserver } from "../dist/bundle.js"; 
import { getRandomColor, getRandomInRange } from "./helpers/mocks.js";

const display = new FisiksDisplay(800, 500);
document.body.appendChild(display.GetCanvas());
const ctx = display.GetContext();

document.addEventListener('DOMContentLoaded', () => {
    const rect = display.GetCanvas().getBoundingClientRect();
    mouse.x = rect.width / 2;
    mouse.y = rect.height / 2;

    display.GetCanvas().dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + mouse.x,
        clientY: rect.top + mouse.y,
    }));
});


const floor = new FisiksBody({
    context: ctx,
    width: display.GetCanvas().width + 300,
    height: 30,
    position: new Fisiks2DVector(-150, display.GetCanvas().height - 30),
    color: 'white',
    shape: ShapeType.Box,
    isStatic: true    
});

const ramp = new FisiksBody({
    context: ctx,
    width:  300,
    height: 15,
    position: new Fisiks2DVector(50, 150),
    color: 'white',
    shape: ShapeType.Box,
    isStatic: true,
    rotation: Math.PI / 10
})


display.AddBody(floor);
display.AddBody(ramp);

display.SetGravity(new Fisiks2DVector(0, 9.8 * 100));

display.RegisterBehavior((body) => {
    let offSetX = 0, offSetY = 0;

    if (body.shape === ShapeType.Circle) {
        offSetX = body.radius;
        offSetY = body.radius;
    } else if (body.shape === ShapeType.Box) {
        offSetX = body.width / 2;
        offSetY = body.height / 2;
    }

    const { x: posX, y: posY } = body.position;

    if (posX + offSetX < 0) {
        body.position.x = display.width + offSetX; 
    } else if (posX - offSetX > display.width) {
        body.position.x = -offSetX; 
    }

    if (posY + offSetY < 0) {
        body.position.y = display.height + offSetY;
    } else if (posY - offSetY > display.height) {
        body.position.y = -offSetY; 
    }
});

let mouse = { x: 0, y: 0 };

display.GetCanvas().addEventListener('mousemove', (e) => {
    const rect = display.GetCanvas().getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

document.addEventListener('keydown', (e) => {
    const position = new Fisiks2DVector(mouse.x, mouse.y);

    const circle = new FisiksBody({
        context: ctx,
        position,
        color: getRandomColor(),
        shape: ShapeType.Circle,
        radius: getRandomInRange(10, 50),
    });

    const box = new FisiksBody({
        context: ctx,
        width: getRandomInRange(10, 50),
        height: getRandomInRange(10, 50),
        position: position,
        color: getRandomColor(),
        shape: ShapeType.Box,
    });

    if (e.key === 'a') {
        display.AddBody(circle);
    } else if (e.key === 's') {
        display.AddBody(box);
    }
});


display.StartGameLoop();
