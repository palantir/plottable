/// <reference path="../reference.d.ts" />
declare module Plottable {
    class RenderController {
        private static componentsNeedingRender;
        private static componentsNeedingComputeLayout;
        private static animationRequested;
        static enabled: boolean;
        static registerToRender(c: Component): void;
        static registerToComputeLayout(c: Component): void;
        private static requestFrame();
        static flush(): void;
    }
}
