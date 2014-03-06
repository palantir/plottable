///<reference path="exampleReference.ts" />

module TSCDemo {

  var yScale = new LinearScale();
  var xScale = new LinearScale();
  var left = new Plottable.YAxis(yScale, "left");
  var data = makeRandomData(1000, 200);
  var lineRenderer = new LineRenderer(data, xScale, yScale);
  var bottomAxis = new Plottable.XAxis(xScale, "bottom");

  var chart = new Table()
            .addComponent(0, 0, left)
            .addComponent(0, 1, lineRenderer)
            .addComponent(1, 1, bottomAxis);

  var outerTable = new Table().addComponent(0, 0, new TitleLabel("A Chart"))
                              .addComponent(1, 0, chart);

  var svg = d3.select("#table");
  outerTable.anchor(svg);
  outerTable.computeLayout();
  outerTable.render();

}
