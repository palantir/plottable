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

function buildStackedBar() {
    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Linear();
    const colorScale = new Plottable.Scales.Color()
        .autoDomain()
        .range(["#5279C7", "#BDCEF0"]);

    const datasets = [
        new Plottable.Dataset(primaryData).metadata({scale: 1, label: "SERIES A"}),
        new Plottable.Dataset(secondaryData).metadata({scale: 10, label: "SERIES B"}),
    ]

    const legend = new Plottable.Components.Legend(colorScale);

    const barSort1 = new Plottable.Plots.StackedBar()
        .addDataset(datasets[0])
        .addDataset(datasets[1])
        .stackingOrder("bottomup")
        .x(((d) => d.x), xScale)
        .y(((d, i, dataset) => d.y * dataset.metadata().scale), yScale)
        .attr("fill", ((d, i, dataset) => dataset.metadata().label), colorScale);

    const barSort2 = new Plottable.Plots.StackedBar()
        .addDataset(datasets[0])
        .addDataset(datasets[1])
        .stackingOrder("topdown")
        .x(((d) => d.x), xScale)
        .y(((d, i, dataset) => d.y * dataset.metadata().scale), yScale)
        .attr("fill", ((d, i, dataset) => dataset.metadata().label), colorScale);

    return new Plottable.Components.Table([
        [barSort1, barSort2, legend]
    ]);
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

        <h3>Stacked Bar Chart</h3>
        <div class="chart-block">
            <svg width="600" height="200" class="stacked-bar"></svg>
        </div>
    `;
    el.appendChild(root);

    // Build charts
    buildBasicBar().renderTo(root.querySelector("svg.basic-bar"));
    buildClusteredBar().renderTo(root.querySelector("svg.clustered-bar"));
    buildStackedBar().renderTo(root.querySelector("svg.stacked-bar"));
};
