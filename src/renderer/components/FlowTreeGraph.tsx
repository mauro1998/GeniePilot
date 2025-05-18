import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
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
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({
    x: 0,
    y: 0,
    name: '',
  });

  // Color theme
  const colors = useMemo(
    () => ({
      background: '#131722',
      rootNode: '#4361ee',
      flowNode: '#3a86ff',
      stepNode: '#7209b7',
      linkColor: '#6c757d',
      linkHighlight: '#f8f9fa',
      textPrimary: '#f8f9fa',
      textShadow: '#000814',
    }),
    [],
  );

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

    // Add a subtle grid pattern
    const defs = svg.append('defs');
    const pattern = defs
      .append('pattern')
      .attr('id', 'grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern
      .append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-width', 1);

    // Apply grid pattern
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#grid)');

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
        const padding = 60;
        const scale =
          0.9 *
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
            id: step.id,
            parentId: flow.id,
          })),
        // Add flow id to the data for click handling
        id: flow.id,
      })),
    };

    // Calculate tree layout - vertical orientation
    const horizontalPadding = 150;
    const verticalPadding = 130;
    const tree = d3
      .tree<TreeNode>()
      .size([width - horizontalPadding, height - verticalPadding])
      .separation((a, b) => (a.parent === b.parent ? 2.5 : 3.2)); // Increased separation for better readability

    const root = d3.hierarchy<TreeNode>(treeData);
    const nodes = tree(root);

    // Create a group for the tree content
    const g = container.append('g');

    // Add subtle curved links
    const linker = d3
      .linkVertical<d3.HierarchyLink<TreeNode>, d3.HierarchyNode<TreeNode>>()
      .x((d) => d.x!)
      .y((d) => d.y!);

    // Add node links with animation
    const links = g
      .selectAll('.link')
      .data(nodes.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', (d) => linker(d))
      .attr('fill', 'none')
      .attr('stroke', colors.linkColor)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .style('transition', 'stroke 0.3s ease, stroke-opacity 0.3s ease')
      .attr('stroke-dasharray', function () {
        const element = this as SVGPathElement;
        if (element) {
          const length = element.getTotalLength();
          return `${length} ${length}`;
        }
        return '';
      })
      .attr('stroke-dashoffset', function () {
        const element = this as SVGPathElement;
        if (element) {
          return element.getTotalLength();
        }
        return 0;
      });

    // Animate links
    links.transition().duration(1500).attr('stroke-dashoffset', 0);

    // Draw nodes
    const node = g
      .selectAll('.node')
      .data(nodes.descendants())
      .join('g')
      .attr(
        'class',
        (d) => `node ${d.children ? 'node-internal' : 'node-leaf'}`,
      )
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        // Highlight connected links
        g.selectAll('.link')
          .filter((link) => {
            const typedLink = link as d3.HierarchyLink<TreeNode>;
            return typedLink.source === d || typedLink.target === d;
          })
          .transition()
          .duration(300)
          .attr('stroke', colors.linkHighlight)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', 3);

        // Show tooltip
        setTooltipContent({
          x: event.pageX,
          y: event.pageY,
          name: d.data.name,
        });
        setShowTooltip(true);
      })
      .on('mouseout', function () {
        // Reset link styles
        g.selectAll('.link')
          .transition()
          .duration(300)
          .attr('stroke', colors.linkColor)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', 2.5);

        setShowTooltip(false);
      });

    // Add glowing effect for nodes
    const glowFilter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Add fancy node backgrounds
    node
      .append('circle')
      .attr('r', (d) => (d.depth === 0 ? 18 : 15))
      .attr('fill', (d) => {
        if (d.depth === 0) return colors.rootNode;
        if (d.depth === 1) return colors.flowNode;
        return colors.stepNode;
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')
      .style('transition', 'r 0.3s ease, fill 0.3s ease')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', (d: any) => (d.depth === 0 ? 21 : 18))
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', (d: any) => (d.depth === 0 ? 18 : 15))
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
      });

    // Handle node click
    node.on('click', (event, d) => {
      if (d.depth === 0) {
        // Project node - can show project details
        return;
      }

      if (d.depth === 1 && d.data.id) {
        // Flow node - navigate to flow details
        setSelectedNode({ id: d.data.id, name: d.data.name });
        navigate(`/flows/${d.data.id}`);
      }

      if (d.depth === 2 && d.data.id) {
        // Step node - navigate to step details
        setSelectedNode({ id: d.data.id, name: d.data.name });
        navigate(`/flows/${d.data.parentId}/steps/configure`);
      }
    });

    // Add text labels with better styling
    node
      .append('text')
      .attr('dy', (d) => (d.depth === 2 ? '3.2em' : '3.6em'))
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', (d) => (d.depth === 0 ? '15px' : '13px'))
      .attr('fill', colors.textPrimary)
      .text((d) => {
        const { name } = d.data;
        return name.length > 15 ? `${name.substring(0, 12)}...` : name;
      })
      .attr('filter', 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))');

    // Add icons to nodes
    node
      .append('text')
      .attr('dy', '0.5em')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'FontAwesome')
      .attr('font-size', (d) => (d.depth === 0 ? '14px' : '12px'))
      .attr('fill', '#ffffff')
      .text((d) => {
        if (d.depth === 0) return 'P'; // Project icon
        if (d.depth === 1) return 'F'; // Flow icon
        return '▶'; // Step icon
      });

    // Add a delay to ensure all DOM elements are rendered before centering
    setTimeout(() => {
      centerGraph(svg, g, zoom, width, height);
    }, 50);
  }, [flows, steps, project, navigate, colors]);

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
      const padding = 60;
      const scale =
        0.9 *
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

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative flex flex-col">
      {/* Control panel */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <div className="flex items-center bg-black/40 rounded-lg p-1 backdrop-blur-sm">
          <Tooltip title="Zoom In">
            <Button
              type="text"
              icon={<ZoomInOutlined className="text-white" />}
              onClick={() => handleZoom('in')}
              disabled={zoomLevel >= 3.8}
              className="hover:bg-white/20"
            />
          </Tooltip>
          <Tooltip title="Zoom Out">
            <Button
              type="text"
              icon={<ZoomOutOutlined className="text-white" />}
              onClick={() => handleZoom('out')}
              disabled={zoomLevel <= 0.2}
              className="hover:bg-white/20"
            />
          </Tooltip>
          <Tooltip title="Center Graph">
            <Button
              type="text"
              onClick={handleCenterGraph}
              className="text-white hover:bg-white/20"
            >
              Center
            </Button>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <Button
              type="text"
              icon={<FullscreenOutlined className="text-white" />}
              onClick={toggleFullscreen}
              className="hover:bg-white/20"
            />
          </Tooltip>
        </div>

        {selectedNode && (
          <div className="bg-black/40 text-white rounded-lg p-2 backdrop-blur-sm max-w-[200px]">
            <div className="text-sm font-bold flex items-center gap-1">
              <InfoCircleOutlined /> Selected Node
            </div>
            <div className="text-xs opacity-90 truncate">
              {selectedNode.name}
            </div>
          </div>
        )}
      </div>

      {/* Main SVG graph */}
      <svg
        ref={svgRef}
        className="w-full h-full rounded-lg"
        style={{ background: colors.background }}
      />

      {/* Custom tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 bg-black/80 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm"
          style={{
            left: `${tooltipContent.x + 10}px`,
            top: `${tooltipContent.y - 40}px`,
            transition: 'all 0.2s ease-out',
            pointerEvents: 'none',
          }}
        >
          <div className="font-bold">{tooltipContent.name}</div>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-black/40 text-white px-3 py-1 rounded-lg backdrop-blur-sm flex items-center gap-2">
        <ZoomInOutlined />
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* Instruction hint */}
      <div className="absolute bottom-3 left-3 bg-black/40 text-white/80 px-3 py-1 rounded-lg backdrop-blur-sm text-xs">
        Double-click to center • Click node to navigate
      </div>
    </div>
  );
}
