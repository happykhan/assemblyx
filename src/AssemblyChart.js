import { useEffect, useRef, React } from "react"
import {select, scaleLinear, axisBottom, axisLeft,  line, max,  curveNatural } from 'd3'

const AssemblyChart = ({ data, height, width }) => {

const svgRef = useRef();

useEffect(() => {
  const height = 500; 
  const width = 700; 
  const margin = 50; 
  const plotHeight = height - margin; 
  const plotWidth = width - margin; 
  const tesdata = data.map(x => x['contigs'].sort((a, b) => b - a).map((sum => value => sum += value)(0)));
 
    const svg = select(svgRef.current);
    const xScale = scaleLinear()
      .domain([0, max(tesdata.map(x => x.length))])
      .range([margin, plotWidth]);
    const yScale = scaleLinear()
      .domain([0, max(tesdata.map(x => max(x)))])
      .range([plotHeight, 0]);
    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale);
    svg.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                         (height) + ")")
    .style("text-anchor", "middle")
    .text("Sequence count");
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", height /2 )
    .attr("x", 200 )
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Cumulative length (bp)");  


    svg.select(".x-axis").style("transform", "translateY("+ plotHeight + "px)").call(xAxis)
    svg.select(".y-axis").style("transform", "translateX("+ margin + "px)").call(yAxis)
    const myLine = line()
      .x((value, index) => xScale(index))
      .y(yScale)
      .curve(curveNatural);
    svg.selectAll(".line")
    .data(tesdata)
    .join("path")
    .attr("class", "line")
    .attr("d", myLine)
    .attr("fill", "none")
    .attr("stroke", "blue");
}, [data]);


  return (
    <div>
        <svg ref={svgRef} height={height} width={width} overflow="visible">
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
        <br />
    </div>
  )
}
export default AssemblyChart