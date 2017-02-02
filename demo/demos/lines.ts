import * as Plottable from "../../plottable-npm";
import { noise } from "./noise";

let timerToken: any = null;

// initialize data
let iterator = 0;
function randomDataPoint() {
    iterator += 1;
    return noise(iterator * 0.02) * 100 + noise(iterator * 0.1) * 10;
}

const data: number[] = [];
while (data.length < 1000) {
    data.push(randomDataPoint());
}

function buildRunningLine() {
    const dataset = new Plottable.Dataset(data);
    const xScale = new Plottable.Scales.Linear();
    const yScale = new Plottable.Scales.Linear();
    const plot = new Plottable.Plots.Line()
        .addDataset(dataset)
        .x(((d, i) => i), xScale)
        .y(((d) => d), yScale);

    const updatePlot = () => {
        data.shift();
        data.push(randomDataPoint());
        dataset.data(data);
    }
    timerToken = setInterval(updatePlot, 30);
    return plot;
}

export const route = "lines";
export const title = "Lines";
export function render(el: HTMLElement) {
    // Render template
    const root = document.createElement("div");
    root.innerHTML = `
        <h3>Running Line Data</h3>
        <div class="chart-block">
            <svg width="600" height="200" class="running-line"></svg>
        </div>
    `;
    el.appendChild(root);

    // Build charts
    buildRunningLine().renderTo(root.querySelector("svg.running-line"));
};
export function cleanup() {
    clearInterval(timerToken);
};