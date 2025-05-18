import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { Flow, Project, Step, TreeNode } from '../services/models';

interface FlowTreeGraphProps {
  project: Project;
  flows: Flow[];
  steps: Step[];
}

export default function FlowTreeGraph({
  project,
  flows,
  steps,
}: FlowTreeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const navigate = useNavigate();

  // D3.js visualization
  useEffect(() => {
    if (
      !svgRef.current ||
      !project ||
      flows.length === 0 ||
      !containerRef.current
    )
      return;

    // Get actual dimensions from the container
    const containerRect = containerRef.current.getBoundingClientRect();
    const { width, height } = containerRect;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous drawing
    svg.selectAll('*').remove();

    // Create a container group for zooming
    const container = svg.append('g');

    // Setup zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4]) // Set min/max zoom scale
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    // Store zoom behavior in ref for access by button handlers
    zoomBehaviorRef.current = zoom;

    // Apply zoom behavior to svg
    svg.call(zoom);

    // Function to center the graph properly
    const centerGraph = (
      svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      graphContainer: d3.Selection<SVGGElement, unknown, null, undefined>,
      zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
      svgWidth: number,
      svgHeight: number,
    ) => {
      // Get the bounding box of the graph
      const bounds = graphContainer.node()?.getBBox();

      if (bounds) {
        // Calculate scale to fit the graph in the viewport with some padding
        const padding = 40;
        const scale =
          0.95 *
          Math.min(
            svgWidth / (bounds.width + padding),
            svgHeight / (bounds.height + padding),
          );

        // Calculate center point of the bounds
        const boundsCenterX = bounds.x + bounds.width / 2;
        const boundsCenterY = bounds.y + bounds.height / 2;

        // Calculate the viewport center
        const viewportCenterX = svgWidth / 2;
        const viewportCenterY = svgHeight / 2;

        // Calculate the translation needed to center
        const translateX = viewportCenterX - boundsCenterX * scale;
        const translateY = viewportCenterY - boundsCenterY * scale;

        // Apply the transform
        const transform = d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(scale);

        svgSelection
          .transition()
          .duration(750)
          .call(zoomBehavior.transform, transform);

        setZoomLevel(scale);
      }
    };

    // Double-click to zoom reset
    svg.on('dblclick.zoom', () => {
      centerGraph(svg, container, zoom, width, height);
    });

    // Simple tree layout
    const treeData: TreeNode = {
      name: project.name,
      children: flows.map((flow) => ({
        name: flow.name,
        children: steps
          .filter((step) => step.flowId === flow.id)
          .map((step) => ({
            name: step.name,
          })),
        // Add flow id to the data for click handling
        id: flow.id,
      })),
    };

    // Calculate tree layout - vertical orientation
    const horizontalPadding = 100;
    const verticalPadding = 80;
    const tree = d3
      .tree<TreeNode>()
      .size([width - horizontalPadding, height - verticalPadding])
      .separation((a, b) => (a.parent === b.parent ? 1.8 : 2.5)); // Increased separation for better readability

    const root = d3.hierarchy<TreeNode>(treeData);
    const nodes = tree(root);

    // Create a group for the tree content
    const g = container.append('g');

    const linker = d3
      .linkVertical<d3.HierarchyLink<TreeNode>, d3.HierarchyNode<TreeNode>>()
      // Use natural x,y coordinates for vertical layout
      .x((d) => d.x!)
      .y((d) => d.y!);

    // Draw links
    g.selectAll('.link')
      .data(nodes.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', (d) => linker(d))
      .attr('fill', 'none')
      .attr('stroke', '#888')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    // Draw nodes
    const node = g
      .selectAll('.node')
      .data(nodes.descendants())
      .join('g')
      .attr(
        'class',
        (d) => `node ${d.children ? 'node-internal' : 'node-leaf'}`,
      )
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Add circles to nodes
    node
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        if (d.depth === 0) return '#2f8bff';
        if (d.depth === 1) return '#70e000';
        return '#ffbe0b';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('filter', 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.4))');

    // Add click event to flow nodes (depth 1)
    node
      .filter((d) => d.depth === 1)
      .on('click', (event, d) => {
        // Navigate to flow details page
        const flowId = d.data.id;
        if (flowId) {
          navigate(`/flows/${flowId}`);
        }
      });

    // Make flow nodes cursor pointer to indicate clickable
    node.filter((d) => d.depth === 1).style('cursor', 'pointer');

    // Add labels to nodes - adjust position for vertical layout
    node
      .append('text')
      .attr('dy', '2em')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text((d) => {
        const { name } = d.data;
        return name.length > 15 ? `${name.substring(0, 12)}...` : name;
      })
      .attr('fill', '#fff')
      .clone(true)
      .lower()
      .attr('stroke', '#141414')
      .attr('stroke-width', 4);

    // Add a delay to ensure all DOM elements are rendered before centering
    setTimeout(() => {
      centerGraph(svg, g, zoom, width, height);
    }, 50);
  }, [flows, steps, project, navigate]);

  // Function to handle zoom in/out buttons
  const handleZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = zoomBehaviorRef.current;

    const currentTransform = d3.zoomTransform(svg.node()!);
    const newScale =
      direction === 'in' ? currentTransform.k * 1.2 : currentTransform.k / 1.2;

    svg
      .transition()
      .duration(300)
      .call(
        zoom.transform,
        currentTransform.scale(newScale / currentTransform.k),
      );

    setZoomLevel(newScale);
  };

  // Function to center the graph (extracted for use outside useEffect)
  const centerGraph = (
    svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    graphContainer: d3.Selection<any, unknown, null, undefined>,
    zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
    svgWidth: number,
    svgHeight: number,
  ) => {
    // Get the bounding box of the graph
    const bounds = graphContainer.node()?.getBBox();

    if (bounds) {
      // Calculate scale to fit the graph in the viewport with some padding
      const padding = 40;
      const scale =
        0.95 *
        Math.min(
          svgWidth / (bounds.width + padding),
          svgHeight / (bounds.height + padding),
        );

      // Calculate center point of the bounds
      const boundsCenterX = bounds.x + bounds.width / 2;
      const boundsCenterY = bounds.y + bounds.height / 2;

      // Calculate the viewport center
      const viewportCenterX = svgWidth / 2;
      const viewportCenterY = svgHeight / 2;

      // Calculate the translation needed to center
      const translateX = viewportCenterX - boundsCenterX * scale;
      const translateY = viewportCenterY - boundsCenterY * scale;

      // Apply the transform
      const transform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale);

      svgSelection
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, transform);

      setZoomLevel(scale);
    }
  };

  // Center the graph
  const handleCenterGraph = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current)
      return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('g').select('g');
    const zoom = zoomBehaviorRef.current;
    const { width, height } = containerRef.current.getBoundingClientRect();

    // Call the centerGraph function defined in useEffect
    centerGraph(svg, container, zoom, width, height);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative flex flex-col">
      <div className="absolute top-2 right-2 z-10 space-x-2">
        <Button
          icon={<ZoomOutOutlined />}
          onClick={() => handleZoom('out')}
          disabled={zoomLevel <= 0.2}
        />
        <Button
          icon={<ZoomInOutlined />}
          onClick={() => handleZoom('in')}
          disabled={zoomLevel >= 3.8}
        />
        <Button onClick={handleCenterGraph}>Center</Button>
      </div>
      <svg ref={svgRef} className="bg-[#141414] rounded-lg w-full h-full" />
      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}
