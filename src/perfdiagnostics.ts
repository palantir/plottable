///<reference path="reference.ts" />

module PerfDiagnostics {
  class PerfDiagnostics {
    private static diagnostics: { [measurementName: string]: PerfDiagnostics; } = {};
    private total: number;
    private start: number;
    private numCalls: number;

    public static toggle(measurementName: string) {
      if (PerfDiagnostics.diagnostics[measurementName] != null) {
        var diagnostic = PerfDiagnostics.diagnostics[measurementName];
      } else {
        var diagnostic = new PerfDiagnostics();
        PerfDiagnostics.diagnostics[measurementName] = diagnostic;
      }
      diagnostic.toggle();
    }

    private static getTime() {
      if (false && performance.now) { // testing for existance of performance breaks on ipad
        return performance.now();
      } else {
        return Date.now();
      }
    }

    public static logResults() {
      var grandTotal = PerfDiagnostics.diagnostics["total"] ? PerfDiagnostics.diagnostics["total"].total : null;
      var measurementNames: string[] = Object.keys(PerfDiagnostics.diagnostics);
      measurementNames.forEach((measurementName: string) => {
        var result = PerfDiagnostics.diagnostics[measurementName].total;
        console.log(measurementName);
        console.group();
        console.log("Time:", result);
        (grandTotal && measurementName !== "total") ? console.log("%   :", Math.round(result/grandTotal * 10000) / 100) : null;
        console.groupEnd();
      });

    }

    constructor() {
      this.total = 0;
      this.numCalls = 0;
      this.start = null;
    }

    public toggle() {
      if (this.start == null) {
        this.start = PerfDiagnostics.getTime();
      } else {
        this.total += PerfDiagnostics.getTime() - this.start;
        this.numCalls++;
        this.start = null;
      }
    }
  }
  export function toggle(measurementName: string) {return PerfDiagnostics.toggle(measurementName);};
  export function logResults() {return PerfDiagnostics.logResults();};
}
(<any> window).report = PerfDiagnostics.logResults;
