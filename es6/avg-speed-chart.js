'use strict';

import d3 from 'd3';
import utils from './utils';

const {applyPath} = utils;

function averageSpeedChart(activities, element_selector) {
  // Set the dimensions of the canvas / graph
  const margin = {top: 30, right: 115, bottom: 30, left: 50},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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
  const svg = d3.select(element_selector)
                .append('svg')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                .append('g')
                  .attr('transform', `translate(${margin.left} ,${margin.top})`);

  // Scale the range of the data
  x.domain( d3.extent(activities, d => parseDate(d.date) ) );
  y.domain([
    Math.max(
      d3.min(activities, d => d3.min(d.commuteActivities, a => a.average_speed)),
      5
    ),
    d3.max(activities, d => d3.max(d.commuteActivities, a => a.average_speed))
  ]);

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
       .text('Average Speed (Km/H)');

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

export default averageSpeedChart;
