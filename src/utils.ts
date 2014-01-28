///<reference path="../lib/d3.d.ts" />

module Utils {
	export function readyCallback(numToTrigger: number, callbackWhenReady: () => any) {
		var timesCalled = 0;
		return () => {
		     timesCalled++;
		  if (timesCalled === numToTrigger) {
		    callbackWhenReady();
		  }
		}
	}

	export function translate(element: D3.Selection, translatePair: number[]) {
		return element.attr("transform", "translate(" + translatePair + ")");
	}

	export function getTranslate(element: D3.Selection) {
		return d3.transform(element.attr("transform")).translate;
	}
	export function getBBox(element: D3.Selection): SVGRect {
		return (<any> element.node()).getBBox();
	}
}
