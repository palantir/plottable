
import { Router, IDemoRoute } from "./router";

import * as DefaultDemo from "./demos/default";
import * as BarsDemo from "./demos/bars";
import * as LinesDemo from "./demos/lines";

const router = new Router();
router.register([
    DefaultDemo,
    BarsDemo,
    LinesDemo,
]);
router.start();

const nav = document.querySelector("#nav");
Object.getOwnPropertyNames(router.routes).forEach((hashRoute: string) => {
    const demo = router.routes[hashRoute];
    const el = document.createElement("a");
    el.classList.add("nav-item")
    el.setAttribute("href", `#${demo.route}`);
    el.innerText = demo.title;
    nav.appendChild(el);
});

