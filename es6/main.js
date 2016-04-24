'use strict';

import axios from 'axios';
import queryString from 'query-string';

import d3 from 'd3';
const client_id = "2957";
const redirect_uri = "http://localhost:5000";
const response_type = "code";

const stravaButton = document.getElementById('strava-button');
const authUrl = `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}`;
stravaButton.href = authUrl;

const queryParams = queryString.parse(location.search);

function applyPath(path,object) {
  let value = object;
  path.forEach( field => {
    value = value[field]
  });
  return value;
}

const code = queryParams.code;
if(code) {
  axios.get('my-commutes', { params : { code } } ).then( (response) => {
    response.data.forEach(d => console.log(d.commuteActivities[0].average_speed));
    averageSpeedChart(response.data)
  },
  (err) =>
    console.log(err)
  )
}

function averageSpeedChart(activities) {
  // Set the dimensions of the canvas / graph
  const margin = {top: 30, right: 80, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

  // Parse the date / time
  const parseDate = d3.time.format('%d/%m/%Y').parse;

  // Set the ranges
  const x = d3.time.scale().range([0, width]);
  const y = d3.scale.linear().range([height, 0]);

  // Define the axes
  const xAxis = d3.svg.axis().scale(x)
                  .orient("bottom");

  const yAxis = d3.svg.axis().scale(y)
                      .orient("left");

  // Define the line
  const valueline = d3.svg.line()
                      .x( d => x(parseDate(d.date)) )
                      .y( d => y(d.average_speed) );

  // Adds the svg canvas
  const svg = d3.select("#graphs")
                .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", `translate(${margin.left} ,${margin.top})`);

  // Scale the range of the data
  x.domain( d3.extent(activities, d => parseDate(d.date) ) );
  y.domain([0, d3.max(activities, d => d.commuteActivities[0].average_speed)]);

  const lines = {
    "Go Commute"          : ['commuteActivities',0,'average_speed'] ,
    "Coming back Commute" : ['commuteActivities',1,'average_speed']
  };

  const color = d3.scale.category10();
  color.domain(d3.keys(lines));

  var averageSpeedData = color.domain().map( name =>
    ({
      name,
      values: activities.map( activity => (
        { date: activity.date, average_speed: applyPath(lines[name], activity) }
      ))
    })
  );

  // Add the X Axis
  svg.append('g')
     .attr('class', 'x axis')
     .attr('transform', `translate(0, ${height})`)
     .call(xAxis);

  // Add the Y Axis
  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
     .append('text')
       .attr('transform', 'rotate(-90)')
       .attr('y', 6)
       .attr('dy', '.71em')
       .style('text-anchor', 'end')
       .text('Average Speed (Miles/Hour)');

  const averageSpeed = svg.selectAll('.average-speed')
                          .data(averageSpeedData)
                          .enter().append('g')
                          .attr('class', 'average-speed')

  averageSpeed.append('path')
              .attr('class','line')
              .attr('d', d => valueline(d.values) )
              .style('stroke', d => color(d.name) );

  averageSpeed.append('text')
              .datum( d => ({ name: d.name, value: d.values[d.values.length - 1] }) )
              .attr('transform', d => `translate(${width}, ${y(d.value.average_speed)})`)
              .attr('x', lines.length)
              .attr('dy', '.35em')
              .text( d => d.name )

}

/*
axios.get('http://jsonplaceholder.typicode.com/posts').then(function (resp) {
  console.log(resp)
});
*/

console.log('done!!');
