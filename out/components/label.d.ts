/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Label extends Component {
        private textElement;
        private text;
        private orientation;
        private textLength;
        private textHeight;
        /**
        * Creates a Label.
        *
        * @constructor
        * @param {string} [text] The text of the Label.
        * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
        */
        constructor(text?: string, orientation?: string);
        public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
        public _setup(): Label;
        /**
        * Sets the text on the Label.
        *
        * @param {string} text The new text for the Label.
        * @returns {Label} The calling Label.
        */
        public setText(text: string): Label;
        private measureAndSetTextSize();
        private truncateTextAndRemeasure(availableLength);
        public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Label;
    }
    class TitleLabel extends Label {
        constructor(text?: string, orientation?: string);
    }
    class AxisLabel extends Label {
        constructor(text?: string, orientation?: string);
    }
}
