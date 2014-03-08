///<reference path="exampleReference.ts" />

module TSCDemo {

  var yScale = new Plottable.LinearScale();
  var xScale = new Plottable.LinearScale();
  var left = new Plottable.YAxis(yScale, "left");
  var data = makeRandomData(25, 200);
  var lineRenderer = new Plottable.CircleRenderer(data, xScale, yScale);
  var bottomAxis = new Plottable.XAxis(xScale, "bottom");

  var chart = new Plottable.Table()
            .addComponent(0, 0, left)
            .addComponent(0, 1, lineRenderer)
            .addComponent(1, 1, bottomAxis);

  var outerTable = new Plottable.Table().addComponent(0, 0, new Plottable.TitleLabel("A Chart"))
                              .addComponent(1, 0, chart);

  var svg = d3.select("#table");
  outerTable.anchor(svg);
  outerTable.computeLayout();
  outerTable.render();

  new Plottable.CrosshairsInteraction(lineRenderer).registerWithComponent();

}
