///<reference path="../reference.ts" />

module Plottable {

  /**
   * Covering the case where d3 is being loaded through require
   */
  function requireD3() {
    var d3: D3.Base;
    var require: Require;

    if (d3 == null && require != null) {
      require("d3");
    }
  }
}
