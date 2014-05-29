/// <reference path="../reference.d.ts" />
declare module Plottable {
    /**
    * An associative array that can be keyed by anything (inc objects).
    * Uses pointer equality checks which is why this works.
    * This power has a price: everything is linear time since it is actually backed by an array...
    */
    class StrictEqualityAssociativeArray {
        private keyValuePairs;
        /**
        * Set a new key/value pair in the store.
        *
        * @param {any} Key to set in the store
        * @param {any} Value to set in the store
        * @return {boolean} True if key already in store, false otherwise
        */
        public set(key: any, value: any): boolean;
        public get(key: any): any;
        public has(key: any): boolean;
        public values(): any[];
        public delete(key: any): boolean;
    }
}
