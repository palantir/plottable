///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component() {
            _super.apply(this, arguments);
            this.interactionsToRegister = [];
            this.boxes = [];
            this.clipPathEnabled = false;
            this.broadcastersCurrentlyListeningTo = {};
            this.isTopLevelComponent = false;
            this._xOffset = 0;
            this._yOffset = 0;
            this._xAlignProportion = 0;
            this._yAlignProportion = 0;
            this.cssClasses = ["component"];
            this._isSetup = false;
            this._isAnchored = false;
        }
        /**
        * Attaches the Component as a child of a given a DOM element. Usually only directly invoked on root-level Components.
        *
        * @param {D3.Selection} element A D3 selection consisting of the element to anchor under.
        * @returns {Component} The calling component.
        */
        Component.prototype._anchor = function (element) {
            if (element.node().nodeName === "svg") {
                // svg node gets the "plottable" CSS class
                this.rootSVG = element;
                this.rootSVG.classed("plottable", true);

                // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
                this.rootSVG.style("overflow", "visible");
                this.isTopLevelComponent = true;
            }

            if (this.element != null) {
                // reattach existing element
                element.node().appendChild(this.element.node());
            } else {
                this.element = element.append("g");
                this._setup();
            }
            this._isAnchored = true;
            return this;
        };

        /**
        * Creates additional elements as necessary for the Component to function.
        * Called during _anchor() if the Component's element has not been created yet.
        * Override in subclasses to provide additional functionality.
        *
        * @returns {Component} The calling Component.
        */
        Component.prototype._setup = function () {
            var _this = this;
            this.cssClasses.forEach(function (cssClass) {
                _this.element.classed(cssClass, true);
            });
            this.cssClasses = null;

            this.backgroundContainer = this.element.append("g").classed("background-container", true);
            this.content = this.element.append("g").classed("content", true);
            this.foregroundContainer = this.element.append("g").classed("foreground-container", true);
            this.boxContainer = this.element.append("g").classed("box-container", true);

            if (this.clipPathEnabled) {
                this.generateClipPath();
            }
            ;

            this.addBox("bounding-box");

            this.interactionsToRegister.forEach(function (r) {
                return _this.registerInteraction(r);
            });
            this.interactionsToRegister = null;
            this._isSetup = true;
            return this;
        };

        Component.prototype._requestedSpace = function (availableWidth, availableHeight) {
            return { width: 0, height: 0, wantsWidth: false, wantsHeight: false };
        };

        /**
        * Computes the size, position, and alignment from the specified values.
        * If no parameters are supplied and the component is a root node,
        * they are inferred from the size of the component's element.
        *
        * @param {number} xOrigin
        * @param {number} yOrigin
        * @param {number} availableWidth
        * @param {number} availableHeight
        * @returns {Component} The calling Component.
        */
        Component.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
            var _this = this;
            if (xOrigin == null || yOrigin == null || availableWidth == null || availableHeight == null) {
                if (this.element == null) {
                    throw new Error("anchor must be called before computeLayout");
                } else if (this.isTopLevelComponent) {
                    // we are the root node, retrieve height/width from root SVG
                    xOrigin = 0;
                    yOrigin = 0;

                    // Set width/height to 100% if not specified, to allow accurate size calculation
                    // see http://www.w3.org/TR/CSS21/visudet.html#block-replaced-width
                    // and http://www.w3.org/TR/CSS21/visudet.html#inline-replaced-height
                    if (this.rootSVG.attr("width") == null) {
                        this.rootSVG.attr("width", "100%");
                    }
                    if (this.rootSVG.attr("height") == null) {
                        this.rootSVG.attr("height", "100%");
                    }

                    var elem = this.rootSVG.node();
                    availableWidth = Plottable.DOMUtils.getElementWidth(elem);
                    availableHeight = Plottable.DOMUtils.getElementHeight(elem);
                } else {
                    throw new Error("null arguments cannot be passed to _computeLayout() on a non-root node");
                }
            }
            this.xOrigin = xOrigin;
            this.yOrigin = yOrigin;
            var xPosition = this.xOrigin;
            var yPosition = this.yOrigin;

            var requestedSpace = this._requestedSpace(availableWidth, availableHeight);

            xPosition += (availableWidth - requestedSpace.width) * this._xAlignProportion;
            xPosition += this._xOffset;
            if (this._isFixedWidth()) {
                // Decrease size so hitbox / bounding box and children are sized correctly
                availableWidth = Math.min(availableWidth, requestedSpace.width);
            }

            yPosition += (availableHeight - requestedSpace.height) * this._yAlignProportion;
            yPosition += this._yOffset;
            if (this._isFixedHeight()) {
                availableHeight = Math.min(availableHeight, requestedSpace.height);
            }

            this.availableWidth = availableWidth;
            this.availableHeight = availableHeight;
            this.element.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            this.boxes.forEach(function (b) {
                return b.attr("width", _this.availableWidth).attr("height", _this.availableHeight);
            });
            return this;
        };

        /**
        * Renders the component.
        *
        * @returns {Component} The calling Component.
        */
        Component.prototype._render = function () {
            if (this._isAnchored && this._isSetup) {
                Plottable.RenderController.registerToRender(this);
            }
            return this;
        };

        Component.prototype._scheduleComputeLayout = function () {
            if (this._isAnchored && this._isSetup) {
                Plottable.RenderController.registerToComputeLayout(this);
            }
            return this;
        };

        Component.prototype._doRender = function () {
            return this;
        };

        Component.prototype._invalidateLayout = function () {
            if (this._isAnchored && this._isSetup) {
                if (this.isTopLevelComponent) {
                    this._scheduleComputeLayout();
                } else {
                    this._parent._invalidateLayout();
                }
            }
        };

        /**
        * Renders the Component into a given DOM element.
        *
        * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
        * @return {Component} The calling component.
        */
        Component.prototype.renderTo = function (element) {
            if (element != null) {
                var selection;
                if (typeof (element.node) === "function") {
                    selection = element;
                } else {
                    selection = d3.select(element);
                }
                this._anchor(selection);
            }
            this._computeLayout()._render();
            return this;
        };

        /**
        * Cause the Component to recompute layout and redraw. If passed arguments, will resize the root SVG it lives in.
        *
        * @param {number} [availableWidth]  - the width of the container element
        * @param {number} [availableHeight] - the height of the container element
        */
        Component.prototype.resize = function (width, height) {
            if (!this.isTopLevelComponent) {
                throw new Error("Cannot resize on non top-level component");
            }
            if (width != null && height != null && this._isAnchored) {
                this.rootSVG.attr({ width: width, height: height });
            }
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the x alignment of the Component.
        *
        * @param {string} alignment The x alignment of the Component (one of LEFT/CENTER/RIGHT).
        * @returns {Component} The calling Component.
        */
        Component.prototype.xAlign = function (alignment) {
            alignment = alignment.toLowerCase();
            if (alignment === "left") {
                this._xAlignProportion = 0;
            } else if (alignment === "center") {
                this._xAlignProportion = 0.5;
            } else if (alignment === "right") {
                this._xAlignProportion = 1;
            } else {
                throw new Error("Unsupported alignment");
            }
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the y alignment of the Component.
        *
        * @param {string} alignment The y alignment of the Component (one of TOP/CENTER/BOTTOM).
        * @returns {Component} The calling Component.
        */
        Component.prototype.yAlign = function (alignment) {
            alignment = alignment.toLowerCase();
            if (alignment === "top") {
                this._yAlignProportion = 0;
            } else if (alignment === "center") {
                this._yAlignProportion = 0.5;
            } else if (alignment === "bottom") {
                this._yAlignProportion = 1;
            } else {
                throw new Error("Unsupported alignment");
            }
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the x offset of the Component.
        *
        * @param {number} offset The desired x offset, in pixels.
        * @returns {Component} The calling Component.
        */
        Component.prototype.xOffset = function (offset) {
            this._xOffset = offset;
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the y offset of the Component.
        *
        * @param {number} offset The desired y offset, in pixels.
        * @returns {Component} The calling Component.
        */
        Component.prototype.yOffset = function (offset) {
            this._yOffset = offset;
            this._invalidateLayout();
            return this;
        };

        Component.prototype.addBox = function (className, parentElement) {
            if (this.element == null) {
                throw new Error("Adding boxes before anchoring is currently disallowed");
            }
            var parentElement = parentElement == null ? this.boxContainer : parentElement;
            var box = parentElement.append("rect");
            if (className != null) {
                box.classed(className, true);
            }
            ;
            this.boxes.push(box);
            if (this.availableWidth != null && this.availableHeight != null) {
                box.attr("width", this.availableWidth).attr("height", this.availableHeight);
            }
            return box;
        };

        Component.prototype.generateClipPath = function () {
            // The clip path will prevent content from overflowing its component space.
            this.element.attr("clip-path", "url(#clipPath" + this._plottableID + ")");
            var clipPathParent = this.boxContainer.append("clipPath").attr("id", "clipPath" + this._plottableID);
            this.addBox("clip-rect", clipPathParent);
        };

        /**
        * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
        *
        * @param {Interaction} interaction The Interaction to attach to the Component.
        * @return {Component} The calling Component.
        */
        Component.prototype.registerInteraction = function (interaction) {
            // Interactions can be registered before or after anchoring. If registered before, they are
            // pushed to this.interactionsToRegister and registered during anchoring. If after, they are
            // registered immediately
            if (this.element != null) {
                if (this.hitBox == null) {
                    this.hitBox = this.addBox("hit-box");
                    this.hitBox.style("fill", "#ffffff").style("opacity", 0); // We need to set these so Chrome will register events
                }
                interaction._anchor(this.hitBox);
            } else {
                this.interactionsToRegister.push(interaction);
            }
            return this;
        };

        Component.prototype._registerToBroadcaster = function (broadcaster, callback) {
            broadcaster.registerListener(this, callback);
            this.broadcastersCurrentlyListeningTo[broadcaster._plottableID] = broadcaster;
        };

        Component.prototype._deregisterFromBroadcaster = function (broadcaster) {
            broadcaster.deregisterListener(this);
            delete this.broadcastersCurrentlyListeningTo[broadcaster._plottableID];
        };

        Component.prototype.classed = function (cssClass, addClass) {
            if (addClass == null) {
                if (cssClass == null) {
                    return false;
                } else if (this.element == null) {
                    return (this.cssClasses.indexOf(cssClass) !== -1);
                } else {
                    return this.element.classed(cssClass);
                }
            } else {
                if (cssClass == null) {
                    return this;
                }
                if (this.element == null) {
                    var classIndex = this.cssClasses.indexOf(cssClass);
                    if (addClass && classIndex === -1) {
                        this.cssClasses.push(cssClass);
                    } else if (!addClass && classIndex !== -1) {
                        this.cssClasses.splice(classIndex, 1);
                    }
                } else {
                    this.element.classed(cssClass, addClass);
                }
                return this;
            }
        };

        /**
        * Checks if the Component has a fixed width or false if it grows to fill available space.
        * Returns false by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed width.
        */
        Component.prototype._isFixedWidth = function () {
            // If you are given -1 pixels and you're happy, clearly you are not fixed size. If you want more, then there is
            // some fixed size you aspire to.
            // Putting 0 doesn't work because sometimes a fixed-size component will still have dimension 0
            // For example a label with an empty string.
            return this._requestedSpace(-1, -1).wantsWidth;
        };

        /**
        * Checks if the Component has a fixed height or false if it grows to fill available space.
        * Returns false by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed height.
        */
        Component.prototype._isFixedHeight = function () {
            return this._requestedSpace(-1, -1).wantsHeight;
        };

        /**
        * Merges this Component with another Component, returning a ComponentGroup.
        * There are four cases:
        * Component + Component: Returns a ComponentGroup with both components inside it.
        * ComponentGroup + Component: Returns the ComponentGroup with the Component appended.
        * Component + ComponentGroup: Returns the ComponentGroup with the Component prepended.
        * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with two ComponentGroups inside it.
        *
        * @param {Component} c The component to merge in.
        * @return {ComponentGroup}
        */
        Component.prototype.merge = function (c) {
            var cg;
            if (this._isSetup || this._isAnchored) {
                throw new Error("Can't presently merge a component that's already been anchored");
            }
            if (Plottable.ComponentGroup.prototype.isPrototypeOf(c)) {
                cg = c;
                cg._addComponent(this, true);
                return cg;
            } else {
                cg = new Plottable.ComponentGroup([this, c]);
                return cg;
            }
        };

        /**
        * Removes a Component from the DOM.
        */
        Component.prototype.remove = function () {
            if (this._isAnchored) {
                this.element.remove();
            }
            if (this._parent != null) {
                this._parent._removeComponent(this);
            }
            this._isAnchored = false;
            this._parent = null;
            return this;
        };
        return Component;
    })(Plottable.PlottableObject);
    Plottable.Component = Component;
})(Plottable || (Plottable = {}));
