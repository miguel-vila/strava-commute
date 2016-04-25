'use strict';

import d3 from 'd3';
import utils from './utils';

const {applyPath} = utils;
const normalizedYear = 2016;
const normalizedMonth = 0;
const normalizedDate = 1;

const normalDate        = new Date(normalizedYear, normalizedMonth, normalizedDate),
      normalDatePlusDay = new Date(normalizedYear, normalizedMonth, normalizedDate+1);

function normalizeDate(date) {
  date.setFullYear(normalizedYear);
  date.setMonth(normalizedMonth);
  date.setDate(normalizedDate);
  return date;
}

function durationsChart(activities, element_selector) {
  // Set the dimensions of the canvas / graph
  const margin = {top: 30, right: 115, bottom: 30, left: 50},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  // Parse the date / time
  const parseDate1 = d3.time.format('%d/%m/%Y').parse;
  const parseDate2 = d3.time.format('%Y-%m-%dT%H:%M:%S.000Z').parse;

  const formatTime = d3.time.format("%H:%M")

  // Set the ranges
  const x = d3.time.scale().range([0, width]);
  const y = d3.time.scale().range([height, 0]);

  // Define the axes
  const xAxis = d3.svg.axis().scale(x)
                  .orient("bottom");

  const yAxis = d3.svg.axis().scale(y)
                      .orient("left")
                      .tickFormat(formatTime);

  // Define the line
  const valueline = d3.svg.line()
                      .x( d => x(parseDate1(d.date)) )
                      .y( d => y(normalizeDate(parseDate2(d.timeOfDay))) );

  // Adds the svg canvas
  const svg = d3.select(element_selector)
                .append('svg')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                .append('g')
                  .attr('transform', `translate(${margin.left} ,${margin.top})`);

  // Scale the range of the data
  x.domain( d3.extent(activities, d => parseDate1(d.date) ) );
  y.domain([normalDatePlusDay, normalDate]);

  const lines = {
    "Go Commute Start" : ['commuteActivities',0,'start_date'] ,
    "Go Commute End"   : ['commuteActivities',0,'end_date'  ] ,
    "Come back Commute Start" : ['commuteActivities',1,'start_date'] ,
    "Come back Commute End"   : ['commuteActivities',1,'end_date'  ]
  };

  const color = d3.scale.category10();
  color.domain(d3.keys(lines));

  var goCommuteData = color.domain().map( name =>
    ({
      name,
      values: activities.map( activity => (
        { date: activity.date, timeOfDay: applyPath(lines[name], activity) }
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
      .call(yAxis)/*
     .append('text')
       .attr('transform', 'rotate(-90)')
       .attr('y', 6)
       .attr('dy', '.71em')
       .style('text-anchor', 'end')
       .text('Average Speed (Km/H)');*/

  const goCommute = svg.selectAll('.go-commute')
                          .data(goCommuteData)
                          .enter().append('g')
                          .attr('class', 'go-commute')

  goCommute.append('path')
              .attr('class','line')
              .attr('d', d => valueline(d.values) )
              .style('stroke', d => color(d.name) );

/*
  goCommute.append('text')
              .datum( d => ({ name: d.name, value: d.values[d.values.length - 1] }) )
              .attr('transform', d => `translate(${width}, ${y(d.value.average_speed)})`)
              .attr('x', lines.length)
              .attr('dy', '.35em')
              .text( d => d.name )
              */

}

export default durationsChart;
