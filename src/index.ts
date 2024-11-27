import { FisiksDisplay } from "./FisiksDisplay"; 
import { getFisiksBodyList } from "./helpers/mocks";

const display = new FisiksDisplay(500, 500);

document.body.appendChild(display.getCanvas());
const ctx = display.getContext();

const mockFisiksBody = getFisiksBodyList(ctx, 10);

for (const body of mockFisiksBody) {
    display.addBody(body)
}

display.startGameLoop();