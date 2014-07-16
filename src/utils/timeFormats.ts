export interface ITimeInterval {
      timeUnit: D3.Time.Range;
      interval: number;
      formatString: string;
};

export var standardIntervals: ITimeInterval[] = [
    {
        formatString: "%I:%M:%S %p",
        interval: 1,
        minor: true,
        timeUnit: d3.time.seconds
    }, {
        formatString: "%I:%M:%S %p",
        interval: 5,
        minor: true,
        timeUnit: d3.time.seconds
    }, {
        formatString: "%I:%M:%S %p",
        interval: 10,
        timeUnit: d3.time.seconds
    }, {
        formatString: "%I:%M:%S %p",
        interval: 15,
        timeUnit: d3.time.seconds
    }, {
        formatString: "%I:%M:%S %p",
        interval: 30,
        timeUnit: d3.time.seconds
    }, {
        formatString: "%I:%M %p",
        interval: 1,
        minor: true,
        timeUnit: d3.time.minutes
    }, {
        formatString: "%I:%M %p",
        interval: 5,
        minor: true,
        timeUnit: d3.time.minutes
    }, {
        formatString: "%I:%M %p",
        interval: 10,
        timeUnit: d3.time.minutes
    }, {
        formatString: "%I:%M %p",
        interval: 15,
        timeUnit: d3.time.minutes
    }, {
        formatString: "%I:%M %p",
        interval: 30,
        timeUnit: d3.time.minutes
    }, {
        formatString: "%I %p",
        interval: 1,
        minor: true,
        timeUnit: d3.time.hours
    }, {
        formatString: "%I %p",
        interval: 3,
        timeUnit: d3.time.hours
    }, {
        formatString: "%I %p",
        interval: 6,
        timeUnit: d3.time.hours
    }, {
        formatString: "%I %p",
        interval: 12,
        timeUnit: d3.time.hours
    }, {
        formatString: "%B %e, %Y",
        interval: 1,
        dual: true,
        dualOnly: true,
        timeUnit: d3.time.days
    }, {
        formatString: "%b %e, %Y",
        interval: 1,
        dual: true,
        dualOnly: true,
        timeUnit: d3.time.days
    }, {
        formatString: "%a %e",
        dual: true,
        interval: 1,
        minor: true,
        timeUnit: d3.time.days
    }, {
        formatString: "%e",
        interval: 1,
        timeUnit: d3.time.days
    }, {
        formatString: "%B %Y",
        interval: 1,
        dual: true,
        dualOnly: true,
        timeUnit: d3.time.months
    }, {
        formatString: "%B",
        dual: true,
        interval: 1,
        minor: true,
        timeUnit: d3.time.months
    }, {
        formatString: "%b",
        interval: 1,
        timeUnit: d3.time.months
    }, {
        formatString: "%Y",
        dual: true,
        interval: 1,
        minor: true,
        timeUnit: d3.time.years
    }, {
        formatString: "%y",
        interval: 1,
        timeUnit: d3.time.years
    }, {
        formatString: "%Y",
        interval: 5,
        minor: true,
        timeUnit: d3.time.years
    }, {
        formatString: "%Y",
        interval: 10,
        timeUnit: d3.time.years
    }, {
        formatString: "%Y",
        interval: 25,
        minor: true,
        timeUnit: d3.time.years
    }, {
        formatString: "%Y",
        interval: 50,
        minor: true,
        timeUnit: d3.time.years
    }, {
        formatString: "%Y",
        interval: 100,
        timeUnit: d3.time.years
    }
];
