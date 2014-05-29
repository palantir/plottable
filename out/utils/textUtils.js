///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    (function (TextUtils) {
        /**
        * Gets a truncated version of a sting that fits in the available space, given the element in which to draw the text
        *
        * @param {string} text: The string to be truncated
        * @param {number} availableSpace: The avialable space, in pixels
        * @param {D3.Selection} element: The text element used to measure the text
        * @returns {string} text - the shortened text
        */
        function getTruncatedText(text, availableSpace, element) {
            var originalText = element.text();
            element.text(text);
            var bbox = Plottable.DOMUtils.getBBox(element);
            var textLength = bbox.width;
            if (textLength <= availableSpace) {
                element.text(originalText);
                return text;
            }
            element.text(text + "...");
            var textNode = element.node();
            var dotLength = textNode.getSubStringLength(textNode.textContent.length - 3, 3);
            if (dotLength > availableSpace) {
                element.text(originalText);
                return "";
            }

            var numChars = text.length;
            for (var i = 1; i < numChars; i++) {
                var testLength = textNode.getSubStringLength(0, i);
                if (testLength + dotLength > availableSpace) {
                    element.text(originalText);
                    return text.substr(0, i - 1).trim() + "...";
                }
            }
        }
        TextUtils.getTruncatedText = getTruncatedText;

        /**
        * Gets the height of a text element, as rendered.
        *
        * @param {D3.Selection} textElement
        * @return {number} The height of the text element, in pixels.
        */
        function getTextHeight(textElement) {
            var originalText = textElement.text();
            textElement.text("bqpdl");
            var height = Plottable.DOMUtils.getBBox(textElement).height;
            textElement.text(originalText);
            return height;
        }
        TextUtils.getTextHeight = getTextHeight;

        /**
        * Gets the width of a text element, as rendered.
        *
        * @param {D3.Selection} textElement
        * @return {number} The width of the text element, in pixels.
        */
        function getTextWidth(textElement, text) {
            var originalText = textElement.text();
            textElement.text(text);
            var width = text === "" ? 0 : Plottable.DOMUtils.getBBox(textElement).width;
            textElement.text(originalText);
            return width;
        }
        TextUtils.getTextWidth = getTextWidth;

        /**
        * Converts a string into an array of strings, all of which fit in the available space.
        *
        * @returns {string[]} The input text broken into substrings that fit in the avialable space.
        */
        function getWrappedText(text, availableWidth, availableHeight, textElement, cutoffRatio) {
            if (typeof cutoffRatio === "undefined") { cutoffRatio = 0.7; }
            var originalText = textElement.text();
            var textNode = textElement.node();

            textElement.text("-");
            var hyphenLength = textNode.getSubStringLength(0, 1);

            textElement.text(text);
            var bbox = Plottable.DOMUtils.getBBox(textElement);
            var textLength = bbox.width;
            var textHeight = bbox.height;

            var linesAvailable = Math.floor(availableHeight / textHeight);
            var numChars = text.length;

            var lines = [];
            var remainingText;

            var cutoffEnd = availableWidth - hyphenLength;
            var cutoffStart = cutoffRatio * cutoffEnd;

            var lineStartPosition = 0;
            for (var i = 1; i < numChars; i++) {
                var testLength = textNode.getSubStringLength(lineStartPosition, i - lineStartPosition);

                if (testLength > cutoffStart) {
                    var currentCharacter = text.charAt(i);
                    if (testLength > cutoffEnd) {
                        if (lines.length + 1 >= linesAvailable) {
                            remainingText = text.substring(lineStartPosition, text.length).trim();
                            lines.push(getTruncatedText(remainingText, availableWidth, textElement));
                            break;
                        }

                        // break line on the previous character to leave room for the hyphen
                        lines.push(text.substring(lineStartPosition, i - 1).trim() + "-");
                        lineStartPosition = i - 1;
                    } else if (currentCharacter === " ") {
                        if (lines.length + 1 >= linesAvailable) {
                            remainingText = text.substring(lineStartPosition, text.length).trim();
                            lines.push(getTruncatedText(remainingText, availableWidth, textElement));
                            break;
                        }

                        // break line after the current character
                        lines.push(text.substring(lineStartPosition, i + 1).trim());
                        lineStartPosition = i + 1;
                    }
                }
            }
            if (lineStartPosition < numChars && lines.length < linesAvailable) {
                lines.push(text.substring(lineStartPosition, numChars).trim());
            }

            textElement.text(originalText);
            return lines;
        }
        TextUtils.getWrappedText = getWrappedText;
    })(Plottable.TextUtils || (Plottable.TextUtils = {}));
    var TextUtils = Plottable.TextUtils;
})(Plottable || (Plottable = {}));
