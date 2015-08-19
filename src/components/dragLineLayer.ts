///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class DragLineLayer<D> extends GuideLineLayer<D> {

    public detectionRadius(): number;
    public detectionRadius(r: number): DragLineLayer<D>;
    public detectionRadius(r?: number): any {
    }

    public enabled(): boolean;
    public enabled(enabled: boolean): DragLineLayer<D>;
    public enabled(enabled?: boolean): any {
    }
  }
}
}
