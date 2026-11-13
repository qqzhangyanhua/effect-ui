import { compileShader, type GlContext } from "./gl/gl-loop"

export interface FieldProgram {
  program: WebGLProgram
  loc: (name: string) => WebGLUniformLocation | null
}

function vert(webgl2: boolean) {
  const head = webgl2 ? "#version 300 es\nin vec2 a;\nout vec2 uv;\n" : "attribute vec2 a;\nvarying vec2 uv;\n"
  return `${head}void main(){uv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}`
}

function frag(webgl2: boolean, body: string) {
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 uv;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision highp float;\nvarying vec2 uv;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  return head + body
}

export function fieldVertex(webgl2: boolean) {
  return vert(webgl2)
}

/** 把字节种子写进模拟纹理。 */
export function fieldSeed(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uSeed;
void main() {
  WRITE = TEX(uSeed, uv);
}
`,
  )
}

/** Gray-Scott 一步。五点和拉普拉斯，扩散 0.16 / 0.08，欧拉步长 1，强度只乘反应项。 */
export function fieldStep(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec2 uRates;
uniform float uReact;
void main() {
  vec2 c = TEX(uState, uv).rg;
  vec2 n = TEX(uState, uv + vec2(0.0, uTexel.y)).rg;
  vec2 s = TEX(uState, uv - vec2(0.0, uTexel.y)).rg;
  vec2 e = TEX(uState, uv + vec2(uTexel.x, 0.0)).rg;
  vec2 w = TEX(uState, uv - vec2(uTexel.x, 0.0)).rg;
  vec2 lap = n + s + e + w - 4.0 * c;
  float u = c.r;
  float v = c.g;
  float react = clamp(uReact, 0.0, 1.0);
  float uvv = u * v * v * react;
  float feed = uRates.x;
  float kill = uRates.y;
  float nu = u + (0.16 * lap.r - uvv + feed * react * (1.0 - u));
  float nv = v + (0.08 * lap.g + uvv - (feed + kill) * react * v);
  WRITE = vec4(clamp(nu, 0.0, 1.0), clamp(nv, 0.0, 1.0), 0.0, 1.0);
}
`,
  )
}

/** 催化剂浓度乘上着色比例，混进三色。 */
export function fieldDisplay(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uState;
uniform vec3 uBg;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uScale;
void main() {
  float chem = clamp(TEX(uState, uv).g, 0.0, 1.0);
  vec3 ink = mix(uA, uB, smoothstep(0.0, 1.0, uv.x));
  ink = mix(ink, uC, smoothstep(0.0, 1.0, uv.y) * 0.65);
  WRITE = vec4(mix(uBg, ink, chem * uScale), 1.0);
}
`,
  )
}

function compile(gl: GlContext, vertex: string, fragment: string): FieldProgram | null {
  const program = gl.createProgram()
  if (!program) return null
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertex)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment)
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    gl.deleteProgram(program)
    return null
  }
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, "a")
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return { program, loc: (name) => gl.getUniformLocation(program, name) }
}

export function compileField(gl: GlContext, webgl2: boolean): [FieldProgram, FieldProgram, FieldProgram] | null {
  const vertex = fieldVertex(webgl2)
  const seed = compile(gl, vertex, fieldSeed(webgl2))
  const step = compile(gl, vertex, fieldStep(webgl2))
  const display = compile(gl, vertex, fieldDisplay(webgl2))
  if (!seed || !step || !display) {
    if (seed) gl.deleteProgram(seed.program)
    if (step) gl.deleteProgram(step.program)
    if (display) gl.deleteProgram(display.program)
    return null
  }
  return [seed, step, display]
}
