export interface IPlottableElement<D extends Element> {
    appendChild(newChild: Node): Node;
    getBoundingClientRect(): ClientRect;
    setAttribute(name: string, value: string): this;
    left(position: number): this;
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

export class PlottableHTMLElement extends PlottableElement<HTMLElement> {
  public left(position: number) {
    this._element.style.left = `${position}px`;
    return this;
  }

  public top(position: number) {
    this._element.style.top = `${position}px`;
    return this;
  }
}

export class PlottableSVGElement extends PlottableElement<SVGElement> {
  public left(position: number) {
    this.setAttribute("x", String(position));
    return this;
  }

  public top(position: number) {
    this.setAttribute("y", String(position));
    return this;
  }
}