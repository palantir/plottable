/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

export interface IPlottableElement<D extends Element> {
    /**
     * Appends node to element and returns the newly
     * created node.
     *
     * @param newChild - The Node to append to the existing element
     */
    appendChild(newChild: Node): Node;
    /**
     * Returns the bounding dimensions of the Element
     */
    getBoundingClientRect(): ClientRect;
    /**
     * Sets an attribute on the element
     *
     * @param name - the name of the attribute
     * @param value  - the value of the attribute
     */
    setAttribute(name: string, value: string): this;
    /**
     * Positions the element a certain number of pixels from the left
     * of its parent
     *
     * @param position - the distance in pixels from the left of the parent.
     */
    left(position: number): this;
    /**
     * Positions the element a certain number of pixels from the top
     * of its parent
     *
     * @param top - the distance in pixels from the top of the parent.
     */
    top(position: number): this;
}

export abstract class PlottableElement<D extends Element> implements IPlottableElement<D> {
  protected _element: D;

  constructor(element: D) {
    this._element = element;
  }

  public appendChild(newChild: Node) {
    return this._element.appendChild(newChild);
  }

  public getBoundingClientRect() {
    return this._element.getBoundingClientRect();
  }

  public setAttribute(name: string, value: string) {
    this._element.setAttribute(name, value);
    return this;
  }

  public abstract left(position: number): this;
  public abstract top(position: number): this;
}
