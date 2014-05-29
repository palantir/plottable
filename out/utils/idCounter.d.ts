/// <reference path="../reference.d.ts" />
declare module Plottable {
    class IDCounter {
        private counter;
        private setDefault(id);
        public increment(id: any): number;
        public decrement(id: any): number;
        public get(id: any): number;
    }
}
