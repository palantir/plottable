function generateSVG(width, height) {
  return d3.select("body").append("svg:svg").attr("width", width).attr("height", height);
}
