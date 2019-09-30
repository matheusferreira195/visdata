// https://observablehq.com/@matheusferreira195/d3-com-crossfilter-dc-js-e-leaflet@292
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter, DC.js e Leaflet`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/d8df8d875edda71aa2e2365fae2ce225/raw/1e949d3da02ed6caa21fe3a7a12a4e5a611a4bab/stocks.csv").then(function(data){
  // formatando nossos dados
  let parseDate = d3.timeParse("%Y/%m/%d")
  data.forEach(function(d,i){
    
       d.date = parseDate(d.date)
       d.google = +d.google
       d.facebook = +d.facebook
       d.googlepercent = ((parseFloat(d.google) - data[0].google) / (data[0].google))*100
       d.facebookpercent = ((parseFloat(d.facebook) - data[0].facebook) / (data[0].facebook))*100
   })
  return data
})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDim")).define("dateDim", ["facts"], function(facts){return(
facts.dimension( d => d.date)
)});
  main.variable(observer("googleDim")).define("googleDim", ["facts"], function(facts){return(
facts.dimension( d => d.google)
)});
  main.variable(observer("topTenGoogle")).define("topTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.top(10)
)});
  main.variable(observer("bottomTenGoogle")).define("bottomTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.bottom(10)
)});
  main.variable(observer("googleByDayGroup")).define("googleByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.google)
)});
  main.variable(observer("fbByDayGroup")).define("fbByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.facebook)
)});
  main.variable(observer("container")).define("container", function(){return(
function container(id, title) { 
  return `
<div class='container'>
<div class='content'>
<div class='container'>
<div class='row'>
    <div class='span12' id='${id}'>
      <h4>${title}</h4>
    </div>
  </div>
</div>
</div>
</div>`
}
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","d3","dateDim","googleByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup)
{
  let view = md`${container('chart','Valores das ações do Google')}`
  let lineChart = dc.lineChart(view.querySelector("#chart"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  lineChart.width(800)
           .height(400)
           .dimension(dateDim)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .renderArea(false)
           .x(xScale)
           .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(680).y(10).itemHeight(13).gap(5))
           .brushOn(false)
           .group(googleByDayGroup, 'Google')
  dc.renderAll()
  return view      
}
);
  main.variable(observer("buildcomposite")).define("buildcomposite", ["md","container","dc","d3","dateDim","googleByDayGroup","fbByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup,fbByDayGroup)
{
  let view = md`${container('chart2', 'Valores das ações do Google e do Facebook')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart2"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(googleByDayGroup, 'Google')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(fbByDayGroup, 'Facebook')
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>
.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }
</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require("dc")
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require("crossfilter2")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  main.variable(observer()).define(["md"], function(md){return(
md` ## Exercício 1`
)});
  main.variable(observer("google_day_percent")).define("google_day_percent", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.googlepercent)
)});
  main.variable(observer("facebook_day_percent")).define("facebook_day_percent", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.facebookpercent)
)});
  main.variable(observer("acoes")).define("acoes", ["md","container","dc","d3","dateDim","facebook_day_percent","google_day_percent"], function(md,container,dc,d3,dateDim,facebook_day_percent,google_day_percent)
{
  let view = md`${container('chart3', 'Variações das ações do Google e do Facebook')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart3"))
  let xScale = d3.scaleTime()
              .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(facebook_day_percent, 'Facebook')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(google_day_percent, 'Google')
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer("movies")).define("movies", ["d3"], function(d3){return(
d3
.json("https://raw.githubusercontent.com/emanueles/datavis-course/master/assets/files/observable/movies.json")
.then(data => data.map(d => ({
  year: +d["Year"],
  film: d["Film"],
  genre: d["Genre"],
  budget_m: +d["Budget_M"],
  gross_M: +d["Worldwide_Gross_M"]
})))
)});
  main.variable(observer()).define(["md"], function(md){return(
md` ## Exercício 2`
)});
  main.variable(observer("movies_facts")).define("movies_facts", ["crossfilter","movies"], function(crossfilter,movies){return(
crossfilter(movies)
)});
  main.variable(observer("filmYear")).define("filmYear", ["movies_facts"], function(movies_facts){return(
movies_facts.dimension(d => d.year)
)});
  main.variable(observer("filmGross")).define("filmGross", ["filmYear"], function(filmYear){return(
filmYear.group().reduceSum(d => d.gross_M)
)});
  main.variable(observer("by_year")).define("by_year", ["md","container","dc","d3","filmYear","filmGross"], function(md,container,dc,d3,filmYear,filmGross)
{
  let view = md`${container('chart4','Valor arrecadado por ano em bilheteria')}`
  let barChart = dc.barChart(view.querySelector("#chart4"))
  let xScale = d3.scaleLinear()
                  .domain([filmYear.bottom(1)[0].year - 0.5, filmYear.top(1)[0].year + 0.5])
  
  barChart.xAxis().tickFormat(d3.format("d"))
  barChart.xAxis().ticks(5)
  barChart.width(700)
           .height(500)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .legend(dc.legend().x(680).y(10).itemHeight(13).gap(5))
           .brushOn(false)
           .centerBar(true)    
           .gap(20)
           .x(xScale)
           .dimension(filmYear)
           .group(filmGross, 'Arrecadado')
  barChart.render()
  return view 
}
);
  main.variable(observer()).define(["md"], function(md){return(
md` ## Exercício 3`
)});
  main.variable(observer("genreDim")).define("genreDim", ["movies_facts"], function(movies_facts){return(
movies_facts.dimension(d => d.genre)
)});
  main.variable(observer("grossGenreGroup")).define("grossGenreGroup", ["genreDim"], function(genreDim){return(
genreDim.group().reduceSum(d => d.gross_M).order(d => d["Worldwide_Gross_M"])
)});
  main.variable(observer("by_genre")).define("by_genre", ["md","container","dc","d3","genreDim","grossGenreGroup"], function(md,container,dc,d3,genreDim,grossGenreGroup)
{
  let view = md`${container('chart5','Bilheteria por gênero de filme entre 2007/2011)')}`
  let barChart = dc.barChart(view.querySelector("#chart5"))
  let xScale = d3.scaleOrdinal()
                  .domain(genreDim)
  
  barChart.width(700)
           .height(500)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .legend(dc.legend().x(680).y(10).itemHeight(13).gap(5))  
           .xUnits(dc.units.ordinal)
           .gap(5)
           .elasticY(true)
           .x(xScale)
           .ordering(d => -d.gross_M)
           .dimension(genreDim)
           .group(grossGenreGroup)
  barChart.render()
  return view 
}
);
  main.variable(observer()).define(["md"], function(md){return(
md` ## Leaflet`
)});
  return main;
}
