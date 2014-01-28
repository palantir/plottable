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
}
