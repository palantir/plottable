///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export type HoverData = {
    data: any[];
    pixelPositions: Point[];
    selection: D3.Selection;
  }

  export interface Hoverable extends Component {
    /**
     * Called when the user first mouses over the Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     */
    hoverOverComponent(p: Point): void;
    /**
     * Called when the user mouses out of the Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     */
    hoverOutComponent(p: Point): void;
    /**
     * Returns the HoverData associated with the given position, and performs
     * any visual changes associated with hovering inside a Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     * @return {HoverData} The HoverData associated with the given position.
     */
    doHover(p: Point): HoverData;
  }

  export class Hover extends Interaction {

    private static warned = false;

    public component: Hoverable;

    private hoverOutCallback: (hoverData: HoverData) => any;
    private hoverOverCallback: (hoverData: HoverData) => any;
    private mouseDispatcher: Dispatchers.Mouse;
    private overComponent = false;
    private touchDispatcher: Dispatchers.Touch;

    constructor() {
      super();
      if (!Hover.warned) {
        Hover.warned = true;
        Utils.Methods.warn("Interaction.Hover is deprecated; use Interaction.Pointer in conjunction with getClosestPlotData() instead.");
      }
    }

    public anchor(component: Hoverable, hitBox: D3.Selection) {
      super.anchor(component, hitBox);
      this.mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> (<any> this.component).element.node());
      this.mouseDispatcher.onMouseMove("hover" + this.getID(), (p: Point) => this.handlePointerEvent(p));

      this.touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> (<any> this.component).element.node());

      this.touchDispatcher.onTouchStart("hover" + this.getID(), (ids, idToPoint) =>
                                                                   this.handlePointerEvent(idToPoint[ids[0]]));
    }

    /**
     * Retrieves the HoverData associated with the elements the user is currently hovering over.
     *
     * @return {HoverData} The data and selection corresponding to the elements
     *                     the user is currently hovering over.
     */
    public getCurrentHoverData(): HoverData {
      return this.currentHoverData;
    }

    /**
     * Attaches an callback to be called when the user mouses over an element.
     *
     * @param {(hoverData: HoverData) => any} callback The callback to be called.
     *      The callback will be passed data for newly hovered-over elements.
     * @return {Interaction.Hover} The calling Interaction.Hover.
     */
    public onHoverOver(callback: (hoverData: HoverData) => any) {
      this.hoverOverCallback = callback;
      return this;
    }

    /**
     * Attaches a callback to be called when the user mouses off of an element.
     *
     * @param {(hoverData: HoverData) => any} callback The callback to be called.
     *      The callback will be passed data from the hovered-out elements.
     * @return {Interaction.Hover} The calling Interaction.Hover.
     */
    public onHoverOut(callback: (hoverData: HoverData) => any) {
      this.hoverOutCallback = callback;
      return this;
    }

    /**
     * Returns a HoverData consisting of all data and selections in a but not in b.
     */
    private static diffHoverData(a: HoverData, b: HoverData): HoverData {
      if (a.data == null || b.data == null) {
        return a;
      }

      var diffData: any[] = [];
      var diffPoints: Point[] = [];
      var diffElements: Element[] = [];
      a.data.forEach((d: any, i: number) => {
        if (b.data.indexOf(d) === -1) {
          diffData.push(d);
          diffPoints.push(a.pixelPositions[i]);
          diffElements.push(a.selection[0][i]);
        }
      });

      if (diffData.length === 0) {
        return {
          data: null,
          pixelPositions: null,
          selection: null
        };
      }

      return {
        data: diffData,
        pixelPositions: diffPoints,
        selection: d3.selectAll(diffElements)
      };
    }

    private currentHoverData: HoverData = {
      data: null,
      pixelPositions: null,
      selection: null
    };

    private handleHoverOver(p: Point) {
      var lastHoverData = this.currentHoverData;
      var newHoverData = this.component.doHover(p);

      this.currentHoverData = newHoverData;

      var outData = Hover.diffHoverData(lastHoverData, newHoverData);
      this.safeHoverOut(outData);

      var overData = Hover.diffHoverData(newHoverData, lastHoverData);
      this.safeHoverOver(overData);
    }

    private handlePointerEvent(p: Point) {
      p = this.translateToComponentSpace(p);
      if (this.isInsideComponent(p)) {
        if (!this.overComponent) {
          this.component.hoverOverComponent(p);
        }
        this.handleHoverOver(p);
        this.overComponent = true;
      } else {
        this.component.hoverOutComponent(p);
        this.safeHoverOut(this.currentHoverData);
        this.currentHoverData = {
          data: null,
          pixelPositions: null,
          selection: null
        };
        this.overComponent = false;
      }
    }

    private safeHoverOut(outData: HoverData) {
      if (this.hoverOutCallback && outData.data) {
        this.hoverOutCallback(outData);
      }
    }

    private safeHoverOver(overData: HoverData) {
      if (this.hoverOverCallback && overData.data) {
        this.hoverOverCallback(overData);
      }
    }
  }
}
}
