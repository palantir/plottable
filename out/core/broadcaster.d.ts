/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Broadcaster extends PlottableObject {
        private listener2Callback;
        /**
        * Registers a callback to be called when the broadcast method is called. Also takes a listener which
        * is used to support deregistering the same callback later, by passing in the same listener.
        * If there is already a callback associated with that listener, then the callback will be replaced.
        *
        * This should NOT be called directly by a Component; registerToBroadcaster should be used instead.
        *
        * @param listener The listener associated with the callback.
        * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
        * @returns {Broadcaster} this object
        */
        public registerListener(listener: any, callback: IBroadcasterCallback): Broadcaster;
        /**
        * Call all listening callbacks, optionally with arguments passed through.
        *
        * @param ...args A variable number of optional arguments
        * @returns {Broadcaster} this object
        */
        public _broadcast(...args: any[]): Broadcaster;
        /**
        * Registers deregister the callback associated with a listener.
        *
        * @param listener The listener to deregister.
        * @returns {Broadcaster} this object
        */
        public deregisterListener(listener: any): Broadcaster;
    }
}
