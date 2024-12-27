import { Fisiks2DVector, FisiksBody, FisiksDisplay, ShapeType, FisiksBodyObserver } from "../dist/bundle.js"; 
import { getRandomColor, getRandomInRange } from "./helpers/mocks.js";

const display = new FisiksDisplay(800, 500);
document.body.appendChild(display.GetCanvas());
const ctx = display.GetContext();

const floor = new FisiksBody({
    context: ctx,
    width: display.GetCanvas().width + 300,
    height: 30,
    position: new Fisiks2DVector(-150, display.GetCanvas().height - 30),
    color: 'white',
    shape: ShapeType.Box,
    isStatic: true    
});

display.AddBody(floor);

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

display.addObserver(new FisiksBodyObserver());

display.GetCanvas().addEventListener('click', (e) => {
    const rect = display.GetCanvas().getBoundingClientRect();
    const position = new Fisiks2DVector(e.clientX - rect.left, e.clientY - rect.top);

    const body = new FisiksBody({
        context: ctx,
        position,
        color: getRandomColor(),
        shape: ShapeType.Circle,
        radius: getRandomInRange(10, 50),
        controllable: display.bodyList.length === 0, 
    });

    display.AddBody(body);
});

display.StartGameLoop();
