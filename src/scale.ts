///<reference path="../lib/d3.d.ts" />

class Scale {
  public scale: D3.Scale.Scale;

  constructor(scale: D3.Scale.Scale) {
    this.scale = scale;
  }

  public (value: any): any {
    return this.scale(value);
  }

  public domain(): any[];
  public domain(values: any[]): Scale;
  public domain(values?: any[]): any {
    if (values != null) {
      return this.scale.domain(values);
    } else {
      return this.scale.domain();
    }
  }

  public range(): any[];
  public range(values: any[]): Scale;
  public range(values?: any[]): any {
    if (values != null) {
      return this.scale.range(values);
    } else {
      return this.scale.range();
    }
  }

  public copy(): Scale {
    return new Scale(this.scale.copy());
  }

  public widenDomain(newDomain: number[]) {
    var currentDomain = this.domain();
    var wideDomain = [Math.min(newDomain[0], currentDomain[0]), Math.max(newDomain[1], currentDomain[1])];
    this.domain(wideDomain);
  }

}

class QuantitiveScale extends Scale {
  public scale: D3.Scale.QuantitiveScale;
  constructor(scale: D3.Scale.QuantitiveScale) {
    super(scale);
  }

  public invert(value: number) {
    return this.scale.invert(value);
  }

}

class LinearScale extends QuantitiveScale {
  constructor() {
    super(d3.scale.linear());
    this.domain([Infinity, -Infinity]);
  }
}
