// Tweak scale here
const DATAPOINTS_PER_MINUTE = 1.0;
const MSEC_PER_YEAR = 1000 * 60 * 60 * 24 * 356.25;
const INITIAL_DOMAIN = [new Date(), new Date().valueOf() + MSEC_PER_YEAR];
const MAX_DOMAIN_EXTENT = 3 * MSEC_PER_YEAR;
const STEP = Math.floor(3.6e6 / DATAPOINTS_PER_MINUTE);

// Other constants
const MASK = 0xFFF;
const RANDOMS = Array.apply(null, Array(MASK + 1)).map(() => Math.random());
const DATA_SCALE = 1e-7;

function round(v, step) {
    return Math.floor(v/step) * step;
}

function lerp(a, b, t) {
    return a * ( 1 - t ) + b * t;
};

function noise(x) {
    const xFloor = Math.floor(x);
    const t = x - xFloor;
    const tRemapSmoothstep = t * t * ( 3 - 2 * t );
    const xMin = xFloor & MASK;
    const xMax = (xMin + 1) & MASK;

    return lerp(RANDOMS[xMin], RANDOMS[xMax], tRemapSmoothstep);
}

function makeData() {
    return [];
}

function run(div, data, Plottable) {
    "use strict";

    const pointCountLabel = div.append("div");

    // dataset
    const dataset = new Plottable.Dataset([{x: 0, y: 0}]);
    const xScale = new Plottable.Scales.Time()
        .domain(INITIAL_DOMAIN);
    const yScale = new Plottable.Scales.Linear()
        .domain([-0.2, 1.2]);

    // components
    const xAxis = new Plottable.Axes.Time(xScale, "bottom");
    const yAxis = new Plottable.Axes.Numeric(yScale, "left");
    const linePlot = new Plottable.Plots.Line()
        .addDataset(dataset)
        .renderer("canvas")
        .x((d) => d.x, xScale)
        .y((d) => d.y, yScale);
    const gridlines = new Plottable.Components.Gridlines(xScale, yScale);


    // layout components
    const plotGroup = new Plottable.Components.Group([linePlot, gridlines]);
    const table = new Plottable.Components.Table([
      [yAxis, plotGroup],
      [null,  xAxis],
    ]);

    function fakeLoadData() {
        const data = [];
        const domain = xScale.domain();
        for(let x = round(domain[0], STEP); x < domain[1]; x += STEP){
            data.push({x, y: noise(x * DATA_SCALE)});
        }
        dataset.data(data);
        pointCountLabel.text(`${data.length} Data Points`);
    }

    new Plottable.Interactions.PanZoom(xScale)
      .attachTo(plotGroup)
      .maxDomainExtent(xScale, MAX_DOMAIN_EXTENT)
      .onPanEnd(fakeLoadData)
      .onZoomEnd(fakeLoadData);
    fakeLoadData();

    table.renderTo(div);
}
