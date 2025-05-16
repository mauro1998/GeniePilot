import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Empty, Card } from 'antd';
import {
  PlusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import * as d3 from 'd3';

const { Title, Text } = Typography;

interface Screen {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Path {
  id: string;
  name: string;
  screens: Screen[];
}

// Define interfaces for the tree data structure
interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Mock data - in a real app, this would come from a store or API
  const [project] = useState({
    id,
    name: 'Demo Project',
    description: 'This is a demonstration project',
  });

  const [paths] = useState<Path[]>([
    // Uncomment for mock data
    // {
    //   id: '1',
    //   name: 'Login Flow',
    //   screens: [
    //     { id: 's1', name: 'Login Screen' },
    //     { id: 's2', name: 'Dashboard' },
    //   ],
    // },
  ]);

  // D3.js visualization
  useEffect(() => {
    if (!svgRef.current || paths.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 400;

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

    // Apply zoom behavior to svg
    svg.call(zoom);

    // Double-click to zoom reset
    svg.on('dblclick.zoom', () => {
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
      setZoomLevel(1);
    });

    // Simple tree layout
    const treeData: TreeNode = {
      name: project.name,
      children: paths.map((path) => ({
        name: path.name,
        children: path.screens.map((screen) => ({
          name: screen.name,
        })),
      })),
    };

    // Calculate tree layout - vertical orientation (width, height instead of height, width)
    const tree = d3
      .tree<TreeNode>()
      .size([width - 100, height - 150]) // Adjust vertical space to be smaller
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2)); // Control node separation

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

    // Center the tree in the canvas
    // Calculate the bounding box of the graph
    const bounds = g.node()?.getBBox();
    if (bounds) {
      // Calculate the translation needed to center the graph
      const centerX = (width - bounds.width) / 2 - bounds.x;
      const centerY = (height - bounds.height) / 2 - bounds.y;

      // Apply the centered transform
      g.attr('transform', `translate(${centerX}, ${centerY})`);

      // Initialize with a centered view
      svg.call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY));

      // Set the panning bounds - allow panning just beyond the content bounds
      // Add some padding (50px) around the graph bounds to give some space
      const padding = 100;
      zoom.translateExtent([
        [bounds.x - padding, bounds.y - padding],
        [bounds.x + bounds.width + padding, bounds.y + bounds.height + padding],
      ]);
    }
  }, [paths, project.name]);

  // Function to handle zoom in/out buttons
  const handleZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();

    const currentTransform = d3.zoomTransform(svg.node()!);
    const scale =
      direction === 'in' ? currentTransform.k * 1.2 : currentTransform.k / 1.2;

    svg
      .transition()
      .duration(300)
      .call(zoom.transform, currentTransform.scale(scale / currentTransform.k));
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <Title level={2}>{project.name}</Title>
        <Text>{project.description}</Text>
      </div>

      <Card className="mb-8 bg-[#1f1f1f]">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Paths</Title>
          <div className="flex space-x-2">
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
            <Button type="primary" icon={<PlusOutlined />}>
              Add Path
            </Button>
          </div>
        </div>

        {paths.length > 0 ? (
          <div className="w-full">
            <div className="relative">
              <svg
                ref={svgRef}
                width="100%"
                height="400"
                className="bg-[#141414] rounded-lg"
              />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
          </div>
        ) : (
          <Empty
            description="No paths found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text className="mb-4 block">
              Paths represent user journeys through your application.
            </Text>
            <Button type="primary" icon={<PlusOutlined />}>
              Add Your First Path
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}
