import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DerivativeNode {
  word: string;
  definition?: string;
  definition_vi?: string;
}

interface WordTreeProps {
  root: string;
  derivatives: DerivativeNode[];
  onNodeClick: (word: string) => void;
  selectedWord: string | null;
}

interface TreeNode {
  name: string;
  data?: DerivativeNode;
  children?: TreeNode[];
}

export const WordTree: React.FC<WordTreeProps> = ({ root, derivatives, onNodeClick, selectedWord }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ show: boolean, x: number, y: number, data: DerivativeNode | null }>({ show: false, x: 0, y: 0, data: null });

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 90, bottom: 20, left: 90 };

    const data: TreeNode = {
      name: root,
      children: derivatives?.map(d => ({ name: d.word, data: d })) || []
    };

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree<TreeNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const rootNode = d3.hierarchy(data);
    treeLayout(rootNode);

    // Links
    svg.selectAll(".link")
      .data(rootNode.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#a8a29e") // stone-400
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      );

    // Nodes Group
    const nodeGroup = svg.selectAll(".node")
      .data(rootNode.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
          onNodeClick(d.data.name);
      })
      .on("mouseenter", (event, d) => {
        if (d.data.data) {
          setTooltip({
            show: true,
            x: event.pageX,
            y: event.pageY,
            data: d.data.data
          });
        }
      })
      .on("mousemove", (event) => {
        setTooltip(prev => ({ ...prev, x: event.pageX, y: event.pageY }));
      })
      .on("mouseleave", () => {
        setTooltip(prev => ({ ...prev, show: false }));
      });

    // Node Circles
    nodeGroup.append("circle")
      .attr("r", (d) => d.data.name === selectedWord ? 12 : 8)
      .attr("fill", (d) => {
        if (d.data.name === selectedWord) return "#f97316"; // orange-500 selected
        return d.depth === 0 ? "#16a34a" : "#fff"; // Green root, White derived
      }) 
      .attr("stroke", (d) => d.depth === 0 ? "#16a34a" : "#f97316") // Orange border
      .attr("stroke-width", 3)
      .transition() // simple animation
      .duration(500)
      .attr("r", (d) => d.data.name === selectedWord ? 12 : 8);

    // Labels
    nodeGroup.append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => d.children ? -18 : 18)
      .style("text-anchor", (d) => d.children ? "end" : "start")
      .text((d) => d.data.name)
      .style("font-family", "Merriweather, serif")
      .style("font-size", (d) => d.data.name === selectedWord ? "16px" : "14px")
      .style("font-weight", (d) => d.data.name === selectedWord ? "bold" : "normal")
      .style("fill", "#292524"); // stone-800

  }, [root, derivatives, selectedWord]);

  return (
    <div className="w-full flex justify-center bg-white rounded-lg p-4 border border-stone-200 shadow-inner relative">
      <svg ref={svgRef} className="w-full h-auto max-w-2xl" />
      {tooltip.show && tooltip.data && (
        <div 
          className="fixed z-50 bg-stone-900 text-white p-3 rounded-lg shadow-xl max-w-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-bold text-orange-400 mb-1">{tooltip.data.word}</p>
          {tooltip.data.definition && <p className="text-sm text-stone-300">{tooltip.data.definition}</p>}
          {tooltip.data.definition_vi && <p className="text-sm text-stone-400 italic mt-1">{tooltip.data.definition_vi}</p>}
        </div>
      )}
    </div>
  );
};