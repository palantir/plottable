
import { SimpleSelection } from "../core/interfaces";
import * as d3 from "d3";

/**
 * Coerce possibly external d3 instance into our own instance of d3 so we can use d3-selection-multi.
 * See https://github.com/d3/d3-selection-multi/issues/11 for why we have to do this.
 *
 * Any public facing API that accepts a d3 selection should first pass that user-supplied selection
 * through here - this ensures all selection objects that go through the Plottable codebase are "vetted".
 */
export function coerceExternalD3(externalD3Selection: d3.Selection<any, any, any, any>): SimpleSelection<any> {
  // if .attrs isn't defined; convert the selection
  if (externalD3Selection.attrs == null) {
    if (externalD3Selection.nodes == null) {
      // nodes isn't defined; this is probably a d3v3 selection. handle it accordingly
      const nodes: d3.BaseType[] = [];
      externalD3Selection.each(function() {
        nodes.push(this);
      });
      return d3.selectAll<d3.BaseType, any>(nodes);
    } else {
      return d3.selectAll<d3.BaseType, any>(externalD3Selection.nodes());
    }
  } else {
    return externalD3Selection;
  }
}
