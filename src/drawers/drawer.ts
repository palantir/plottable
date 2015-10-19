module Plottable {
export module Drawers {
  /**
   * A step for the drawer to draw.
   *
   * Specifies how AttributeToProjector needs to be animated.
   */
  export type DrawStep = {
    attrToProjector: AttributeToProjector;
    animator: Animator;
  };

  /**
   * A DrawStep that carries an AttributeToAppliedProjector map.
   */
  export type AppliedDrawStep = {
    attrToAppliedProjector: AttributeToAppliedProjector;
    animator: Animator;
  };

  /**
   * A DrawingTarget contains the selections that are the results of binding data.
   * DrawingTarget is contructed by Drawer, and passed to animators to allow animation of each selection
   */
  export type DrawingTarget = {
    enter: d3.Selection<any>|d3.Transition<any>,  // new DOM elements created from the enter() selection
    update: d3.selection.Update<any>|d3.Transition<any>, // data elements currently bound to a DOM element still in the data set
    exit: d3.Selection<any>|d3.Transition<any>,   // DOM elements bound to a datum that is no longer in the data set
    merge: d3.selection.Update<any>|d3.Transition<any>   // enter and update combined
  };
}

export class Drawer {
  private _renderArea: d3.Selection<void>;
  protected _svgElementName: string;
  protected _className: string;

  private _dataset: Dataset;

  private _drawingTarget: Drawers.DrawingTarget;
  private _initializer: () => AttributeToProjector;
  private _cachedSelectionValid = false;
  private _cachedSelection: d3.Selection<any>;

  /**
   * A Drawer draws svg elements based on the input Dataset.
   *
   * @constructor
   * @param {Dataset} dataset The dataset associated with this Drawer
   */
  constructor(dataset: Dataset) {
    this._dataset = dataset;
    this._initializer = () => <AttributeToProjector>{};
  }

  /**
   * Retrieves the renderArea selection for the Drawer.
   */
  public renderArea(): d3.Selection<void>;
  /**
   * Sets the renderArea selection for the Drawer.
   *
   * @param {d3.Selection} Selection containing the <g> to render to.
   * @returns {Drawer} The calling Drawer.
   */
  public renderArea(area: d3.Selection<void>): Drawer;
  public renderArea(area?: d3.Selection<void>): any {
    if (area == null) {
      return this._renderArea;
    }
    this._renderArea = area;
    this._cachedSelectionValid = false;
    return this;
  }

  /**
   * Retieves a function that can supply initial settings to entering elements.
   * this function is typically supplied by the plot using the Drawer
   */
  public initializer(): () => AttributeToProjector;
  /**
   * Sets the initializer function for the Drawer.
   * This function returns an AttributeToProjector that is applied
   * to the new elements appended to the enter() selection
   * Typically set from _createDrawer in the plot
   *
   * @param {() => AttributeToProjector} the function.
   * @returns {Drawer} The calling Drawer.
   */
  public initializer(fnattrToProjector: () => AttributeToProjector): Drawer;
  public initializer(fnattrToProjector?: () => AttributeToProjector): any {
    if (fnattrToProjector == null) {
      return this._initializer;
    }
    this._initializer = fnattrToProjector;
    return this;
  }

  /*
   * Return the AttrToAppliedProjector generated from the initializer
   *
   * @returns {AttrToAppliedProjector} .
   */
  public appliedInitializer() {
    return this._appliedProjectors(this.initializer()());
  }
  /**
   * Removes the Drawer and its renderArea
   */
  public remove() {
    if (this.renderArea() != null) {
      this.renderArea().remove();
    }
  }

  /**
   * Binds data to selection
   *
   * @param{any[]} data The data to be drawn
   */
  private _bindSelectionData(data: any[]) {
    // if the dataset has a key, use it when binding the data
    let dataElements: d3.selection.Update<any>;
    let selection = this.renderArea().selectAll(this.selector());
    if (this._dataset) {
      dataElements = selection.data(data, this._dataset.keyFunction());
    } else {
      dataElements = selection.data(data);
    }
    this._drawingTarget = {
      update: dataElements.filter(() => {
        return true;
      }),
      enter: null,
      exit: null,
      merge: null
    };
    this._drawingTarget.enter = dataElements.enter()
      .append(this._svgElementName)
      .attr(this.appliedInitializer());
    this._applyDefaultAttributes(<d3.Selection<any>>this._drawingTarget.enter);  // others already have it
    this._drawingTarget.exit = dataElements.exit();   // the animator becomes responsbile for reomving these
    this._drawingTarget.merge = this._cachedSelection = dataElements;   // after enter() is called, this contains new elements
    this._cachedSelectionValid = true;
  }

  protected _applyDefaultAttributes(selection: d3.Selection<any>) {
    if (this._className != null) {
      selection.classed(this._className, true);
    }
  }

  /**
   * Draws data using one step
   *
   * @param{AppliedDrawStep} step The step, how data should be drawn.
   */
  private _drawStep(step: Drawers.AppliedDrawStep) {
    let selection = this.selection();
    let colorAttributes = ["fill", "stroke"];
    colorAttributes.forEach((colorAttribute) => {
      if (step.attrToAppliedProjector[colorAttribute] != null) {
        selection.attr(colorAttribute, step.attrToAppliedProjector[colorAttribute]);
      }
    });
    step.animator.animate(selection, step.attrToAppliedProjector, this._drawingTarget, this);
    if (this._className != null) {
      selection.classed(this._className, true);
    }
  }

  private _appliedProjectors(attrToProjector: AttributeToProjector): AttributeToAppliedProjector {
    let modifiedAttrToProjector: AttributeToAppliedProjector = {};
    Object.keys(attrToProjector).forEach((attr: string) => {
      modifiedAttrToProjector[attr] =
        (datum: any, index: number) => attrToProjector[attr](datum, index, this._dataset);
    });

    return modifiedAttrToProjector;
  }

  /**
   * Calculates the total time it takes to use the input drawSteps to draw the input data
   *
   * @param {any[]} data The data that would have been drawn
   * @param {Drawers.DrawStep[]} drawSteps The DrawSteps to use
   * @returns {number} The total time it takes to draw
   */
  public totalDrawTime(data: any[], drawSteps: Drawers.DrawStep[]) {
    let delay = 0;
    drawSteps.forEach((drawStep, i) => {
      delay += drawStep.animator.totalTime(data.length);
    });

    return delay;
  }

  /**
   * Draws the data into the renderArea using the spefic steps and metadata
   *
   * @param{any[]} data The data to be drawn
   * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
   */
  public draw(data: any[], drawSteps: Drawers.DrawStep[]) {
    let appliedDrawSteps: Drawers.AppliedDrawStep[] = drawSteps.map((dr: Drawers.DrawStep) => {
      let attrToAppliedProjector = this._appliedProjectors(dr.attrToProjector);
      return {
        attrToAppliedProjector: attrToAppliedProjector,
        animator: dr.animator
      };
    });

    this._bindSelectionData(data);

    let delay = 0;
    appliedDrawSteps.forEach((drawStep, i) => {
      Utils.Window.setTimeout(() => this._drawStep(drawStep), delay);
      delay += drawStep.animator.totalTime(data.length);
    });
    return this;
  }

  public selection() {
    if (!this._cachedSelectionValid) {
      this._cachedSelection = this.renderArea().selectAll(this.selector());
      this._cachedSelectionValid = true;
    }
    return this._cachedSelection;
  }

  /**
   * Returns the CSS selector for this Drawer's visual elements.
   */
  public selector(): string {
    return this._svgElementName;
  }

  /**
   * Returns the D3 selection corresponding to the datum with the specified index.
   */
  public selectionForIndex(index: number): d3.Selection<any> {
    return d3.select(this.selection()[0][index]);
  }
}
}
