import * as Plottable from "../../plottable-npm";

const primaryData = [
    { x: 1, y: 1 },
    { x: 2, y: 3 },
    { x: 3, y: 2 },
    { x: 4, y: 4 },
    { x: 5, y: 3 },
    { x: 6, y: 5 }
];

const secondaryData = [
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: 3, y: 2 },
    { x: 4, y: 1 },
    { x: 5, y: 2 },
    { x: 6, y: 1 }
];

function buildBasicBar() {
    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Linear();
    return new Plottable.Plots.ClusteredBar()
        .addDataset(new Plottable.Dataset(primaryData))
        .x(((d) => d.x), xScale)
        .y(((d) => d.y), yScale)
}

function buildClusteredBar() {
    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Linear();
    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(["#BDCEF0", "#5279C7"]);

    return new Plottable.Plots.ClusteredBar()
        .addDataset(new Plottable.Dataset(primaryData).metadata(5))
        .addDataset(new Plottable.Dataset(secondaryData).metadata(3))
        .x(((d) => d.x), xScale)
        .y(((d) => d.y), yScale)
        .attr("fill", ((d, i, dataset) => dataset.metadata()), colorScale);
}

export const route = "bars";
export const title = "Bars";
export function render(el: HTMLElement) {
    // Render template
    const root = document.createElement("div");
    root.innerHTML = `
        <h3>Basic Bar Chart</h3>
        <div class="chart-block">
            <svg width="600" height="200" class="basic-bar"></svg>
        </div>

        <h3>Clustered Bar Chart</h3>
        <div  class="chart-block">
            <svg width="600" height="200" class="clustered-bar"></svg>
        </div>
    `;
    el.appendChild(root);

    // Build charts
    buildBasicBar().renderTo(root.querySelector("svg.basic-bar"));
    buildClusteredBar().renderTo(root.querySelector("svg.clustered-bar"));
};
