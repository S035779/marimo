import React from 'react';
import * as d3 from 'd3';

export default class Sparkline extends React.Component {
  render() {
    const width = 100;
    const height = 50;
    const points = this.props.points.map(
      (point, index) => ({ x: index, y: point })
    );

    const xScale = d3.scaleLinear()
      .domain([0, points.length])
      .range([width, 0]);
    const yScale = d3.scaleLinear()
      .domain([0, Math.max.apply(Math, this.props.points)])
      .range([height, 0]);
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveLinear);
    
    return <svg width={width} height={height}>
      <path
        d={line(points)}
        stroke='#7ED321'
        strokeWidth='2'
        fill='none' />
      </svg>;
  }
};
