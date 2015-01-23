///<reference path="../reference.ts" />

/**
 * Covering when d3 is being loaded through require
 */
if (typeof d3 === "undefined" && typeof require !== "undefined") {
  require("d3");
}
