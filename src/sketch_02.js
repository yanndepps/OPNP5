/*
 * Sketch_02 -> Flowers
 * © Ahmad Moussa || Gorilla Sun
 * Recoded
 * sizes, new colors & rnd seeds
 */

const canvasSketch = require('canvas-sketch');
const rnd = require('canvas-sketch-util/random');
const risoColors = require('riso-colors');
const p5 = require('p5');
new p5();

// set a seed
const seed = rnd.getRandomSeed();

// seed to recreate a sketch
// const seed = 371705;
// rnd.setSeed(seed);

const settings = {
	p5: true,
	dimensions: [640, 640],
	animate: false,
	context: '2d',
	name: seed,
};

const radius = rnd.range(110, 140);
const numPartitions = 6;

const bgColor = rnd.pick(risoColors).hex;
const palettes = [
	rnd.pick(risoColors),
	rnd.pick(risoColors),
	rnd.pick(risoColors),
	rnd.pick(risoColors)
];
let wx, wy;

const sketch = ({ width, height }) => {
	// seed
	// rnd.setSeed(seed);

	// sizes
	const dim = min(width, height);
	const w = dim;
	wx = w;
	wy = w;

	angleMode(DEGREES);
	return ({ context }) => {
		background(bgColor);
		strokeWeight(2);
		drawBackgroundParticles();

		translate(wx / 2, wy / 3);
		stroke(2);
		strokeWeight(dim * 0.003);

		drawStem();
		drawFlowerHead(context);

		// translate(0, wy / 1.90);
		// drawFlowerHead(context);
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
		// let randOfst = random(-15, 15);
		let randOfst = rnd.range(-15, 15);
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
			curveVertex(curveVertices[c][0] + t + rnd.value(3), curveVertices[c][1]);
		}
		endShape();
	}
}

// fn to draw petals
function drawFlowerHead(context) {
	// DRAW Center
	fill(rnd.pick(palettes).hex);
	noStroke();
	ellipse(rnd.range(-10, 10), rnd.range(-10, 10), rnd.range(radius / 2, radius / 1.5));

	// draw petals
	const vertexArraysFill = [];
	const vertexArraysOutline = [];

	const parts = getPartitions(360);

	let a = 0;
	let div = 1;
	for (let n = 0; n < parts.length - 1; n++) {
		a += parts[n];
		div = parts[(n + 1) % parts.length];

		let rad = rnd.range(radius - radius / 8, radius);

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

	let roundFactor = rnd.range(15, 25);

	for (let n = 0; n < vertexArraysFill.length; n++) {
		context.fillStyle = color(rnd.pick(palettes).hex);
		context.beginPath();
		roundedPoly(context, vertexArraysFill[n], roundFactor);
		context.fill();
	}

	for (let n = 0; n < vertexArraysOutline.length; n++) {
		// drawingContext.setLineDash([rnd.range(2, 5), rnd.range(2, 5)]);
		context.fillStyle = color(rnd.pick(palettes).hex);
		noFill();
		stroke(0);
		context.beginPath();
		roundedPoly(context, vertexArraysOutline[n], roundFactor);
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
		partitions.push(rnd.range(max / (numP * 3), max / numP));
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
	for (let x = padding; x < wx - padding + 0.1; x += spcX) {
		for (let y = padding; y < wy - padding + 0.1; y += spcY) {
			stroke(rnd.pick(palettes).hex);
			strokeWeight(rnd.value() * 3);
			point(x, y);

			if (rnd.value() > 0.95) {
				stroke(rnd.pick(palettes).hex);
				strokeWeight(rnd.value() * 2);
				ellipse(x, y, rnd.range(1, 6));
			}
		}
	}
}

canvasSketch(sketch, settings);
