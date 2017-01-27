
export interface IDemoRoute {
    route: string;
    title: string;
    render(el: HTMLElement): void;
    cleanup?(): void;
}

export class Router {
    private el: HTMLElement;
    public currentRoute: IDemoRoute;
    public routes: {[key: string]: IDemoRoute} = {};

    public start() {
        window.addEventListener("hashchange", this.route);
        window.addEventListener("load", this.route);
    }

    public register(routes: IDemoRoute[]) {
        routes.forEach((route: IDemoRoute) => {
            this.routes[route.route] = route;
        });
    }

    public route = () => {
        this.el = this.el || document.getElementById("app");
        const hashRoute = location.hash.slice(1) || "default";
        const route = this.routes[hashRoute];

        if (this.el && route && route != this.currentRoute) {
            if(this.currentRoute && this.currentRoute.cleanup) {
                this.currentRoute.cleanup();
            }
            this.currentRoute = route;
            this.el.innerHTML = "";
            route.render(this.el);
        } else {
            this.currentRoute = null;
        }
    }
}
