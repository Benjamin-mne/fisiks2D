import { Fisiks2DVector, FisiksBodyBox, FisiksBodyCircle, FisiksDisplay } from "./bundle.js"; 

const display = new FisiksDisplay(800, 500);
const $canvas = display.GetCanvas();

$canvas.setAttribute('style', 'display: flex; justify-self: center; margin: 20px');
document.body.appendChild($canvas);

const ctx = display.GetContext();

function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function getRandomInRange(min, max){
    return Math.random() * (max - min) + min;
}

const floor = new FisiksBodyBox(
    ctx,
    new Fisiks2DVector(-150, display.GetCanvas().height - 30), 
    display.GetCanvas().width + 300, 
    30
);
floor.setStatic(true); 

const ramp = new FisiksBodyBox(
    ctx, 
    new Fisiks2DVector(50, 150), 
    300, 
    15
);
ramp.setStatic(true); 
ramp.Rotate(Math.PI / 8)

const circle = new FisiksBodyCircle(
    ctx,
    new Fisiks2DVector(600, 300),
    100
)
circle.setStatic(true);

display.AddBody(floor);
display.AddBody(ramp);
display.AddBody(circle)

/*
display.setShowVertices(true);
display.setShowAABB(true);
*/

display.SetGravity(new Fisiks2DVector(0, 9.8 * 100));

display.RegisterBehavior((body) => {
    if(body.getStatic()) return

    let offsetX = 0; 
    let offsetY = 0;

    if (body instanceof FisiksBodyCircle) {
        offsetX = body.getRadius();
        offsetY = body.getRadius();
    } else if (body instanceof FisiksBodyBox) {
        offsetX = body.getWidth() / 2;
        offsetY = body.getHeight() / 2;
    }

    const { x: posX, y: posY } = body.getPosition();

    if (posX + offsetX < 0) {
        body.setPosition(new Fisiks2DVector(display.width + offsetX, posY));
    } else if (posX - offsetX > display.width) {
        body.setPosition(new Fisiks2DVector(-offsetX, posY));
    }

    if (posY + offsetY < 0) {
        body.setPosition(new Fisiks2DVector(posX, display.height + offsetY));
    } else if (posY - offsetY > display.height) {
        body.setPosition(new Fisiks2DVector(posX, -offsetY));
    }
});

let mouse = { x: 0, y: 0 };

document.addEventListener('DOMContentLoaded', () => {
    const rect = display.GetCanvas().getBoundingClientRect();
    mouse.x = rect.width / 2;
    mouse.y = rect.height / 2;

    display.GetCanvas().dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + mouse.x,
        clientY: rect.top + mouse.y,
    }));
});

display.GetCanvas().addEventListener('mousemove', (e) => {
    const rect = display.GetCanvas().getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

document.addEventListener('keydown', (e) => {
    const position = new Fisiks2DVector(mouse.x, mouse.y);

    if (e.key === 'a') {
        const circle = new FisiksBodyCircle(
            ctx,
            position,
            getRandomInRange(10, 50)
        );

        circle.setColor(getRandomColor())

        display.AddBody(circle);

    } else if (e.key === 's') {
        const box = new FisiksBodyBox(
            ctx,
            position,
            getRandomInRange(10, 50),
            getRandomInRange(10, 50)
        );
        box.setColor(getRandomColor())

        display.AddBody(box);
    }
});

display.StartGameLoop();
