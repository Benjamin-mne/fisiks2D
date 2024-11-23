import { FisiksDisplay } from "./FisiksDisplay"; 

const display = new FisiksDisplay(400, 400);

document.body.appendChild(display.getCanvas());

display.startGameLoop();