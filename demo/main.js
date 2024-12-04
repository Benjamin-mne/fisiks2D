import { FisiksDisplay } from "../dist/bundle.js"; 
import { getFisiksBodyList } from "./helpers/mocks.js";

const display = new FisiksDisplay(800, 500);

document.body.appendChild(display.GetCanvas());
const ctx = display.GetContext();

const mockFisiksBody = getFisiksBodyList(ctx, 10);

for (const body of mockFisiksBody) {
    display.AddBody(body)
}

display.StartGameLoop();