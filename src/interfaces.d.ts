interface IRenderable {
  element: D3.Selection; // kind of vestigial
  render: (element: D3.Selection, availableWidth: number, availableHeight: number) => void;
  getRequestedWidth: (availableWidth: number, availableHeight: number) => number;
  getRequestedHeight: (availableWidth: number, availableHeight: number) => number;
}

interface IDatum {

}

interface XYDatum {
  x: number;
  y: number;
}

interface TimeSeriesDatum extends XYDatum {
  x: Date;
  y: number;
}

// interface DateYDatum extends IDatum {
//   x: Date;
//   y: number;
// }

interface IDataset {
  data: IDatum[];
  seriesName: string;
}

interface IWeatherDatum {
  avg   : number; // Average temperature on date
  avgh  : number;
  avgl  : number;
  hi    : number;
  hih   : number;
  hil   : number;
  lo    : number;
  loh   : number;
  lol   : number;
  precip: number;
  day   : number;
  date  : Date;
}
