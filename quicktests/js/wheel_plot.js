var wheelData = [
    { r: "Otter", s: "Stacking", value: 9 },
    { r: "Otter", s: "Swimming", value: 8 },
    { r: "Otter", s: "Plotting", value: 10 },
    { r: "Stoat", s: "Stacking", value: 3 },
    { r: "Stoat", s: "Swimming", value: 1 },
    { r: "Stoat", s: "Plotting", value: 2 },
    { r: "Mink",  s: "Stacking", value: 4 },
    { r: "Mink",  s: "Swimming", value: 5 },
    { r: "Mink",  s: "Plotting", value: 6 },
    { r: "Fox",   s: "Stacking", value: 11}];

function makeWheelPlot() {
    // Scales
    var ringAccessor = function(d) { return d.r };
    var sliceAccessor = function (d) { return d.s };
    var valueAccessor = function (d) { return d.value };

    var radialScale = new Plottable.Scale.Ordinal().domain(wheelData.map(ringAccessor));
    var angularScale = new Plottable.Scale.Ordinal().domain(wheelData.map(sliceAccessor));
    var colorScale = new Plottable.Scale.InterpolatedColor();

    var wheelPlot = new Plottable.Plot.Wheel(radialScale, angularScale);
    wheelPlot.project("ring", ringAccessor);
    wheelPlot.project("slice", sliceAccessor);
    wheelPlot.project("value", valueAccessor);
    wheelPlot.project("fill", "value", colorScale);

    wheelPlot.addDataset(wheelData);
    wheelPlot.renderTo("#wheel-plot");
}
