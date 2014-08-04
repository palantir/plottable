---
layout: subpage
title: Tutorials
page_id: page-tutorials
---

Plottable Tutorials
===================

Get started with the Plottable Tutorial: Download the packaged tutorial
files at <https://palantir.github.io/plottable/tutorials.zip>; extract
it, and each subdirectory corresponds to a different tutorial. You can
open the \`.html\` files directly in the browser, and modify the
associated \`.js\` files with your favorite text editor. Alternatively,
you can clone the entire repository from
<https://github.com/palantir/plottable>.

<nav markdown="1">
- [Plottable Concepts](#plottable-concepts)
- [Using Plottable](#using-plottable)
  - [Tutorial 1 - Creating a Basic Chart](#tutorial-1---creating-a-basic-chart)
  - [Tutorial 2 - Customization with Projectors](#tutorial-2---customization-with-projectors)
    - [Projection and Accessors](#projection-and-accessors)
  - [Tutorial 3 - Flexible Layout](#tutorial-3---flexible-layout)
  - [Tutorial 4 - Labels and Nested Tables](#tutorial-4---labels-and-nested-tables)
  - [Tutorial 5 - Bars](#tutorial-5---bars)
</nav>


Plottable Concepts
------------------

Each Plottable chart consists of three main pieces:

-   [SVG](http://en.wikipedia.org/wiki/Scalable_vector_Graphics) element - an HTML5 scalable vector graphic tag that Plottable
    draws the chart into.
-   Table - a grid-based layout engine that handles positioning, sizing,
    and alignment of components.
-   Components - objects that requires visual space and can be placed on
    a table (axes, labels, legends, gridlines, plots).

Think of Plottable as a table within an `svg` element, where each cell in
the table can draw a component or another table. For example, in the
screenshot below, there is one table with 2 columns and 2 rows. Cell
(0,0) holds a y-axis, cell (1,1) holds an x-axis, cell (0,1) holds the
plot. Cell (1,0) is empty.

![]({{ site.baseurl }}/build/images/tutorials/tablePlotConcept.png)

In JavaScript, we represent this table as an array of arrays of
components like, `[[yAxis, line], [null, xAxis]]`.

Because you can nest tables within other tables, you can imagine that
there are many ways to layout a complicated chart. For example, you can
have four tables nested inside one larger table. In this case, cell
`(0,0)` is another table, with its own axes and plots.

![]({{ site.baseurl }}/build/images/tutorials/tablePlotConceptNested.png)

Technically, you can create the same visualization without nesting,
however, nesting makes things cleaner and more modular.


Using Plottable
---------------

While Plottable.js is developed in Typescript, it is released in
JavaScript.

### Tutorial 1 - Creating a Basic Chart

In the following tutorial we will create a basic chart by plotting
numerical `(x,y)` coordinate data.

The following is the html that you'll need to run Plottable.


{% highlight xml %}
<html>
  <head>
    <title>Plottable Tutorial 1: A Basic Chart</title>

    <!-- use the Plottable css -->
    <link rel="stylesheet" type="text/css" href="http://palantir.github.io/plottable/plottable.css" />

    <!-- import D3 -->
    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>

    <!-- import Plottable-->
    <script src="http://palantir.github.io/plottable/plottable.js"></script>

    <!-- import the data file -->
    <script src="xyData.js"></script>

    <!-- load the script that draws the chart -->
    <script src="basicChart.js"></script>

  </head>
  <body>
    <!-- Plottable will draw the chart in the svg tag. -->
    <!-- You must specify the ID attribute so that Plottable knows where to draw. -->
    <!-- The width and height attributes are optional; by default svg tags occupy their entire container. -->
    <svg id="basicChart" width="640" height="480"/>
  </body>

  <!-- ensure that this script will not run until the window has loaded -->
  <script> window.onload = makeBasicChart; </script>
</html>
{% endhighlight %}

Now for the Plottable code. Before we get started, you need to create a
new JavaScript file called `basicChart.js`. This is where we will write
our script that draws the chart.


**Step 1**
First we need to specify the scales. Plottable uses Scales to
determine how to draw things to the screen. A Scale takes the data
values (which determine the domain) and maps them to
pixel values (the range). This is important because certain objects,
such as axes and plots, need to be drawn to the same scale in order
to provide meaning to the chart.
To specify a Scale in this example, we create two linear scales, named `xScale` and `yScale`.
Your code should look like:

{% highlight javascript %}
function makeBasicChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
}
{% endhighlight %}


**Step 2**
Once we've specified the Scale, we need to set the axes' locations.
Again, we need two variables, an `xAxis` and a `yAxis`.
The `Axis.Numeric` class creates an axis for displaying numeric data. Its constructor
requires a Scale (in this case we use the xScale variable that
we just created) and a String denoting the orientation. In this
case, we will use a standard bottom orientation for the x-axis.

{% highlight javascript %}
function makeBasicChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
}
{% endhighlight %}


**Step 3**
Next we need to create the plot. In this case we want a line chart
so we'll need the Line class. Line requires the following
parameters: the dataset to plot, an x scale and a y scale.

{% highlight javascript %}
function makeBasicChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var plot = new Plottable.Plot.Line(xyData, xScale, yScale);
}
{% endhighlight %}


**Step 4**
Finally, we need to put all the pieces together to create a chart.
To do this we will create a Table. (Check out [Concept of
Tables](#Plottable-ConceptofTables) to learn more about tables.) We
want to create a basic chart, with a y-axis on the left side, an
x-axis on the bottom, and the time series plotted within those
boundaries. With this in mind, the first row of our Table is [
yAxis, plot] (the yAxis is on the left and the plot is next to it).
The second row of our table [ null, xAxis]. Note that we need a null
in the first column because otherwise the xAxis would not align
underneath our plot.

![]({{ site.baseurl }}/build/images/tutorials/alignment.png)

{% highlight javascript %}
function makeBasicChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var plot = new Plottable.Plot.Line(xyData, xScale, yScale);

  var chart = new Plottable.Component.Table([
                    [yAxis, plot],
                    [null,  xAxis]
                  ]);
}
{% endhighlight %}


**Step 5**
We now have a table graphing our chart. The final step is drawing
that chart on your screen. To do this we use the line
`chart.renderTo("#basicChart")`. "\#basicChart" says to look for the
svg with the ID equal to "basicChart" and to draw the chart in that
svg. If you look back at our original html code, you see that our
svg has the ID "basicChart".


**Step 6**
The final code:

{% highlight javascript %}
function makeBasicChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var plot = new Plottable.Plot.Line(xyData, xScale, yScale);

  var chart = new Plottable.Component.Table([
                    [yAxis, plot],
                    [null,  xAxis]
                  ]);

  chart.renderTo("#basicChart");
}
{% endhighlight %}


**Step 7**
You can now load the basicChart tutorial and see your chart.

![]({{ site.baseurl }}/build/images/tutorials/basicChart.png)

Plottable offers a multitude of different types of plots. For example,
if instead of a line plot we want to display our chart with points, we
can swap out the Line plot for a Scatter plot just by changing one line
of code:

Instead of the line
`var plot = new Plottable.Plot.Line(xyData, xScale, yScale);` which
specifies a Line plot, we can use
`var plot = new Plottable.Plot.Scatter(xyData, xScale, yScale);` to
create a Scatterplot. If you save the code and refresh your page, the
chart will now display the data in circles rather than as a line.

![]({{ site.baseurl }}/build/images/tutorials/basicChartCircle.png)


Tutorial 2 - Customization with Projectors
------------------------------------------

### Projection and Accessors

Plots work by taking each point of data and determining what it needs to
do to draw that piece of data. Each type of plot has a specific set of
visual properties, or **attributes**. For example, a Scatterplot has
attributes, x, y, fill, and radius. A Line plot has x, y, and stroke, which determines the color.

If your JavaScript data object already has the correct property names,
then you do not need to specify the data; Plottable picks it up
automatically. For instance, the basicChart example above had data that
was an array of {x,y} pairs:

{% highlight javascript %}
var xyData = [
  {"x": 0, "y": 1},
  {"x": 0.11865740740740742, "y": 2},
  {"x": 0.11887731481481482, "y": 3},
  {"x": 1.1845949074074074, "y": 4},
  {"x": 1.2361342592592592, "y": 5},
  {"x": 1.2718402777777778, "y": 6},
  {"x": 4.949074074074074, "y": 7},
...
]
{% endhighlight %}

The name of the property is already `x`, which directly maps to the x
values of a Line Plot and the same is true of the y values.

However, data is not usually that neatly formatted. For example, if your
data is an object with the properties `{committer, days, total_commits,
additions, deletions}`, Plottable cannot automatically determine the
property for `x` and `y`.


{% highlight javascript %}
gitData = [
  {
    "committer": "derek",
    "day": 0,
    "total_commits": 0,
    "additions": 204,
    "deletions": 0
  },
  {
    "committer": "dan",
    "day": 0.11865740740740742,
    "total_commits": 1,
    "additions": 824,
    "deletions": 0
  },
  {
    "committer": "dan",
    "day": 0.11887731481481482,
    "total_commits": 2,
    "additions": 3,
    "deletions": 0
  },
...
]
{% endhighlight %}

We thus need a way to select which pieces of the data we want to use for
each attribute.

An **accessor** is a function that defines how to assign a piece of the
data to a specific attribute. For example, if you want `numbersOfCommits`
to be your y-axis, your accessor would be a function that takes each
data point (or each object in the array) and returns the `numberOfCommits`
for each point and uses that for the y values.

A **perspective** is a view of the data. A perspective is essentially
equivalent to the accessor plus the data source.

A **projector** is a function that takes a perspective and maps it onto
a visualization (a projection). In other words, a projector is a scale;
it determines how to correspond data to a visual property.

In practice, the projector tells the plot how to assign data to each
attribute and what scale to use. Think of this as,
`Plot.project(“attribute”, howToGetThatAttribute, scale)`.

The next example will walk you through using projectors. Be sure to note
that while the code is slightly different, we are really just accessing
data in a different way, so the resulting chart will look the same as
the one we previously created.

**Step 1**
As in the BasicChart example above, we start with the html file. The
only difference from the previous example is that we are using a
different data file and the name of our javascript file is specific
to this example.

{% highlight xml %}
<html>
  <head>
    <title>Plottable Tutorial 2: Projectors</title>

    <link rel="stylesheet" type="text/css" href="http://palantir.github.io/plottable/plottable.css" />

    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <script src="http://palantir.github.io/plottable/plottable.js"></script>
    <script src="gitData.js"></script>
    <script src="customProjectors.js"></script>
  </head>
  <body>
    <svg id="customProjectorChart" width="640" height="480"/>
  </body>
  <script> window.onload = makeCustomProjectorChart; </script>
</html>
{% endhighlight %}

**Step 2**
Create a new JavaScript file called `customProjectors.js`. The first
several lines of our code are exactly the same as in the previous
example: we specify a linear scale, and denote where to place the
axes.


{% highlight javascript %}
function makeCustomProjectorChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
}
{% endhighlight %}


**Step 3**
We now have enough information to evoke the Line class. Recall that
the Line plot requires the following parameters: the dataset, an x
scale and a y scale.

{% highlight javascript %}
function makeCustomProjectorChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var plot = new Plottable.Plot.Line(gitData, xScale, yScale);
}
{% endhighlight %}

**Step 4**
Since our data is not obviously mapped to x and y values, we need a
function to define how to assign a piece of our data to a specific
attribute. In other words, we need an accessor.

{% highlight javascript %}
function getXDataValue(d) {
    return d.day;
  }
{% endhighlight %}

The above function says that for every data point d, return the
"day" value from that data point. So if we look at the first item in
our dataset

{% highlight javascript %}
{
  "committer": "derek",
  "day": 0,
  "total_commits": 0,
  "additions": 204,
  "deletions": 0
},
{% endhighlight %}

The accessor function would return 0 since that first data object
has 0 as the day value.

**Step 5**
An accessor is just a way to assign a piece of data to an attribute.
We still need to do that mapping from data to visualization. For
this we need a projector.

{% highlight javascript %}
plot.project("x", getXDataValue, xScale);
{% endhighlight %}

In the above line, plot is the plot we created above and it's
calling the project function. Plot.project needs parameters to tell
it the attribute, how to get that attribute, and the scale to use.
In this case, we want to assign a value for x. The code therefore
reads that for each datapoint given to the plot, assign x as the day
value and use the xScale we defined previously.

We need another accessor that will determine the y attribute. By
similar logic, we do the following:

{% highlight javascript %}
function getYDataValue(d) {
  return d.total_commits;
}

plot.project("y", getYDataValue, yScale);
{% endhighlight %}

**Step 7**
Now that we have a map from the data to our linear chart, we can add
in the rest of the code to build the chart. Notice it is the same as
in the previous example.

**Step 8**
Our final code looks like the following:

{% highlight javascript %}
function makeCustomProjectorChart() {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var plot = new Plottable.Plot.Line(gitData, xScale, yScale);

  function getXDataValue(d) {
    return d.day;
  }
  plot.project("x", getXDataValue, xScale);

  function getYDataValue(d) {
    return d.total_commits;
  }
  plot.project("y", getYDataValue, yScale);

  var chart = new Plottable.Component.Table([
                    [yAxis, plot],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#customProjectorChart");
}
{% endhighlight %}

![]({{ site.baseurl }}/build/images/tutorials/customProj.png)


Tutorial 3 - Flexible Layout
----------------------------

In the next example, we will create a chart with two subplots. Each plot
will have a different y-axis that displays different information - total
commits versus net commits - but both plots will share the same x-axis.
The first subplot will use a Line plot, and the second a Scatterplot.
Both plots will use the same data, which is why we can use the same
x-axis for each subplot.

![]({{ site.baseurl }}/build/images/tutorials/tableSubplotConcept.png)

**Step 1**
First we need the html file. Notice that the data is the same as was
used in the previous tutorial.

{% highlight xml %}
<html>
  <head>
    <title>Plottable Tutorial 3: Layout</title>

    <link rel="stylesheet" type="text/css" href="http://palantir.github.io/plottable/plottable.css" />

    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <script src="http://palantir.github.io/plottable/plottable.js"></script>
    <script src="gitData.js"></script>
    <script src="subplots.js"></script>
  </head>
  <body>
    <svg id="chart" width="640" height="480"/>
  </body>
  <script> window.onload = makeChartWithSubplots; </script>
</html>
{% endhighlight %}

**Step 2**
Create a new JavaScript file called `subplots.js`. Since each
subplot relies on the same x-axis, we start by creating the xScale
and xAxis.

{% highlight javascript %}
function makeChartWithSubplots() {
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
}
{% endhighlight %}

**Step 3**
Since we want two subplots, we need two y-axes and two y scales. The
first subplot uses a Line plot and the second a Scatterplot. Notice
that the same data and the same xScale are passed to each plot.

{% highlight javascript %}
function makeChartWithSubplots() {
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var lineYScale = new Plottable.Scale.Linear();
  var lineYAxis = new Plottable.Axis.Numeric(lineYScale, "left");
  var linePlot = new Plottable.Plot.Line(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.Scale.Linear();
  var circleYAxis = new Plottable.Axis.Numeric(circleYScale, "left");
  var circlePlot = new Plottable.Plot.Scatter(gitData, xScale, circleYScale);
{% endhighlight %}

**Step 4**
As per the previous tutorial, we use projectors to choose the
information to plot. The x-axis accessor is the same as in the
previous tutorial because we again want days on the x-axis.

{% highlight javascript %}
function getDayValue(d) {
  return d.day;
}
linePlot.project("x", getDayValue, xScale);
circlePlot.project("x", getDayValue, xScale);
{% endhighlight %}

Both the linePlot and the circlePlot use the same x-axis, which
corresponds to the fact that they have the same scale. Additionally,
in this case, since they both are using the same data, their
projectors can use the same accessor.

**Step 5**
Next we need projectors for each y-axis. As in the previous example,
the first y accessor returns total commits.

{% highlight javascript %}
function getTotalCommits(d) {
  return d.total_commits;
}
linePlot.project("y", getTotalCommits, lineYScale);
{% endhighlight %}

Only the linePlot needs access to the totalCommits data.

**Step 6**
For the second subplot, we want to display the commit size (i.e. the
number of additions in the commit minus the deletions for a specific
data point). Accessors can grab data or compute/derive it on the
fly.

{% highlight javascript %}
function getNetCommitSize(d) {
  return d.additions - d.deletions;
}
circlePlot.project("y", getNetCommitSize, circleYScale);
{% endhighlight %}

**Step 7**
The last thing we need is to put the pieces together - i.e add each
subplot to a single chart. Unlike in the previous examples where the
table only had two rows (one for the y-axis and plot, and one for
the x-axis), in this example we need a table with three rows - one
for each y-axis and plot, and one for the x-axis.

{% highlight javascript %}
var chart = new Plottable.Component.Table([
                  [lineYAxis,   linePlot],
                  [circleYAxis, circlePlot],
                  [null,        xAxis   ]
                ]);
{% endhighlight %}

**Step 8**
Your final code should look like the following:

{% highlight javascript %}
function makeChartWithSubplots() {
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var lineYScale = new Plottable.Scale.Linear();
  var lineYAxis = new Plottable.Axis.Numeric(lineYScale, "left");
  var linePlot = new Plottable.Plot.Line(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.Scale.Linear();
  var circleYAxis = new Plottable.Axis.Numeric(circleYScale, "left");
  var circlePlot = new Plottable.Plot.Scatter(gitData, xScale, circleYScale);

  function getDayValue(d) {
    return d.day;
  }
  linePlot.project("x", getDayValue, xScale);
  circlePlot.project("x", getDayValue, xScale);

  function getTotalCommits(d) {
    return d.total_commits;
  }
  linePlot.project("y", getTotalCommits, lineYScale);

  function getNetCommitSize(d) {
    return d.additions - d.deletions;
  }
  circlePlot.project("y", getNetCommitSize, circleYScale);

  var chart = new Plottable.Component.Table([
                    [lineYAxis,   linePlot],
                    [circleYAxis, circlePlot],
                    [null,        xAxis   ]
                  ]);

  chart.renderTo("#chart");
}
{% endhighlight %}

![]({{ site.baseurl }}/build/images/tutorials/subplot.png)


Tutorial 4 - Labels and Nested Tables
-------------------------------------

The chart in Tutorial 3 accurately plots the data, but it lacks visual
information that describes the data, such as a title.

![]({{ site.baseurl }}/build/images/tutorials/nestedTitleGeneric.png)

As in the previous tutorials, we start with html code:

{% highlight xml %}
<html>
  <head>
    <title>Plottable Tutorial 4: Advanced Layout and Labels</title>

    <link rel="stylesheet" type="text/css" href="http://palantir.github.io/plottable/plottable.css" />

    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <script src="http://palantir.github.io/plottable/plottable.js"></script>
    <script src="gitData.js"></script>
    <script src="labels.js"></script>
  </head>
  <body>
    <svg id="chart" width="640" height="480"/>
  </body>
  <script> window.onload = makeNestedTables; </script>
</html>
{% endhighlight %}

The majority of the code in `labels.js` follows what we did in previous
tutorials. We create axes, scales, plots, and projectors before putting
everything into a table to create the chart. The new piece for this
example are nested tables, and use of the Label class.

The Label constructor requires a string for the title, and offers an optional parameter for the title's orientation. Options for orientation include horizontal, vertical-left, which indicates that the title is rotated counterclockwise 90 degrees, and vertical-right, which indicates the word is rotated clockwise 90 degrees.

For this tutorial we will create a title, centered over the chart.

**Step 1**
The first part of `labels.js` should look like the following:

{% highlight javascript %}
function makeNestedTables() {

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var linePlot = new Plottable.Plot.Line(gitData, xScale, yScale);
{% endhighlight %}

**Step 2**
We can use the same projectors as in the previous tutorial:

{% highlight javascript %}
function getDayValue(d) {
  return d.day;
}
linePlot.project("x", getDayValue, xScale);

function getTotalCommits(d) {
  return d.total_commits;
}
linePlot.project("y", getTotalCommits, yScale);
{% endhighlight %}

**Step 3**
We still need to create the actual labels. We want a title for our
chart, as well as a subtitle giving more detail.

{% highlight javascript %}
var title = new Plottable.Component.TitleLabel("Plottable Git Data");
var subtitle = new Plottable.Component.Label("Total Commits, by day, to the Plottable repo");
{% endhighlight %}

**Step 4**
Next we need to create the subtables to nest in the main table. We
want one table to contain the title and subtitle for the chart, and
the other table to contain the axes and plot. For the title table,
we need one column with two rows (one row for the title and one for
the subtitle).

{% highlight javascript %}
var titleTable = new Plottable.Component.Table([
                  [title],
                  [subtitle]
                ]);
titleTable.xAlign("center");
{% endhighlight %}

The chart we are building is a larger table, with cells containing
the smaller, nested tables. The `titleTable.xAlign("center");` line
ensures that the titleTable is centered in the cell of that larger
table. Without specifying the alignment, it will align to the left
side by default.

**Step 5**
Our other table contains the axes and plot - just like in previous
tutorials we create the table by placing the y-axis in cell (0,0),
the plot in (0,1), null in (1,0) and the x-axis in (1,1).

{% highlight javascript %}
var dataTable = new Plottable.Component.Table([
                  [yAxis, linePlot],
                  [null, xAxis]
                ]);
{% endhighlight %}

**Step 6**
Finally, we can embed the tables. Here instead of placing components
in each cell, we place the two tables we just created. So in cell
(0,0), we put titleTable, and in cell (1,0), we put the dataTable.

{% highlight javascript %}
var chart = new Plottable.Component.Table([
                  [titleTable],
                  [dataTable]
                ]);
{% endhighlight %}

We now have a table with two subtables: one displaying the title and
subtitle, and the other displaying the axes and plot.

**Step 7**
Your final code should look like:

{% highlight javascript %}
function makeNestedTables() {

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var linePlot = new Plottable.Plot.Line(gitData, xScale, yScale);


  function getDayValue(d) {
    return d.day;
  }
  linePlot.project("x", getDayValue, xScale);

  function getTotalCommits(d) {
    return d.total_commits;
  }
  linePlot.project("y", getTotalCommits, yScale);

  var title = new Plottable.Component.TitleLabel("Plottable Git Data");
  var subtitle = new Plottable.Component.Label("Total Commits, by day, to the Plottable repo");
  var titleTable = new Plottable.Component.Table([
                    [title],
                    [subtitle]
                  ]);
  titleTable.xAlign("center");

  var dataTable = new Plottable.Component.Table([
                    [yAxis, linePlot],
                    [null, xAxis]
                  ]);

  var chart = new Plottable.Component.Table([
                    [titleTable],
                    [dataTable]
                  ]);
  chart.renderTo("#chart");
}
{% endhighlight %}

![]({{ site.baseurl }}/build/images/tutorials/nestedTitle.png)


Tutorial 5 - Bars
-----------------

Creating bar charts and histograms are relatively similar to what we've
done in previous tutorials. The main difference is the introduction of
an Ordinal Scale instead of a Linear Scale. Additionally, we'll need a
function that sets the rangeType (i.e. the range bounds for the bar) as
either **bands** or **points** (concepts native to D3). Bands is the
default, and the recommended, so we'll focus only on bands and forgo a
discussion on points.

Simply put, bands are used as the rangeType when you want to create bar
charts; the width of the band is set by the scale (if you want to adjust
the width of the bars, you need to set padding parameters in the
function). In the diagram below, the bars are separated by a **step**.
The step is a set size, the padding between the bars is set as a
proportion of the step itself, and the bars take up the remaining length
of the step.

You can also specify the distance to the left of the first bar and the
right of the last bar.

![]({{ site.baseurl }}/build/images/tutorials/bands.png)

The D3 documentation on each of these concepts is comprehensive and we
recommend you look there before continuing:

-   [Bands](https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangeBands)
-   [Points](https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangePoints)

The following example will walk you through the creation of a bar chart.
Here we are using a simple data set just to introduce the topic of bar
charts:

{% highlight javascript %}
//population, in millions
wordWrapData = [
  {
    y: "China",
    x: 1365
  },
  {
    y: "The Republic of India",
    x: 1237
  },
  {
    y: "United States of America",
    x: 313
  },
  {
    y: "Indonesia",
    x: 247
  },
  {
    y: "Brazil",
    x: 199
  }
];
{% endhighlight %}

As always, we start with the html code:

{% highlight xml %}
<html>
  <head>
    <title>Plottable Tutorial 5: Using Ordinal Scales and Category Axes</title>

    <link rel="stylesheet" type="text/css" href="../plottable.css" />

    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <script src="../plottable.js"></script>
    <script src="wordWrapData.js"></script>
    <script src="wordWrap.js"></script>
  </head>
  <body>
    <svg id="chart" width="640" height="480"/>
  </body>
  <script> window.onload = makeBarChart; </script>
</html>
{% endhighlight %}

The majority of the code in `makeBarChart.js` follows what we did in
previous tutorials. We create axes, scales, plots, and projectors before
putting everything into a table to create the chart. The new classes used in
this example are Ordinal scales and HorizontalBar.

As always, we start by defining our scales. Here, since this is a
horizontal bar chart, we want the y scale to be ordinal, the x scale can
remain linear.

{% highlight javascript %}
var xScale = new Plottable.Scale.Linear();
var yScale = new Plottable.Scale.Ordinal();
{% endhighlight %}

Next we create the axes, which are very similar to the other axes we
have seen. However, this time, since we want to use Strings instead of
Numbers for the y-axis, we use Category, instead of Numeric.

{% highlight javascript %}
var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
var yAxis = new Plottable.Axis.Category(yScale, "left");
{% endhighlight %}

Now we need to create the actual bar plot. As with previous plots, we
need to specify the data to use, and the scales. The only difference is
that now are going to make a HorizontalBar plot.

{% highlight javascript %}
var barPlot = new Plottable.Plot.HorizontalBar(wordWrapData, xScale, yScale);
{% endhighlight %}

Finally, we put everything in a table to create the chart. This looks
exactly the same as in previous examples. Your final code should look
like the following:

{% highlight javascript %}
function makeBarChart() {

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yScale = new Plottable.Scale.Ordinal();
  var yAxis = new Plottable.Axis.Category(yScale, "left");
  var barPlot = new Plottable.Plot.HorizontalBar(wordWrapData, xScale, yScale);


  var title = new Plottable.Component.TitleLabel("Population of Countries");
  var subtitle = new Plottable.Component.Label(" (in millions)");
  subtitle.yAlign("bottom");

  var titleTable = new Plottable.Component.Table([
                    [title, subtitle],
                  ]);
  titleTable.xAlign("center");

  var dataTable = new Plottable.Component.Table([
                    [yAxis, barPlot],
                    [null, xAxis]
                  ]);

  var chart = new Plottable.Component.Table([
                    [titleTable],
                    [dataTable]
                  ]);

  chart.renderTo("#chart");
}
{% endhighlight %}
