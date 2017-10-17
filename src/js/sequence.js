/**
 * Modification of the source code found here : https://bl.ocks.org/kerryrodden/766f8f6d31f645c39f488a0befa1e3c8
 */
const { d3 } = window;
const quorom = 10;

// Dimensions of sunburst.
const width = 750;
const height = 600;
const radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
const b = {
  w: 125, h: 30, s: 3, t: 10,
};

// Mapping of step names to colors.
const colors = {
  open: '#32e875',
  closed: '#c06c7f',
};

const defaultColors = ['#6ca0f1', '#357ded'];

const vis = d3.select('#chart').append('svg:svg')
  .attr('width', width)
  .attr('height', height)
  .append('svg:g')
  .attr('id', 'container')
  .attr('transform', `translate(${width / 2},${height / 2})`);

const partition = d3.layout.partition()
  .size([2 * Math.PI, radius * radius])
  .value(d => d.size);

const arc = d3.svg.arc()
  .startAngle(d => d.x)
  .endAngle(d => d.x + d.dx)
  .innerRadius(d => Math.sqrt(d.y))
  .outerRadius(d => Math.sqrt(d.y + d.dy));

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  const path = [];
  let current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  const trail = d3.select('#sequence').append('svg:svg')
    .attr('width', width)
    .attr('height', 50)
    .attr('id', 'trail');
  // Add the label at the end, for the percentage.
  trail.append('svg:text')
    .attr('id', 'endlabel')
    .style('fill', '#000');
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  const points = [];
  points.push('0,0');
  points.push(`${b.w},0`);
  points.push(`${b.w + b.t},${b.h / 2}`);
  points.push(`${b.w},${b.h}`);
  points.push(`0,${b.h}`);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${b.t},${b.h / 2}`);
  }
  return points.join(' ');
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {
  // Data join; key function combines name and depth (= position in sequence).
  const g = d3.select('#trail')
    .selectAll('g')
    .data(nodeArray, d => d.name + d.depth);

  // Add breadcrumb and label for entering nodes.
  const entering = g.enter().append('svg:g');

  entering.append('svg:polygon')
    .attr('points', breadcrumbPoints)
    .style('fill', d => colors[d.name] || defaultColors[d.rank % defaultColors.length]);

  entering.append('svg:text')
    .attr('x', (b.w + b.t) / 2)
    .attr('y', b.h / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.name);

  // Set position for entering and updating nodes.
  g.attr('transform', (d, i) => `translate(${i * (b.w + b.s)}, 0)`);

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select('#trail').select('#endlabel')
    .attr('x', (nodeArray.length + 0.5) * (b.w + b.s))
    .attr('y', b.h / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select('#trail')
    .style('visibility', '');
}

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
  const percentageString = `${d.value}`;
  const textForClosed = ' of them have been ';
  const textForOpen = ' of them are still ';

  const percentageStr = ' issues have been created by ';

  switch (d.name) {
    case 'open':
      d3.select('#percentage')
        .text(d.value);
      d3.select('#info-text-nbIssues')
        .text(textForOpen)
        .style('font-size', '1em');
      d3.select('#info-text-info-repo')
        .text(`${d.name}ed`);
      break;
    case 'closed':
      d3.select('#percentage')
        .text(d.value);
      d3.select('#info-text-nbIssues')
        .text(textForClosed)
        .style('font-size', '1em');
      d3.select('#info-text-info-repo')
        .text(d.name);
      break;
    default:
      d3.select('#percentage')
        .text(percentageString);
      d3.select('#info-text-nbIssues')
        .text(percentageStr)
        .style('font-size', '1em');
      d3.select('#info-text-info-repo')
        .text(`${d.name}.`);
  }

  d3.select('#explanation')
    .style('top', '240px');

  const sequenceArray = getAncestors(d);
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll('path')
    .style('opacity', 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll('path')
    .filter(node => (sequenceArray.indexOf(node) >= 0))
    .style('opacity', 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave() {
  // Hide the breadcrumb trail
  d3.select('#trail')
    .style('visibility', 'hidden');

  // Deactivate all segments during transition.
  d3.selectAll('path').on('mouseover', null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll('path')
    .transition()
    .duration(1000)
    .style('opacity', 1)
    .each('end', function over() {
      d3.select(this).on('mouseover', mouseover);
    });

  d3.select('#percentage')
    .text('');

  d3.select('#info-text-nbIssues')
    .text('Touch me !')
    .style('font-size', '2.5em');

  d3.select('#info-text-info-repo')
    .text('');

  d3.select('#explanation')
    .style('top', '210px');
}

function drawLegend() {
  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  const li = {
    w: 75, h: 30, s: 3, r: 3,
  };

  const legend = d3.select('#legend').append('svg:svg')
    .attr('width', li.w)
    .attr('height', d3.keys(colors).length * (li.h + li.s));

  const g = legend.selectAll('g')
    .data(d3.entries(colors))
    .enter().append('svg:g')
    .attr('transform', (d, i) => `translate(0,${i * (li.h + li.s)})`);

  g.append('svg:rect')
    .attr('rx', li.r)
    .attr('ry', li.r)
    .attr('width', li.w)
    .attr('height', li.h)
    .style('fill', d => d.value);

  g.append('svg:text')
    .attr('x', li.w / 2)
    .attr('y', li.h / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.key);
}

function toggleLegend() {
  const legend = d3.select('#legend');
  if (legend.style('visibility') === 'hidden') {
    legend.style('visibility', '');
  } else {
    legend.style('visibility', 'hidden');
  }
}

function buildHierarchy(data) {
  const root = { name: 'root', children: [] };
  const users = {};
  for (let i = 0; i < data.issues.length; i += 1) {
    const issue = data.issues[i];
    if (users[issue.user.login] === undefined) {
      users[issue.user.login] = {};
    }

    if (users[issue.user.login][issue.state] === undefined) {
      users[issue.user.login][issue.state] = [];
    }
    users[issue.user.login][issue.state].push(issue);
  }

  Object.entries(users).forEach(([login, states]) => {
    let size = 0;
    const currUserNode = { name: login, children: [] };

    Object.entries(states).forEach(([state, issues]) => {
      size += issues.length;
      const currStateNode = { name: state, size: issues.length };
      currUserNode.children.push(currStateNode);
    });

    if (size >= quorom) {
      root.children.push(currUserNode);
    }
  });

  function getSize(d) {
    let size = 0;

    if (d.children !== undefined) {
      size = d.children.reduce((total, e) => total + getSize(e), 0);
    }

    if (d.size !== undefined) {
      size += d.size;
    }
    return size;
  }

  root.children.sort((d1, d2) => getSize(d2) - getSize(d1));
  for (let i = 0; i < root.children.length; i += 1) {
    root.children[i].rank = i;
  }
  return root;
}

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {
  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  drawLegend();
  d3.select('#togglelegend').on('click', toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append('svg:circle')
    .attr('r', radius)
    .style('opacity', 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  const nodes = partition.nodes(json)
    .filter(d => (d.dx > 0.005)); // 0.005 radians = 0.29 degrees

  vis.data([json]).selectAll('path')
    .data(nodes)
    .enter()
    .append('svg:path')
    .attr('display', d => (d.depth ? null : 'none'))
    .attr('d', arc)
    .attr('fill-rule', 'evenodd')
    .style('fill', d => colors[d.name] || defaultColors[d.rank % defaultColors.length])
    .style('opacity', 1)
    .on('mouseover', mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select('#container').on('mouseleave', mouseleave);
}

d3.json('repo.json', (data) => {
  d3.select('#header-repo-name')
    .text(`${data.owner}/${data.repo}`);

  d3.select('#header-nb-issues')
    .text(data.issues.length);

  d3.select('#info-crawl')
    .text(new Date(data.date_crawl).toISOString().slice(0, 10));

  const json = buildHierarchy(data);
  createVisualization(json);
});
