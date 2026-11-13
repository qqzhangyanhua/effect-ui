"use client"

/** 设备像素比上限 1.5。0 或空值按 1。 */
export function cappedDpr(dpr: number): number {
  return Math.min(dpr || 1, 1.5)
}

/** 离开视口或页面隐藏时，连续帧停住。 */
export function shouldDrawFrame(inView: boolean, pageVisible: boolean): boolean {
  return inView && pageVisible
}

export type GlContext = WebGL2RenderingContext | WebGLRenderingContext

export interface GlSize {
  cssWidth: number
  cssHeight: number
  width: number
  height: number
  dpr: number
}

export interface GlFrame {
  gl: GlContext
  time: number
  dt: number
  size: GlSize
}

/** 浮点颜色附件是否可渲染。half 为真时用半精度。 */
export interface FloatSupport {
  renderable: boolean
  half: boolean
}

export interface GlTarget {
  framebuffer: WebGLFramebuffer
  texture: WebGLTexture
  width: number
  height: number
}

export interface GlPair {
  read: GlTarget
  write: GlTarget
  swap: () => void
  resize: (width: number, height: number) => void
  dispose: () => void
}

export interface GlLoopHandle {
  gl: GlContext
  floatSupport: FloatSupport
  dispose: () => void
  size: () => GlSize
  createPair: (width: number, height: number) => GlPair | null
  /** 全屏三角形。顶点属性 location 0，名字是 a。 */
  draw: () => void
}

interface TexFormat {
  internal: number
  format: number
  type: number
}

function isGlContext(value: unknown): value is GlContext {
  if (typeof value !== "object" || value === null) return false
  const record = value as { createShader?: unknown; drawArrays?: unknown; getExtension?: unknown }
  return (
    typeof record.createShader === "function" &&
    typeof record.drawArrays === "function" &&
    typeof record.getExtension === "function"
  )
}

function isWebGL2(gl: GlContext): gl is WebGL2RenderingContext {
  return typeof (gl as WebGL2RenderingContext).drawBuffers === "function"
}

function obtainGl(canvas: HTMLCanvasElement): GlContext | null {
  const attrs: WebGLContextAttributes = {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
  }
  try {
    const gl2 = canvas.getContext("webgl2", attrs)
    if (isGlContext(gl2)) return gl2
    const gl = canvas.getContext("webgl", attrs)
    if (isGlContext(gl)) return gl
    return null
  } catch {
    return null
  }
}

function byteFormat(gl: GlContext): TexFormat {
  return { internal: gl.RGBA, format: gl.RGBA, type: gl.UNSIGNED_BYTE }
}

function floatFormat(gl: GlContext, support: FloatSupport): TexFormat {
  if (!support.renderable) return byteFormat(gl)
  if (isWebGL2(gl)) {
    if (support.half) return { internal: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT }
    return { internal: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT }
  }
  return { internal: gl.RGBA, format: gl.RGBA, type: gl.FLOAT }
}

function fillTexture(gl: GlContext, texture: WebGLTexture, width: number, height: number, format: TexFormat) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, format.type, null)
}

function attach(gl: GlContext, framebuffer: WebGLFramebuffer, texture: WebGLTexture) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
}

function probeFormat(gl: GlContext, format: TexFormat): boolean {
  const texture = gl.createTexture()
  const framebuffer = gl.createFramebuffer()
  if (!texture || !framebuffer) {
    if (texture) gl.deleteTexture(texture)
    if (framebuffer) gl.deleteFramebuffer(framebuffer)
    return false
  }
  fillTexture(gl, texture, 1, 1, format)
  const ok = attach(gl, framebuffer, texture)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.deleteTexture(texture)
  gl.deleteFramebuffer(framebuffer)
  return ok
}

function probeFloat(gl: GlContext): FloatSupport {
  if (!isWebGL2(gl)) {
    const textureFloat = gl.getExtension("OES_texture_float")
    const colorBuffer = gl.getExtension("WEBGL_color_buffer_float")
    if (!textureFloat || !colorBuffer) return { renderable: false, half: false }
    return { renderable: probeFormat(gl, { internal: gl.RGBA, format: gl.RGBA, type: gl.FLOAT }), half: false }
  }
  gl.getExtension("EXT_color_buffer_float")
  if (probeFormat(gl, { internal: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT })) {
    return { renderable: true, half: true }
  }
  if (probeFormat(gl, { internal: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT })) {
    return { renderable: true, half: false }
  }
  return { renderable: false, half: false }
}

function destroyTarget(gl: GlContext, target: GlTarget) {
  gl.deleteFramebuffer(target.framebuffer)
  gl.deleteTexture(target.texture)
}

function createTarget(gl: GlContext, width: number, height: number, support: FloatSupport): GlTarget | null {
  const texture = gl.createTexture()
  const framebuffer = gl.createFramebuffer()
  if (!texture || !framebuffer) {
    if (texture) gl.deleteTexture(texture)
    if (framebuffer) gl.deleteFramebuffer(framebuffer)
    return null
  }
  const w = Math.max(1, Math.floor(width))
  const h = Math.max(1, Math.floor(height))
  const preferred = floatFormat(gl, support)
  fillTexture(gl, texture, w, h, preferred)
  let ok = attach(gl, framebuffer, texture)
  if (!ok && preferred.type !== gl.UNSIGNED_BYTE) {
    fillTexture(gl, texture, w, h, byteFormat(gl))
    ok = attach(gl, framebuffer, texture)
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindTexture(gl.TEXTURE_2D, null)
  if (!ok) {
    gl.deleteTexture(texture)
    gl.deleteFramebuffer(framebuffer)
    return null
  }
  return { framebuffer, texture, width: w, height: h }
}

function resizeTarget(gl: GlContext, target: GlTarget, width: number, height: number, support: FloatSupport) {
  const w = Math.max(1, Math.floor(width))
  const h = Math.max(1, Math.floor(height))
  if (target.width === w && target.height === h) return
  const preferred = floatFormat(gl, support)
  fillTexture(gl, target.texture, w, h, preferred)
  let ok = attach(gl, target.framebuffer, target.texture)
  if (!ok && preferred.type !== gl.UNSIGNED_BYTE) {
    fillTexture(gl, target.texture, w, h, byteFormat(gl))
    ok = attach(gl, target.framebuffer, target.texture)
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindTexture(gl.TEXTURE_2D, null)
  if (ok) {
    target.width = w
    target.height = h
  }
}

function createPair(gl: GlContext, width: number, height: number, support: FloatSupport): GlPair | null {
  const first = createTarget(gl, width, height, support)
  const second = createTarget(gl, width, height, support)
  if (!first || !second) {
    if (first) destroyTarget(gl, first)
    if (second) destroyTarget(gl, second)
    return null
  }
  const pair: GlPair = {
    read: first,
    write: second,
    swap() {
      const next = pair.read
      pair.read = pair.write
      pair.write = next
    },
    resize(nextWidth, nextHeight) {
      resizeTarget(gl, pair.read, nextWidth, nextHeight, support)
      resizeTarget(gl, pair.write, nextWidth, nextHeight, support)
    },
    dispose() {
      destroyTarget(gl, pair.read)
      destroyTarget(gl, pair.write)
    },
  }
  return pair
}

function measureOf(host: HTMLElement, canvas: HTMLCanvasElement): GlSize {
  const rect = host.getBoundingClientRect()
  const cssWidth = Math.max(1, rect.width || host.clientWidth || 1)
  const cssHeight = Math.max(1, rect.height || host.clientHeight || 1)
  const raw = typeof window === "undefined" ? 1 : window.devicePixelRatio
  const dpr = cappedDpr(typeof raw === "number" ? raw : 1)
  const width = Math.max(1, Math.round(cssWidth * dpr))
  const height = Math.max(1, Math.round(cssHeight * dpr))
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height
  return { cssWidth, cssHeight, width, height, dpr }
}

function createTriangle(gl: GlContext): WebGLBuffer | null {
  const buffer = gl.createBuffer()
  if (!buffer) return null
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return buffer
}

function releaseContext(gl: GlContext) {
  gl.getExtension("WEBGL_lose_context")?.loseContext()
}

/** 编译失败时删掉着色器并返回 null。 */
export function compileShader(gl: GlContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function rgbChannels(input: string): [number, number, number] | null {
  const text = input.trim()
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(text)
  const body = hex?.[1]
  if (body) {
    const full = body.length === 3 ? [...body].map((char) => char + char).join("") : body
    const value = Number.parseInt(full, 16)
    return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
  }
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(text)
  if (!rgb?.[1] || !rgb[2] || !rgb[3]) return null
  return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255]
}

/** hex、rgb 直接解析。其余写进 color，读浏览器算出的 rgb。失败返回 null。 */
export function parseCssColor(host: HTMLElement, input: string): [number, number, number] | null {
  const text = input.trim()
  if (!text) return null
  const direct = rgbChannels(text)
  if (direct) return direct
  const previous = host.style.color
  host.style.color = text
  try {
    return rgbChannels(getComputedStyle(host).color)
  } finally {
    host.style.color = previous
  }
}

/**
 * 多 pass 效果共用的原始 WebGL 循环。只管生命周期：成对 framebuffer、全屏三角形、
 * 浮点纹理探测、像素比上限、尺寸、离屏暂停、卸载时释放 context。
 * getContext 拿不到时返回 null，不抛。
 */
export function mountGlLoop(
  canvas: HTMLCanvasElement,
  options: {
    host: HTMLElement
    frame: (frame: GlFrame) => void
  },
): GlLoopHandle | null {
  const gl = obtainGl(canvas)
  if (!gl) return null
  const triangle = createTriangle(gl)
  if (!triangle) {
    releaseContext(gl)
    return null
  }
  const floatSupport = probeFloat(gl)
  let current = measureOf(options.host, canvas)
  let alive = true
  let raf = 0
  let last = 0
  let inView = true
  let pageVisible = document.visibilityState !== "hidden"
  let observer: IntersectionObserver | null = null
  const context = gl

  function poke() {
    if (!alive || raf !== 0) return
    if (!shouldDrawFrame(inView, pageVisible)) return
    raf = requestAnimationFrame(tick)
  }

  function tick(now: number) {
    raf = 0
    if (!alive || !shouldDrawFrame(inView, pageVisible)) return
    const dt = last === 0 ? 0 : Math.min(0.05, (now - last) / 1000)
    last = now
    current = measureOf(options.host, canvas)
    options.frame({ gl: context, time: now / 1000, dt, size: current })
    if (alive) poke()
  }

  function onVisibility() {
    pageVisible = document.visibilityState !== "hidden"
    poke()
  }

  if (typeof IntersectionObserver === "function") {
    inView = false
    observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1]
      inView = entry ? entry.isIntersecting : true
      poke()
    })
    observer.observe(options.host)
  }
  document.addEventListener("visibilitychange", onVisibility)
  poke()

  return {
    gl,
    floatSupport,
    size: () => current,
    createPair: (width, height) => (alive ? createPair(gl, width, height, floatSupport) : null),
    draw() {
      if (!alive) return
      gl.bindBuffer(gl.ARRAY_BUFFER, triangle)
      gl.enableVertexAttribArray(0)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      if (!alive) return
      alive = false
      if (raf !== 0) cancelAnimationFrame(raf)
      raf = 0
      observer?.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.deleteBuffer(triangle)
      releaseContext(gl)
    },
  }
}
