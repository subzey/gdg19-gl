/**
 * @param {[number, number]} pointA
 * @param {[number, number]} pointB
 * @return {Float32Array}
 */
export function geoDist([pointA, pointB]) {
	const vertexCount = 1;

	const canvasElement = document.createElement('canvas');
	const gl = canvasElement.getContext('webgl2');
	if (gl === null) { throw new Error('WebGL2 is not supported'); }

	gl.enable(gl.RASTERIZER_DISCARD);
	gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, gl.createTransformFeedback());

	const tfBuffer = gl.createBuffer();
	gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer);
	gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, vertexCount * 4, gl.STATIC_DRAW);


	const distProgram = createDistProgram(gl);

	// Setup
	gl.useProgram(distProgram);
	gl.vertexAttrib2fv(gl.getAttribLocation(distProgram, 'point_a'), pointA)
	gl.vertexAttrib2fv(gl.getAttribLocation(distProgram, 'point_b'), pointB);

	// Run
	gl.beginTransformFeedback(gl.POINTS);
	gl.drawArrays(gl.POINTS, 0, vertexCount);
	gl.endTransformFeedback();

	// Read back
	const typedArray = new Float32Array(vertexCount);
	gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, typedArray);

	return typedArray;
}

function createDistProgram(gl) {
	// Vertex shader
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, `#version 300 es
		precision highp float;
		in vec2 point_a;
		in vec2 point_b;
		flat out float dist;

		const float RADIANS_IN_DEGREE = 0.017453292519943295;
		const float EARTH_RADIUS_KM = 6371.0;

		void main() {
			float lat_a  = point_a[0] * RADIANS_IN_DEGREE;
			float long_a = point_a[1] * RADIANS_IN_DEGREE;
			float lat_b  = point_b[0] * RADIANS_IN_DEGREE;
			float long_b = point_b[1] * RADIANS_IN_DEGREE;

			dist = acos(
				clamp(
					sin(lat_a) * sin(lat_b) +
					cos(lat_a) * cos(lat_b) * cos(long_a - long_b),
					-1.0,
					1.0
				)
			) * EARTH_RADIUS_KM;
		}
	`);
	gl.compileShader(vertexShader);
	console.log('vertex shader', gl.getShaderInfoLog(vertexShader));

	// Frag shader
	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, `#version 300 es
		void main() {
		}
	`);
	gl.compileShader(fragmentShader);
	console.log('vertex shader', gl.getShaderInfoLog(fragmentShader));

	// Program
	const glProgram = gl.createProgram();
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.transformFeedbackVaryings(glProgram, ['dist'], gl.INTERLEAVED_ATTRIBS);
	gl.linkProgram(glProgram);
	console.log('gl program', gl.getProgramInfoLog(glProgram));

	return glProgram;
}