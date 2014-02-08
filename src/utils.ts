///<reference path="reference.ts" />

module Utils {
  export function inRange(x: number, a: number, b: number) {
    return (Math.min(a,b) <= x && x <= Math.max(a,b));
  }

  export function translate(element: D3.Selection, translatePair: number[]) {
    return element.attr("transform", "translate(" + translatePair + ")");
  }

  export function getTranslate(element: D3.Selection) {
    return d3.transform(element.attr("transform")).translate;
  }
  export function getBBox(element: D3.Selection): SVGRect {
    return (<any> element.node()).getBBox();
  }
}
