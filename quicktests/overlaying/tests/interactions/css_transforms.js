function makeData() {
  return [{x: "Frodo", y: 3}, {x: "Sam", y: 2}, {x: "Gollum", y: 4}];
}

function run(container, data) {
  "use strict";

  container
    .style("background", "#DDD")
    .style("position", "relative")
    .style("overflow", "scroll");

  const child0 = container.append("div")
    .style("top", "300px")
    .style("transform", "scale(0.5, 0.5) rotate(-15deg) translate(50px, 50px)");

  const child1 = container.append("div")
    .style("top", "20px")
    .style("left", "20px")
    .style("border", "10px solid #888")
    .style("padding", "30px 30px")

  const child2 = container.append("div")
    .style("top", "800px")
    .style("left", "200px")
    .style("transform", "scale(1, 0.5) rotate(45deg) translate(30px, 50px)");

  const child3 = container.append("div")
    .style("position", "absolute")
    .style("top", "50px")
    .style("left", "400px")
    .style("width", "300px")
    .style("height", "200px")
    .style("border", "5px solid #888")
    .style("padding", "10px 10px")
    .style("transform", "rotate(15deg)");

  const child4 = container.append("div")
    .style("position", "absolute")
    .style("top", "300px")
    .style("left", "300px")
    .style("width", "300px")
    .style("height", "200px")
    .style("border", "1px solid magenta")
    .style("transform", "rotate(-10deg)");

  debugCursor(child0, "red");
  debugCursor(child1, "lime");
  debugCursor(child2, "dodgerblue");
  debugPlot(child3);
  debugBarPlot(child4, data);
}

function debugPlot(child) {
  const defaultTitleText = "Hover over points";
  const datasetData = [{x: 0, y: 0}, {x: 100, y: 100}];
  const dataset = new Plottable.Dataset(datasetData);
  const xScale = new Plottable.Scales.Linear();
  const yScale = new Plottable.Scales.Linear();
  const xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const title = new Plottable.Components.TitleLabel(defaultTitleText);
  const plot = new Plottable.Plots.Scatter()
    .renderer("canvas")
    .addDataset(dataset)
    .size(() => 30)
    .attr("fill", () => "red")
    .x(({ x }) => x, xScale)
    .y(({ y }) => y, yScale);

  new Plottable.Interactions.Pointer()
    .onPointerMove((p) => {
      var update = datasetData.slice();
      update.push({
        x: xScale.invert(p.x),
        y: yScale.invert(p.y),
      });
      dataset.data(update);

      title.text(`[ ${p.x.toFixed(0)}, ${p.y.toFixed(0)} ]`);
    })
    .attachTo(plot);

  new Plottable.Components.Table([
    [null, title],
    [yAxis, plot],
    [null, xAxis],
  ]).renderTo(child);
}

function debugBarPlot(child, data) {
  const xScale = new Plottable.Scales.Category();
  const yScale = new Plottable.Scales.Linear();
  const xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const title = new Plottable.Components.TitleLabel("Pan Zoom");
  const plot = new Plottable.Plots.Bar()
    .renderer("canvas")
    .addDataset(new Plottable.Dataset(data))
    .attr("fill", () => "dodgerblue")
    .x(({ x }) => x, xScale)
    .y(({ y }) => y, yScale);

  new Plottable.Interactions.PanZoom(xScale, yScale)
    .attachTo(plot);

  // new Plottable.Interactions.Pointer()
  //   .onPointerMove((p) => console.log("Bar pointer", p))
  //   .attachTo(plot);

  new Plottable.Components.Table([
    [null, title],
    [yAxis, plot],
    [null, xAxis],
  ]).renderTo(child);

}

function debugCursor(child, color) {
  child
    .style("position", "absolute")
    .style("background", "#aaa")
    .style("width", "200px")
    .style("height", "200px")
    .style("overflow", "hidden");

  const debug = child.append("div")

  const cursor = child.append("div")
    .style("position", "absolute")
    .style("width", "10px")
    .style("height", "10px")
    .style("border-radius", "5px")
    .style("transform", "translate(-5px, -5px)")
    .style("background", color);

  const handleMoveEvent = ({ clientX, clientY }) => {
    const xlator = new Plottable.Utils.Translator(child.node());
    const pos = xlator.computePosition(clientX, clientY);
    debug.text(`${clientX.toFixed(0)}, ${clientY.toFixed(0)} -> ${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}`);
    cursor
      .style("left", `${pos.x}px`)
      .style("top", `${pos.y}px`);
  }
  document.addEventListener("mousemove", handleMoveEvent);
  document.addEventListener("touchmove", ({touches}) => handleMoveEvent(touches[0]));
}