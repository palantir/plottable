/// <reference path="../reference.d.ts" />
declare module Plottable {
    class StandardChart extends Table {
        private _xAxis;
        private _yAxis;
        private _xLabel;
        private _yLabel;
        private centerComponent;
        private _titleLabel;
        private xTable;
        private yTable;
        private xyTable;
        private fullTable;
        constructor();
        public yAxis(y: YAxis): StandardChart;
        public yAxis(): YAxis;
        public xAxis(x: XAxis): StandardChart;
        public xAxis(): XAxis;
        public yLabel(y: AxisLabel): StandardChart;
        public yLabel(y: string): StandardChart;
        public yLabel(): AxisLabel;
        public xLabel(x: AxisLabel): StandardChart;
        public xLabel(x: string): StandardChart;
        public xLabel(): AxisLabel;
        public titleLabel(x: TitleLabel): StandardChart;
        public titleLabel(x: string): StandardChart;
        public titleLabel(): TitleLabel;
        public center(c: Component): StandardChart;
    }
}
