///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/lodash.d.ts" />
///<reference path="axis.ts" />
///<reference path="renderer.ts" />

class BasicTimeSeriesChart {
  public xScale: D3.Scale.Scale;
  public yScale: D3.Scale.Scale;

  constructor(
    public element: D3.Selection,
    public width: number,
    public height: number,
    public datasets: IDataset[]
    ) {
    var xOrientation = "bottom";
    var yOrientation = "left";
    this.xScale = d3.time.scale().range([0, this.width]);
    this.yScale = d3.scale.linear().range([0, this.height]);
    var formatter = d3.time.format("%b");
    var xAxis = new Axis(this.xScale, xOrientation, formatter);
    var yAxis = new Axis(this.yScale, yOrientation, null);
    var renderers = datasets.map((data) => {
      return new LineRenderer(data, this.xScale, this.yScale);
      })

    var renderer = renderers[0];
    var block = new CornerArrangement(null, xAxis, yAxis, null, renderer);
    var outerBlock = new MarginBlock(block);
    outerBlock.render(this.element, this.width, this.height);
  }
}

class OppAxisTimeSeriesChart {
  public xScale: D3.Scale.Scale;
  public yScale: D3.Scale.Scale;

  constructor(
    public element: D3.Selection,
    public width: number,
    public height: number,
    public datasets: IDataset[]
    ) {
    var xOrientation = "top";
    var yOrientation = "right";
    this.xScale = d3.time.scale().range([0, this.width]);
    this.yScale = d3.scale.linear().range([0, this.height]);
    var formatter = d3.time.format("%b");
    var xAxis = new Axis(this.xScale, xOrientation, formatter);
    var yAxis = new Axis(this.yScale, yOrientation, null);
    var renderers = datasets.map((data) => {
      return new LineRenderer(data, this.xScale, this.yScale);
      })

    var renderer = renderers[0];
    var block = new CornerArrangement(xAxis, null, null, yAxis, renderer);
    var outerBlock = new MarginBlock(block);
    outerBlock.render(this.element, this.width, this.height);  }
}

class QuadAxisTSC {
  public xScale: D3.Scale.Scale;
  public yScale: D3.Scale.Scale;

  constructor(
    public element: D3.Selection,
    public width: number,
    public height: number,
    public datasets: IDataset[]
    ) {
    var xOrientation = "bottom";
    var yOrientation = "left";
    this.xScale = d3.time.scale().range([0, this.width]);
    this.yScale = d3.scale.linear().range([0, this.height]);
    var formatter = d3.time.format("%b");
    var bxAxis = new Axis(this.xScale, "bottom", formatter);
    var txAxis = new Axis(this.xScale, "top", formatter);
    var lyAxis = new Axis(this.yScale, "left", null);
    var ryAxis = new Axis(this.yScale, "right", null);
    var renderers = datasets.map((data) => {
      return new LineRenderer(data, this.xScale, this.yScale);
      })

    var renderer = renderers[0];
    var block = new CornerArrangement(txAxis, bxAxis, lyAxis, ryAxis, renderer);
    var outerBlock = new MarginBlock(block);
    outerBlock.render(this.element, this.width, this.height);  }
}

class DoubleYAxisTSC {
  public xScale: D3.Scale.Scale;
  public yScale: D3.Scale.Scale;

  constructor(
    public element: D3.Selection,
    public width: number,
    public height: number,
    public datasets: IDataset[]
    ) {
    this.xScale = d3.time.scale().range([0, this.width]);
    this.yScale = d3.scale.linear().range([0, this.height]);
    var formatter = d3.time.format("%b");
    var bxAxis = new Axis(this.xScale, "bottom", formatter);
    var l1yAxis = new Axis(this.yScale, "left", null);
    var l2yAxis = new Axis(this.yScale, "left", null);
    var columnAxisBlock = new ColumnArrangement([l1yAxis, l2yAxis]);
    var ryAxis = new Axis(this.yScale, "right", null);
    var renderers = datasets.map((data) => {
      return new LineRenderer(data, this.xScale, this.yScale);
      })

    var renderer = renderers[0];
    var block = new CornerArrangement(null, bxAxis, columnAxisBlock, ryAxis, renderer);
    var outerBlock = new MarginBlock(block);
    outerBlock.render(this.element, this.width, this.height);  }
}



var fileNames = ["chicago_university.csv","new_york_central_park.csv","palo_alto.csv","sf.csv","berkeley.csv","mountain_view.csv","san_jose.csv","redwood_city.csv","sfo.csv"]
var fileName = "chicago_university.csv"
function loadDatasets(fileName: string, callback) {
  // the callback will be called with an array of IDataset objects
  fileName = "DemoData/" + fileName;
  d3.csv(fileName, (error, data) => {
    var parsedData = Utils.processCSVData(data);
    var properties = ["avg","avgh","avgl","hi","hih","hil","lo","loh","lol","precip"]
    var datasets = properties.map((p) => makeDataset(p, parsedData));
    callback(datasets);
    })
}

function makeDataset(property: string, data: IWeatherDatum[]) {
  var dates = _.pluck(data, "date");
  var datas = _.pluck(data, property);
  var outData = dates.map((d, i) => {
    return {x: d, y: datas[i]};
    })
  return {"data": outData, "seriesName": property};
}

function makeTSC(datasets: IDataset[]) {
  var svg1 = d3.select("#svg1").attr("height", 500).attr("width", 500);
  new BasicTimeSeriesChart(svg1, 500, 500, datasets);
  var svg2 = d3.select("#svg2").attr("height", 500).attr("width", 500);
  new OppAxisTimeSeriesChart(svg2, 500, 500, datasets);

  var svg3 = d3.select("#svg3").attr("height", 500).attr("width", 500);
  new QuadAxisTSC(svg3, 500, 500, datasets);

  var svg4 = d3.select("#svg4").attr("height", 500).attr("width", 500);
  new DoubleYAxisTSC(svg4, 500, 500, datasets);

  var svg5 = d3.select("#svg5").attr("height", 500).attr("width", 900);
  new DoubleYAxisTSC(svg5, 500, 900, datasets);

}

loadDatasets(fileName, makeTSC);
