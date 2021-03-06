import * as d3 from "d3";
import vegaEmbed from "vega-embed";
import { internalField } from "vega-lite";


// // Load "data.csv" and log it to the console.

var margin = {top: 10, right: 100, bottom: 30, left: 100},
    width = 1200 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var svg = d3.select("#svg-div")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


var parseTime = d3.timeParse("%Y-%m-%d");
var parseMonth = d3.timeParse("%Y-%m");

var dataPrime = null

var newData = d3.tsv("static/SandP500.tsv").then(function(data1){
  let new_data = d3.csv("static/marketcap.csv").then(function(data2){
    let data = []
    data1.forEach(function(d){
      data2.forEach(function(d2){
        if(d['Symbol'] == d2['Name']){
          data.push({
            "Symbol": d['Symbol'],
            "Security": d['Security'],
            "SEC filings": d['SEC filings'],
            "GICS Sector": d['GICS Sector'],
            "GICS Sub Industry": d['GICS Sub Industry'],
            "Headquarters Location": d['Headquarters Location'],
            "Date first added": d['Date first added'],
            "CIK": d['CIK'],
            "Founded": d['Founded'],
            "Market Cap": +d2['Market Cap']
          })
        }
      })
    })
    return data;
  })
  return new_data;
})


var nested = newData.then(function(data){
  var new_data = []
  for(let i = 0; i < data.length; i++){
    var isIn = false;
    for(let j = 0; j < new_data.length; j++){
      if(new_data[j]["GICS Sector"] === data[i]["GICS Sector"]){
        isIn = true;
      }
    }
    if(!isIn){
      new_data.push({
      "GICS Sector": data[i]["GICS Sector"],
      values: [],
      "Total Cap": 0
      })
    }
  }
  
  for(let i = 0; i < new_data.length; i++){
    for(let j = 0; j < data.length; j++){
      if(data[j]["GICS Sector"] == new_data[i]["GICS Sector"]){
        new_data[i].values.push(data[j])
        new_data[i]["Total Cap"] =  new_data[i]["Total Cap"] + data[j]["Market Cap"]
      }
    }
  }

  return new_data
})


// Load Data
nested.then((data) => {
  var allGroup = [];
  for(let i = 0; i < 11; i++){
    allGroup.push(data[i]["GICS Sector"])
  }

  console.log(data);
  let hierarchy = d3.hierarchy(data, (node) => {
    return node
  }).sum((node) => {
    return node["Total Cap"]
  }).sort((node1, node2) => {
    return node2['Market Cap'] - node1['Market Cap']
  })


  var color = d3.scaleOrdinal()
    .domain(allGroup)
    .range(d3.schemeSet2);

  let createTreemap = d3.treemap()
                  .size([1000, 600])

  createTreemap(hierarchy)

  let tiles = hierarchy.leaves()
  console.log(tiles)
  let tooltip = d3.select('#tooltip')

  let block = svg.selectAll('g')
                .data(tiles)
                .enter()
                .append('g')
                .attr('transform', (Node) =>{
                  return 'translate(' + Node['x0'] + ', ' + Node['y0'] + ')'
                })

  block.append('rect')
        .attr('class', 'tile')
        .attr('fill', (Node)=>{
          return color(Node.data["GICS Sector"])
        })
        .attr('width', (Node) => {
          return Node['x1'] - Node['x0']
        })
        .attr('height', (Node) => {
          return Node['y1'] - Node['y0']
        })
  
  block.append('text')
       .text((Node) => {
         return Node.data["GICS Sector"]
       })
       .attr('x', 5)
       .attr('y',30)


       .on('mouseover', (Node) => {
         tooltip.transition()
                .style('visibility', 'visible')
         tooltip.text(
           Node.data['GICS Sector'] + ' : $' + Node.data['Total Cap']
         )
         })
       .on('mouseout', (movie) => {
         tooltip.transition()
                .style('visibility', 'hidden')
       })




  
  // var nested = data.map(function(d) {
  //   var new_data = []
  //   for (var prop in d) {
  //     let obj = []
  //     if (prop !== "GICS Sector") {
  //       obj.values.push({
  //         [prop]: d[prop]
  //       })
  //     }
  //   }
  //   return obj;
  // });

  //console.log(nested);

  var root={};

})
// d3.csv("UK_Home_Office_Air_Travel_Data_2011.csv", function(csv_data){

//   // Add, remove or change the key values to change the hierarchy. 
//   var nested_data = d3.nest()
//            .key(function(d)  { return d.Destination; })
//            .key(function(d)  { return d.Supplier_name; })
//           .key(function(d)  { return d.Ticket_class_description; })
//           .entries(csv_data);
  
//   // Creat the root node for the treemap
//   var root = {};
  
//   // Add the data to the tree
//   root.key = "Data";
//   root.values = nested_data;

//   // Change the key names and children values from .next and add values for a chosen column to define the size of the blocks
//   root = reSortRoot(root,"Paid_fare");
  
//   // DEBUG
// // 			$("#rawdata").html(JSON.stringify(root));
  
//   loadData(root);
  
// });