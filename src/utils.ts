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

	class CSVParser {
		private static attributes = ["avg", "avgh", "avgl", "hi", "hih", "hil", "lo", "loh", "lol", "precip", "day"]
		private static parseDate = d3.time.format("%Y-%m-%d").parse;

		public static processCSVData(indata: any) {
		  indata.forEach((d: any) => {
		    var dt = d; // TIL function arguments arent accessible from an inner-scope closure
		    CSVParser.attributes.forEach((a: string) => {
		      dt[a] = +dt[a];
		    });
		    d.date = CSVParser.parseDate(d.date);
		  });
		  return <IWeatherDatum[]> indata;
		}
	}
	export function processCSVData(indata) {
		return CSVParser.processCSVData(indata);
	}

	export function translate(element: D3.Selection, translatePair: number[]) {
		return element.attr("transform", "translate(" + translatePair + ")");
	}
}
