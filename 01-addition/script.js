/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
export function addNumbers(a, b) {
	const vertexCount = 1;

	const canvasElement = document.createElement('canvas');
	const gl = canvasElement.getContext('webgl2');
	if (gl === null) { throw new Error('WebGL2 is not supported'); }

	gl.enable(gl.RASTERIZER_DISCARD);
	gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, gl.createTransformFeedback());

	const tfBuffer = gl.createBuffer();
	gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer);
	gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, vertexCount * 4, gl.STATIC_DRAW);

	// Vertex shader
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, `#version 300 es
		in float a;
		in float b;
		flat out float result;

		void main() {
			result = a + b;
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
	gl.transformFeedbackVaryings(glProgram, ['result'], gl.INTERLEAVED_ATTRIBS);
	gl.linkProgram(glProgram);
	console.log('gl program', gl.getProgramInfoLog(glProgram));

	// Setup
	gl.useProgram(glProgram);
	gl.vertexAttrib1f(gl.getAttribLocation(glProgram, 'a'), a);
	gl.vertexAttrib1f(gl.getAttribLocation(glProgram, 'b'), b);

	// Run
	gl.beginTransformFeedback(gl.POINTS);
	gl.drawArrays(gl.POINTS, 0, vertexCount);
	gl.endTransformFeedback();

	// Read back
	const typedArray = new Float32Array(vertexCount);
	gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, typedArray);

	return typedArray[0];
}
