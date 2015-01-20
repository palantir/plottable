///<reference path="../reference.ts" />

module Plottable {

  /**
   * Covering when d3 is being loaded through require
   */
  if (typeof d3 === "undefined" && typeof require !== "undefined") {
    require("d3");
  }
}
