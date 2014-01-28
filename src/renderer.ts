///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />
///<reference path="scale.ts" />

class Renderer extends Component {
  public renderArea: D3.Selection;
  public element: D3.Selection;
  public className: string;
  public width: number;
  public height: number;
  public scales: Scale[];

  constructor(
    public dataset: IDataset
  ) {
    super();
  }

  public transform(translate: number[], scale: number) {
    return; // no-op
  }

  public render(element: D3.Selection, width: number, height: number) {
    this.element = element;
    var bb = this.element.append("rect").attr("width", width).attr("height", height).classed("renderer-box", true);
    chai.assert.operator(width, '>=', 0, "width is >= 0");
    chai.assert.operator(height, '>=', 0, "height is >= 0");
    return; // no-op
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public generateElement(container: D3.Selection) {
    this.element = container.append("g").classed("render-area", true).classed(this.dataset.seriesName, true);
  }
}

class XYRenderer extends Renderer {
  public xScale: Scale;
  public yScale: Scale;
  constructor(dataset: IDataset, xScale: Scale, yScale: Scale) {
    super(dataset);
    this.className = "XYRenderer";
    this.xScale = xScale;
    this.yScale = yScale;
    var data = dataset.data;
    var xDomain = d3.extent(data, (d) => d.x);
    this.xScale.widenDomain(xDomain);
    var yDomain = d3.extent(data, (d) => d.y);
    this.yScale.widenDomain(yDomain);
  }

  public render(element: D3.Selection, width: number, height: number) {
    super.render(element, width, height);
    this.setDimensions(width, height);
  }

  public setDimensions(width: number, height: number) {
    super.setDimensions(width, height);
    this.xScale.range([0, width]);
    this.yScale.range([height, 0]);
  }
}



class LineRenderer extends XYRenderer {
  private line: D3.Svg.Line;

  constructor(dataset: IDataset, xScale: Scale, yScale: Scale) {
    super(dataset, xScale, yScale);
  }

  public render(element: D3.Selection, width: number, height: number) {
    super.render(element, width, height);
    this.line = d3.svg.line()
      .x((d) => this.xScale.scale(d.x))
      .y((d) => this.yScale.scale(d.y));
    this.renderArea = this.element.append("path")
      .classed("line", true)
      .classed(this.dataset.seriesName, true)
      .datum(this.dataset.data);
    this.renderArea.attr("d", this.line);
  }
}

// class CircleRenderer extends Renderer {
//   private circles: D3.Selection;

//   constructor(c,d,x,y,t) {
//     super(c,d,x,y,t);
//     this.circles = this.renderArea.selectAll("circle");
//   }

//   public render() {
//     this.circles.data(this.data).enter().append("circle")
//       .attr("cx", (d) => {return this.xScale(d.date);})
//       .attr("cy", (d) => {return this.yScale(d.y) + Math.random() * 10 - 5;})
//       .attr("r", 0.5);
//   }
// }

// class ResizingCircleRenderer extends CircleRenderer {
//   public transform(translate: number[], scale: number) {
//     console.log("xform");
//     this.renderArea.selectAll("circle").attr("r", 0.5/scale);
//   }
// }

// class RectRenderer extends Renderer {
//   private rects: D3.Selection;

//   public render() {
//     this.rects = this.renderArea.selectAll("rect");
//     this.rects.data(this.data).enter().append("rect")
//       .attr("x", (d) => {return this.xScale(d.date);})
//       .attr("y", (d) => {return this.yScale(d.y) + Math.random() * 10 - 5;})
//       .attr("width", 1)
//       .attr("height",1);
//   }
// }
