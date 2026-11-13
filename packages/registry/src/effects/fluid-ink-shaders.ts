function vert(webgl2: boolean) {
  const head = webgl2 ? "#version 300 es\nin vec2 a;\nout vec2 v;\n" : "attribute vec2 a;\nvarying vec2 v;\n"
  return `${head}void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}`
}

function frag(webgl2: boolean, body: string) {
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 v;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 v;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  return head + body
}

export function inkVertex(webgl2: boolean) {
  return vert(webgl2)
}

export function inkSplatVelocity(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uTex;
uniform vec2 uPoint;
uniform vec2 uForce;
uniform float uRadius;
void main() {
  vec2 vel = TEX(uTex, v).xy;
  vec2 d = v - uPoint;
  float w = exp(-dot(d, d) / max(uRadius * uRadius, 1e-4));
  vel += uForce * w;
  WRITE = vec4(vel, 0.0, 1.0);
}`,
  )
}

export function inkSplatDye(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uTex;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uAmount;
uniform float uRadius;
void main() {
  vec4 ink = TEX(uTex, v);
  vec2 d = v - uPoint;
  float w = exp(-dot(d, d) / max(uRadius * uRadius, 1e-4));
  float add = clamp(uAmount * w, 0.0, 1.0);
  WRITE = vec4(mix(ink.rgb, uColor, add), min(1.0, ink.a + add));
}`,
  )
}

export function inkAdvect(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uTex;
uniform sampler2D uVel;
uniform float uDt;
uniform float uKeep;
uniform float uDye;
void main() {
  vec2 vel = TEX(uVel, v).xy;
  vec2 prev = clamp(v - vel * uDt, vec2(0.0), vec2(1.0));
  vec4 sample = TEX(uTex, prev);
  if (uDye > 0.5) WRITE = vec4(sample.rgb, sample.a * uKeep);
  else WRITE = vec4(sample.xy * uKeep, 0.0, 1.0);
}`,
  )
}

export function inkDiverge(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uVel;
uniform vec2 uTexel;
void main() {
  float l = TEX(uVel, v - vec2(uTexel.x, 0.0)).x;
  float r = TEX(uVel, v + vec2(uTexel.x, 0.0)).x;
  float b = TEX(uVel, v - vec2(0.0, uTexel.y)).y;
  float t = TEX(uVel, v + vec2(0.0, uTexel.y)).y;
  WRITE = vec4(((r - l) + (t - b)) * 0.5, 0.0, 0.0, 1.0);
}`,
  )
}

export function inkJacobi(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uPress;
uniform sampler2D uDiv;
uniform vec2 uTexel;
void main() {
  float l = TEX(uPress, v - vec2(uTexel.x, 0.0)).x;
  float r = TEX(uPress, v + vec2(uTexel.x, 0.0)).x;
  float b = TEX(uPress, v - vec2(0.0, uTexel.y)).x;
  float t = TEX(uPress, v + vec2(0.0, uTexel.y)).x;
  float div = TEX(uDiv, v).x;
  WRITE = vec4((l + r + b + t - div) * 0.25, 0.0, 0.0, 1.0);
}`,
  )
}

export function inkProject(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uVel;
uniform sampler2D uPress;
uniform vec2 uTexel;
void main() {
  float l = TEX(uPress, v - vec2(uTexel.x, 0.0)).x;
  float r = TEX(uPress, v + vec2(uTexel.x, 0.0)).x;
  float b = TEX(uPress, v - vec2(0.0, uTexel.y)).x;
  float t = TEX(uPress, v + vec2(0.0, uTexel.y)).x;
  vec2 vel = TEX(uVel, v).xy - vec2(r - l, t - b);
  WRITE = vec4(vel, 0.0, 1.0);
}`,
  )
}

export function inkDisplay(webgl2: boolean) {
  return frag(
    webgl2,
    `uniform sampler2D uTex;
void main() {
  vec4 ink = TEX(uTex, v);
  WRITE = vec4(ink.rgb, clamp(ink.a, 0.0, 1.0));
}`,
  )
}
