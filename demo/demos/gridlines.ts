import * as Plottable from "../../plottable-npm";
import { noise } from "./noise";

const data = [
    {
        common: "Human",
        species: "Homo sapiens sapiens",
        diploid: 46
    },
    {
        common: "Dog",
        species: "Felis silvestris catus",
        diploid: 38
    },
    {
        common: "Cat",
        species: "Canis lupus familiaris",
        diploid: 78
    },
    {
        common: "Platypus",
        species: "Ornithorhynchus anatinus",
        diploid: 52
    },
    {
        common: "Black Mulberry",
        species: "Morus nigra",
        diploid: 308
    }
]

function buildChromosomeBarsHorizontal() {
    const xScale = new Plottable.Scales.Linear();
    const yScale = new Plottable.Scales.Category();
    const plot = new Plottable.Plots.Bar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL)
        .addDataset(new Plottable.Dataset(data))
        .x(((d) => d.diploid), xScale)
        .y(((d) => d.species), yScale);

    const grid = new Plottable.Components.Gridlines(null, yScale);
    const xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    const yAxis = new Plottable.Axes.Category(yScale, "left");
    const table = new Plottable.Components.Table([
            [yAxis, new Plottable.Components.Group([grid, plot])],
            [null, xAxis]
        ]);
    return table;
}

function buildChromosomeBarsVertical() {
    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Linear();
    const plot = new Plottable.Plots.Bar()
        .addDataset(new Plottable.Dataset(data))
        .x(((d) => d.common), xScale)
        .y(((d) => d.diploid), yScale);

    const grid = new Plottable.Components.Gridlines(xScale, null)
        .xLinePosition("after");
    const xAxis = new Plottable.Axes.Category(xScale, "bottom")
        .tickMarkPosition("after");
    const yAxis = new Plottable.Axes.Numeric(yScale, "left");
    const table = new Plottable.Components.Table([
            [yAxis, new Plottable.Components.Group([grid, plot])],
            [null, xAxis]
        ]);
    return table;
}

function buildDownsampled() {
    const randoms: number[] = [];
    while (randoms.length < 150) {
        randoms.push(noise(randoms.length * 0.5) * 100 + noise(randoms.length * 1) * 10);
    }

    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Linear();
    const plot = new Plottable.Plots.Bar()
        .addDataset(new Plottable.Dataset(randoms))
        .x(((d, i) => `${i}`), xScale)
        .y(((d) => d), yScale);

    const grid = new Plottable.Components.Gridlines(xScale, null)
        .xLinePosition("after");
    const xAxis = new Plottable.Axes.Category(xScale, "bottom")
        .tickMarkPosition("after")
        .tickLabelAngle(90);
    const table = new Plottable.Components.Table([
            [new Plottable.Components.Group([grid, plot])],
            [xAxis]
        ]);
    return table;
}

export const route = "gridlines";
export const title = "Grid Lines";
export function render(el: HTMLElement) {
    // Render template
    const root = document.createElement("div");
    root.innerHTML = `
        <h3>Diploid Chromosome Count by Species</h3>
        <p>With tick/line position "center"</p>
        <div class="chart-block">
            <svg width="600" height="200" class="diploid-horiz"></svg>
        </div>

        <h3>Diploid Chromosome Count by Animal</h3>
        <p>With tick/line position "after"</p>
        <div class="chart-block">
            <svg width="600" height="200" class="diploid-vert"></svg>
        </div>

        <h3>Random Noise</h3>
        <p>Downsampled data with tick/line position "after"</p>
        <div class="chart-block">
            <svg width="600" height="200" class="diploid-downsample"></svg>
        </div>
    `;
    el.appendChild(root);

    // Build charts
    buildChromosomeBarsHorizontal().renderTo(root.querySelector("svg.diploid-horiz"));
    buildChromosomeBarsVertical().renderTo(root.querySelector("svg.diploid-vert"));
    buildDownsampled().renderTo(root.querySelector("svg.diploid-downsample"));
};