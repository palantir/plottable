var wheelData = [
    { x: "Otter", y: "Stacking", value: 9 },
    { x: "Otter", y: "Swimming", value: 8 },
    { x: "Otter", y: "Plotting", value: 10 },
    { x: "Stoat", y: "Stacking", value: 3 },
    { x: "Stoat", y: "Swimming", value: 1 },
    { x: "Stoat", y: "Plotting", value: 2 },
    { x: "Mink",  y: "Stacking", value: 4 },
    { x: "Mink",  y: "Swimming", value: 5 },
    { x: "Mink",  y: "Plotting", value: 6 },
    { x: "Mink",  y: "Scheming", value: 11}];

function makeWheelPlot() {
    // Scales
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Ordinal();
    var colorScale = new Plottable.Scale.InterpolatedColor();

    var wheelPlot = new Plottable.Plot.Wheel(xScale, yScale, colorScale).addDataset(wheelData);
    wheelPlot.renderTo("#wheel-plot");
}
