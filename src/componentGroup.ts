///<reference path="reference.ts" />

class ComponentGroup extends Component {
  private components: Component[];

  constructor(components: Component[]){
    super();
    this.components = components;
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.components.forEach((c) => c.anchor(this.element.append("g")));
    return this;
  }

  public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight? : number){
    super.computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
    this.components.forEach((c) => {
      c.computeLayout(this.xOrigin, this.yOrigin, this.availableWidth, this.availableHeight);
    });
    return this;
  }

  public render() {
    super.render();
    this.components.forEach((c) => c.render());
    return this;
  }
}
