
class Router {
    constructor() {
        this.routes = {};
    }

    start() {
        window.addEventListener("hashchange", this.route.bind(this));
        window.addEventListener("load", this.route.bind(this));
        this.route();
    }

    register(route) {
        this.routes[route.route] = route;
    }

    route() {
        this.el = this.el || document.getElementById("app");
        const hashRoute = location.hash.slice(1) || "default";
        const route = this.routes[hashRoute];

        if (this.el && route && route != this.currentRoute) {
            this.currentRoute = route;
            this.el.innerHTML = "";
            route.render(this.el);
        } else {
            this.currentRoute = null;
        }
    }
}

const PATH_PREFIX = "quicktests/overlaying/tests/";
const PATH_SPLIT_REGEX = /(^.*?)\/([^\/]*$)/;
const ROUTER = new Router()

function loadTests() {
  d3.json("../overlaying/list_of_quicktests.json", (data) => {
    const routes = data.map((test) => test.path.replace(PATH_PREFIX, "").replace(/.js$/, ""));

    routes.forEach((path) => {
        ROUTER.register({
            route: path,
            render: () => loadQuickTest(path)
        });
    });

    ROUTER.register({
        route: "default",
        render: () => renderRouteList(routes)
    });

    ROUTER.start();
  });
}

function renderRouteList(routes) {
    routes = routes.slice();
    routes.sort();
    const links = [];
    let lastFolder = "";

    routes.forEach((route) => {
        const folder = route.replace(PATH_SPLIT_REGEX, "$1");
        if (folder !== lastFolder) {
            links.push(`<h2>${folder}</h2>`);
            lastFolder = folder;
        }

        links.push(`
            <a href="#${route}"><div class="test-link">${route}</div></a>
        `);
    });

    d3.select("#app").html(links.join("\n"));
}

function loadQuickTest(path){
    // clear app
    d3.select("#app").html("");

    d3.text(`../../${PATH_PREFIX}${path}.js`, (error, text) => {
        if (error !== null) {
            throw new Error("Error loading test: " + error);
        }

        const name = path.replace(PATH_SPLIT_REGEX, "$2");

        const closure = eval(`
            (function(){
                ${text}
                return { makeData, run };
            })();
        `);

        d3.select("#app").html(`
            <a href="#"><div>&#x3008; quicktests</div></a><br/>
            <div class="quicktest">
                <h2>${name}</h2>
                <svg width=600 height=400>
            </div>
        `)

        const svg = d3.select("#app svg");

        try {
            closure.run(svg, closure.makeData(), Plottable);
        } catch (err) {
            setTimeout(function(){ throw err; }, 0);
        }
    });
}

loadTests();
