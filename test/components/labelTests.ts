import * as d3 from "d3";

import { assert } from "chai";
import * as SVGTypewriter from "svg-typewriter";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Labels", () => {
  const LABEL_CLASS = "label";
  let CLOSETO_REQUIRMENT: number;
  before(() => {
    CLOSETO_REQUIRMENT = window.Pixel_CloseTo_Requirement;
    // HACKHACK #2422: use an open source web font by default for Plottable
    window.Pixel_CloseTo_Requirement = 3;
  });
  after(() => {
    window.Pixel_CloseTo_Requirement = CLOSETO_REQUIRMENT;
  });

  describe("Label", () => {
    describe("Basic Usage", () => {
      const BBOX_SELECTOR = ".bounding-box";
      let svg: SimpleSelection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
      });

      it("can update text after label is created", () => {
        const label = new Plottable.Components.Label("a");
        label.renderTo(svg);
        assert.strictEqual(label.content().select("text").text(), "a", "the text starts at the specified string");
        assert.operator(label.height(), ">", 0, "height is positive for non-empty string");
        label.text("hello world");
        label.renderTo(svg);
        assert.strictEqual(label.content().select("text").text(), "hello world", "the label text updated properly");
        assert.operator(label.height(), ">", 0, "height is positive for non-empty string");
        svg.remove();
      });

      it("can change label angle after label is created", () => {
        const label = new Plottable.Components.Label("CHANGING ORIENTATION");
        label.renderTo(svg);

        const content = label.content();
        let text = content.select("text");
        let bbox = Plottable.Utils.DOM.elementBBox(text);
        assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");

        label.angle(90);
        text = content.select("text");
        bbox = Plottable.Utils.DOM.elementBBox(text);
        TestMethods.assertBBoxInclusion((<any> label)._element.select(BBOX_SELECTOR), text);
        assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");

        svg.remove();
      });

      it("positions centered text in the middle of horizontal space", () => {
        const SVG_WIDTH = TestMethods.numAttr(svg, "width");
        const label = new Plottable.Components.Label("X").renderTo(svg);
        const textTranslate = d3.transform(label.content().select("g").attr("transform")).translate;
        const eleTranslate = d3.transform((<any> label)._element.attr("transform")).translate;
        const textWidth = Plottable.Utils.DOM.elementBBox(label.content().select("text")).width;
        const midPoint = eleTranslate[0] + textTranslate[0] + textWidth / 2;
        assert.closeTo(midPoint, SVG_WIDTH / 2, window.Pixel_CloseTo_Requirement, "label is centered");
        svg.remove();
      });

      it("truncates text that is too long to be render", () => {
        const SVG_WIDTH = TestMethods.numAttr(svg, "width");
        const label = new Plottable.Components.Label("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
        label.renderTo(svg);
        const content = label.content();
        const text = content.select("text");
        const bbox = Plottable.Utils.DOM.elementBBox(text);
        assert.strictEqual(bbox.height, label.height(), "text height === label.minimumHeight()");
        assert.operator(bbox.width, "<=", SVG_WIDTH, "the text is not wider than the SVG width");
        svg.remove();
      });

      it("truncates text to empty string if space given is too small", () => {
        svg.attr("width", 5);
        const label = new Plottable.Components.Label("Yeah, not gonna fit...");
        label.renderTo(svg);
        const text =  label.content().select("text");
        assert.strictEqual(text.text(), "", "text was truncated to empty string");
        svg.remove();
      });

      it("sets width to 0 if a label text is changed to empty string", () => {
        const label = new Plottable.Components.Label("foo");
        label.renderTo(svg);
        label.text("");
        assert.strictEqual(label.width(), 0, "width updated to 0");
        svg.remove();
      });

      it("renders left-rotated text properly", () => {
        const label = new Plottable.Components.Label("LEFT-ROTATED LABEL", -90);
        label.renderTo(svg);
        const content = label.content();
        const text = content.select("text");
        const textBBox = Plottable.Utils.DOM.elementBBox(text);
        TestMethods.assertBBoxInclusion((<any> label)._element.select(BBOX_SELECTOR), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
        svg.remove();
      });

      it("renders right-rotated text properly", () => {
        const label = new Plottable.Components.Label("RIGHT-ROTATED LABEL", 90);
        label.renderTo(svg);
        const content = label.content();
        const text = content.select("text");
        const textBBox = Plottable.Utils.DOM.elementBBox(text);
        TestMethods.assertBBoxInclusion((<any> label)._element.select(BBOX_SELECTOR), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
        svg.remove();
      });
    });

    describe("Input validation", () => {
      it("only accepts strings as input for text", () => {
        const label = new Plottable.Components.Label();
        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => label.text(<any> 23), Error,
          "Label.text() only takes strings as input", "error on inputing number");
        (<any> assert).throws(() => label.text(<any> new Date()), Error,
          "Label.text() only takes strings as input", "error on inputing Date");
        assert.doesNotThrow(() => label.text("string"), Error, "text() accepts strings");
        assert.strictEqual(label.text(null), "string", "text(null) returns text string");
      });

      it("converts angle to stay within -180 and 180", () => {
        const label360 = new Plottable.Components.Label("noScope", 360);
        assert.strictEqual(label360.angle(), 0, "angles are converted to range [-180, 180] (360 -> 0)");
        const label270 = new Plottable.Components.Label("turnRight", 270);
        assert.strictEqual(label270.angle(), -90, "angles are converted to range [-180, 180] (270 -> -90)");
        const labelNeg270 = new Plottable.Components.Label("turnRight", -270);
        assert.strictEqual(labelNeg270.angle(), 90, "angles are converted to range [-180, 180] (-270 -> 90)");
      });

      it("throws error on invalid angles", () => {
        let badAngle = 10;
        (<any> assert).throws(() => new Plottable.Components.Label("foo").angle(badAngle), Error,
          `${badAngle} is not a valid angle for Label`, "only accept -90/0/90 for angle");
        (<any> assert).throws(() => new Plottable.Components.Label("foo", badAngle), Error,
          `${badAngle} is not a valid angle for Label`, "only accept -90/0/90 for angle");
      });

      it("errors on negative padding", () => {
        const testLabel = new Plottable.Components.Label("testing label");
        (<any> assert).throws(() => testLabel.padding(-10), Error, "Cannot be less than 0", "error on negative input");
      });
    });

    describe("Padding", () => {
      const PADDING = 30;
      let svg: SimpleSelection<void>;
      let label: Plottable.Components.Label;

      beforeEach(() => {
      svg = TestMethods.generateSVG();
      label = new Plottable.Components.Label("testing label").padding(PADDING);
      });

      it("adds padding for label accordingly under left alignment", () => {
        label.xAlignment("left").renderTo(svg);
        const testTextRect = (<Element> label.content().select("text").node()).getBoundingClientRect();
        const elementRect = (<any> label)._element.node().getBoundingClientRect();
        assert.closeTo(testTextRect.left, elementRect.left + PADDING, window.Pixel_CloseTo_Requirement,
          "left difference by padding amount");

        svg.remove();
      });

      it("adds padding for label accordingly under right alignment", () => {
        label.xAlignment("right").renderTo(svg);
        const testTextRect = (<Element> label.content().select("text").node()).getBoundingClientRect();
        const elementRect = (<any> label)._element.node().getBoundingClientRect();
        assert.closeTo(testTextRect.right, elementRect.right - PADDING, window.Pixel_CloseTo_Requirement,
          "right difference by padding amount");

        svg.remove();
      });

      it("adds padding for label accordingly under top alignment", () => {
        label.yAlignment("top").renderTo(svg);
        const testTextRect = (<Element> label.content().select("text").node()).getBoundingClientRect();
        const elementRect = (<any> label)._element.node().getBoundingClientRect();
        assert.closeTo(testTextRect.top, elementRect.top + PADDING, window.Pixel_CloseTo_Requirement,
          "top difference by padding amount");

        svg.remove();
      });

      it("adds padding for label accordingly under bottom alignment", () => {
        label.yAlignment("bottom").renderTo(svg);
        const testTextRect = (<Element> label.content().select("text").node()).getBoundingClientRect();
        const elementRect = (<any> label)._element.node().getBoundingClientRect();
        assert.closeTo(testTextRect.bottom, elementRect.bottom - PADDING, window.Pixel_CloseTo_Requirement,
          "bottom difference by padding amount");

        svg.remove();
      });

      it("puts space around the label", () => {
        label.renderTo(svg);

        const measurer = new SVGTypewriter.CacheMeasurer(svg);
        const measure = measurer.measure("testing label");
        assert.operator(label.width(), ">", measure.width, "padding increases size of the component");
        assert.operator(label.width(), "<=", measure.width + 2 * PADDING, "width at most incorporates full padding amount");
        assert.operator(label.height(), ">", measure.height, "padding increases size of the component");
        assert.operator(label.height(), ">=", measure.height + 2 * PADDING, "height at most incorporates full padding amount");
        svg.remove();
      });
    });
  });
  describe("TitleLabel", () => {
    it("has appropriate css class", () => {
      const label = new Plottable.Components.TitleLabel("A CHART TITLE");
      const svg = TestMethods.generateSVG();
      label.renderTo(svg);

      assert.isTrue(label.hasClass(LABEL_CLASS), "element has label css class");
      assert.isTrue(label.hasClass(Plottable.Components.TitleLabel.TITLE_LABEL_CLASS), "element has title-label css class");
      svg.remove();
    });
  });

  describe("AxisLabel", () => {
    it("has appropriate css class", () => {
      const label = new Plottable.Components.AxisLabel("Axis Label");
      const svg = TestMethods.generateSVG();
      label.renderTo(svg);

      assert.isTrue(label.hasClass(LABEL_CLASS), "element has label css class");
      assert.isTrue(label.hasClass(Plottable.Components.AxisLabel.AXIS_LABEL_CLASS), "title element has axis-label css class");
      svg.remove();
    });
  });
});
