/*
 * Sketch_01 -> Flowers
 * © Ahmad Moussa || Gorilla Sun
 * Recoded
 * Partition a circle into rnd chunks
 * Draw triangles with rounded corners into
 * those partitions
 */

const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
new p5();

const settings = {
	p5: true,
	dimensions: [640, 640],
	animate: false,
	context: '2d',
};

let radius;
const numPartitions = 6;
const palettes = [
	["#007f5f", "#2b9348", "#55a630", "#80b918", "#aacc00",
		"#bfd200", "#d4d700", "#dddf00", "#eeef20", "#ffff3f"],
	["#f72585", "#b5179e", "#7209b7", "#560bad", "#480ca8",
		"#3a0ca3", "#3f37c9", "#4361ee", "#4895ef", "#4cc9f0"],
	["#ff165d", "#ff9a00", "#f6f7d7", "#3ec1d3"],
	["#d7263d", "#f46036", "#2e294e", "#1b998b", "#c5d86d"],
	["#0a0a0a", "#f7f3f2", "#0077e1", "#f5d216", "#fc3503"]
];

let palette;
let wx, wy;

const sketch = ({ width, height }) => {
	let w = min(width, height);
	wx = w;
	wy = w;

	let stemStr = floor(w * 0.0035);
	// console.log(stemStr);

	palette = random(palettes);
	// console.log(dim);
	// console.log(palette);
	angleMode(DEGREES);
	return ({ context }) => {
		background('#fdebd3');
		strokeWeight(2);
		drawBackgroundParticles();

		push();
		translate(wx / 2, wy / 4);
		stroke(2);
		strokeWeight(stemStr);
		drawStem();
		radius = 110;
		drawFlowerHead(context, radius);
		pop();

		push();
		translate(wx / 2, wy / 1.30);
		stroke(2);
		strokeWeight(stemStr);
		// drawStem();
		radius = 110;
		drawFlowerHead(context, radius);
		pop();

		push();
		translate(wx / 1.3, wy / 2);
		stroke(2);
		strokeWeight(stemStr);
		drawStem();
		radius = 90;
		drawFlowerHead(context, radius);
		pop();
	};
};

// fn to draw stem
function drawStem() {
	const spacing = 30;
	noFill();

	const curveVertices = [];

	// positions curvevertex positions and stores them in an array
	beginShape();
	for (let y = 0; y < (wy / 3) * 2; y += spacing) {
		let randOfst = random(-15, 15);
		curveVertex(randOfst, y);

		curveVertices.push([randOfst, y]);
	}
	curveVertex(0, wy - wy / 3);
	curveVertex(0, wy - wy / 3);

	curveVertices.push([0, wy - wy / 3]);
	curveVertices.push([0, wy - wy / 3]);
	endShape();

	// duplicate stem several times with little variations
	// by making use of the stared positions in the array
	for (let t = 0; t < 3; t++) {
		beginShape();
		for (let c = 0; c < curveVertices.length; c++) {
			curveVertex(curveVertices[c][0] + t + random(3), curveVertices[c][1]);
		}
		endShape();
	}
}

// fn to draw petals
function drawFlowerHead(context, radius) {
	// DRAW Center
	fill(random(palette));
	noStroke();
	ellipse(random(-10, 10), random(-10, 10), random(radius / 2, radius / 1.5));

	// draw petals
	const vertexArraysFill = [];
	const vertexArraysOutline = [];

	const parts = getPartitions(360);

	let a = 0;
	let div = 1;
	for (let n = 0; n < parts.length - 1; n++) {
		a += parts[n];
		div = parts[(n + 1) % parts.length];

		let rad = random(radius - radius / 8, radius);

		let x1 = rad * cos(a);
		let y1 = rad * sin(a);

		// debug
		// line(0, 0, x1, y1)
		// textSize(16)
		// fill(0)
		// text(n + '', x1, y1)

		let x2 = rad * cos(a + div - div / 8);
		let y2 = rad * sin(a + div - div / 8);

		// fill coordinates
		let currentVertecis = [];
		currentVertecis.push({ x: x1, y: y1 });
		currentVertecis.push({ x: x2, y: y2 });
		currentVertecis.push({ x: 0, y: 0 });
		vertexArraysFill.push(currentVertecis);

		// stroke coordinates
		let ofst = 5;
		currentVertecis = [];
		currentVertecis.push({ x: x1 - ofst, y: y1 - ofst });
		currentVertecis.push({ x: x2 - ofst, y: y2 - ofst });
		currentVertecis.push({ x: 0 - ofst, y: 0 - ofst });
		vertexArraysOutline.push(currentVertecis);
	}

	for (let n = 0; n < vertexArraysFill.length; n++) {
		context.fillStyle = color(random(palette));
		context.beginPath();
		roundedPoly(context, vertexArraysFill[n], 15);
		context.fill();
	}

	for (let n = 0; n < vertexArraysOutline.length; n++) {
		// drawingContext.setLineDash([random(2, 5), random(2, 5)]);
		context.fillStyle = color(random(palette));
		noFill();
		stroke(0);
		context.beginPath();
		roundedPoly(context, vertexArraysOutline[n], 15);
		context.stroke();
	}
}

// helper fn
// divides 360 degress into randomly partitioned angles
// these make up the angles of the leaves
function getPartitions(max) {
	partitions = [0];
	numP = abs(numPartitions)
	while (
		partitions.reduce(function (a, b) {
			return a + b;
		}, 0) < max
	) {
		partitions.push(random(max / (numP * 3), max / numP));
	}

	// if last partition larger than max
	// we remove it and add one that fills the circle exactly
	if (
		partitions.reduce(function (a, b) {
			return a + b;
		}, 0) > max
	) {
		partitions.pop();
		partitions.push(
			max -
			partitions.reduce(function (a, b) {
				return a + b;
			}, 0)
		);
	}

	return partitions;
}

// function for making rounded triangles
// source: https://stackoverflow.com/a/44856925/6688750
function roundedPoly(context, points, radiusAll) {
	let i, x, y, len, p1, p2, p3, v1, v2, sinA, sinA90, radDirection, drawDirection, angle, halfAngle, cRadius, lenOut, radius;

	// convert 2 points into vector form, polar form, and normalised
	const asVec = function (p, pp, v) {
		v.x = pp.x - p.x;
		v.y = pp.y - p.y;
		v.len = Math.sqrt(v.x * v.x + v.y * v.y);
		v.nx = v.x / v.len;
		v.ny = v.y / v.len;
		v.ang = Math.atan2(v.ny, v.nx);
	};
	radius = radiusAll;
	v1 = {};
	v2 = {};
	len = points.length;
	p1 = points[len - 1];
	// for each point
	for (i = 0; i < len; i++) {
		p2 = points[i % len];
		p3 = points[(i + 1) % len];

		asVec(p2, p1, v1);
		asVec(p2, p3, v2);
		sinA = v1.nx * v2.ny - v1.ny * v2.nx;
		sinA90 = v1.nx * v2.nx - v1.ny * -v2.ny;
		angle = Math.asin(sinA < -1 ? -1 : sinA > 1 ? 1 : sinA);

		radDirection = 1;
		drawDirection = false;
		if (sinA90 < 0) {
			if (angle < 0) {
				angle = Math.PI + angle;
			} else {
				angle = Math.PI - angle;
				radDirection = -1;
				drawDirection = true;
			}
		} else {
			if (angle > 0) {
				radDirection = -1;
				drawDirection = true;
			}
		}
		if (p2.radius !== undefined) {
			radius = p2.radius;
		} else {
			radius = radiusAll;
		}

		halfAngle = angle / 2;

		lenOut = Math.abs((Math.cos(halfAngle) * radius) / Math.sin(halfAngle));

		if (lenOut > Math.min(v1.len / 2, v2.len / 2)) {
			lenOut = Math.min(v1.len / 2, v2.len / 2);
			cRadius = Math.abs((lenOut * Math.sin(halfAngle)) / Math.cos(halfAngle));
		} else {
			cRadius = radius;
		}

		x = p2.x + v2.nx * lenOut;
		y = p2.y + v2.ny * lenOut;

		x += -v2.ny * cRadius * radDirection;
		y += v2.nx * cRadius * radDirection;

		context.arc(
			x,
			y,
			cRadius,
			v1.ang + (Math.PI / 2) * radDirection,
			v2.ang - (Math.PI / 2) * radDirection,
			drawDirection
		);

		p1 = p2;
		p2 = p3;
	}
	context.closePath();
}

// fn to draw particles on the side
function drawBackgroundParticles() {
	const padding = max(wx, wy) / 30;
	const spacing = 8;

	const numX = int((wx - padding * 2) / spacing);
	const numY = int((wy - padding * 2) / spacing);

	const spcX = (wx - padding * 2) / numX;
	const spcY = (wy - padding * 2) / numY;

	noFill();
	for (let x = padding; x < wx * 0.5; x += spcX) {
		for (let y = padding; y < wy - padding + 0.1; y += spcY) {
			stroke(random(palette));
			strokeWeight(random(3));
			point(x, y);

			if (random() > 0.95) {
				stroke(random(palette));
				strokeWeight(random(2));
				ellipse(x, y, random(1, 5));
			}
		}
	}
}

canvasSketch(sketch, settings);
