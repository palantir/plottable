///<reference path="reference.ts" />

module Utils {
  export function inRange(x: number, a: number, b: number) {
    return (Math.min(a,b) <= x && x <= Math.max(a,b));
  }

  export function getBBox(element: D3.Selection): SVGRect {
    return (<any> element.node()).getBBox();
  }
}
