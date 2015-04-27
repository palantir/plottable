///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  export class ClientToSVGTranslator {
    private static TRANSLATOR_KEY = "__Plottable_ClientToSVGTranslator"
    private measureRect: SVGElement;
    private svg: SVGElement;

    public static getTranslator(elem: SVGElement): ClientToSVGTranslator {
      var svg = Utils.DOM.getBoundingSVG(elem);

      var translator: ClientToSVGTranslator = (<any> svg)[ClientToSVGTranslator.TRANSLATOR_KEY];
      if (translator == null) {
        translator = new ClientToSVGTranslator(svg);
        (<any> svg)[ClientToSVGTranslator.TRANSLATOR_KEY] = translator;
      }
      return translator;
    }

    constructor(svg: SVGElement) {
      this.svg = svg;
      this.measureRect = <SVGElement> <any>document.createElementNS(svg.namespaceURI, "rect");
      this.measureRect.setAttribute("class", "measure-rect");
      this.measureRect.setAttribute("style", "opacity: 0; visibility: hidden;");
      this.measureRect.setAttribute("width", "1");
      this.measureRect.setAttribute("height", "1");
      this.svg.appendChild(this.measureRect);
    }

    /**
     * Computes the position relative to the <svg> in svg-coordinate-space.
     */
    public computePosition(clientX: number, clientY: number): Point {
      // get the origin
      this.measureRect.setAttribute("x", "0");
      this.measureRect.setAttribute("y", "0");
      var mrBCR = this.measureRect.getBoundingClientRect();
      var origin = { x: mrBCR.left, y: mrBCR.top };

      // calculate the scale
      var sampleDistance = 100;
      this.measureRect.setAttribute("x", String(sampleDistance));
      this.measureRect.setAttribute("y", String(sampleDistance));
      mrBCR = this.measureRect.getBoundingClientRect();
      var testPoint = { x: mrBCR.left, y: mrBCR.top };

      // invalid measurements -- SVG might not be in the DOM
      if (origin.x === testPoint.x || origin.y === testPoint.y) {
        return null;
      }

      var scaleX = (testPoint.x - origin.x) / sampleDistance;
      var scaleY = (testPoint.y - origin.y) / sampleDistance;

      // get the true cursor position
      this.measureRect.setAttribute("x", String((clientX - origin.x) / scaleX));
      this.measureRect.setAttribute("y", String((clientY - origin.y) / scaleY));
      mrBCR = this.measureRect.getBoundingClientRect();
      var trueCursorPosition = { x: mrBCR.left, y: mrBCR.top };

      var scaledPosition = {
        x: (trueCursorPosition.x - origin.x) / scaleX,
        y: (trueCursorPosition.y - origin.y) / scaleY
      };

      return scaledPosition;
    }
  }
}
}
