import "./style.css";

import * as twgl from "twgl.js";
import dat from "dat.gui";

const video = document.getElementById("webcam");

import vertexShader from "./shaders/vertex.js";
import chromaShader from "./shaders/chroma.js";

// Start webcam
navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((err) => {
    console.warn("No webcam found, using fallback video:", err);
    const videoList = [
      "/video/face3.mp4",
      "/video/face4.mp4",
    ];
    const rndNum = Math.floor(Math.random() * videoList.length);
    video.src = videoList[rndNum];
    video.loop = true;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.play().catch(() => {
      console.error("Autoplay failed, user interaction needed.");
    });
  });

const settings = {
  mode: "color",
  style: "glitch",
  hue: 2.25,
  saturation: 0.99,
  size: 5
};
const gui = new dat.GUI();
gui.add(settings, "style", {
  Glitch: "glitch",
  Hash: "hash",
  Hearts: "hearts",
  ASCII: "ascii"
});
gui.add(settings, "mode", { Color: "color", Hue: "hue" });
gui.add(settings, "hue", 0, 3.14).step(0.01);

gui.add(settings, "saturation", 0, 1).step(0.01);
gui.add(settings, "size", 2, 24).step(1);

let viewWidth = window.innerWidth;
let viewHeight = window.innerHeight;

const glcanvas = document.getElementById("canvas");
const gl = glcanvas.getContext("webgl2");

// Resize the canvas to match
glcanvas.width = viewWidth;
glcanvas.height = viewHeight;

// Shader programs
const chromaInfo = twgl.createProgramInfo(gl, [vertexShader, chromaShader]);

const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  texcoord: { numComponents: 2, data: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1] },
};

const fbufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

// Video texture
const textures = twgl.createTextures(gl, {
  u_video: {
    src: video,
    min: gl.LINEAR,
    mag: gl.LINEAR,
    flipY: true,
    flipX: true,
  },
});

twgl.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

let then = 0;

window.addEventListener("resize", () => {
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;

  glcanvas.width = viewWidth;
  glcanvas.height = viewHeight;

  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
});

function render(time) {
  time *= 0.001;
  const deltaTime = time - then;
  then = time;

  twgl.setTextureFromElement(gl, textures.u_video, video);
  twgl.bindFramebufferInfo(gl, null);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const colorMode = settings.mode == "color" ? 1 : 0;
  const styleMode =
    settings.style == "glitch" ? 1 : settings.style == "hearts" ? 2 : settings.style == "hash" ? 3 : 0;
  const chromaUniforms = {
    u_time: time,
    u_mode: colorMode,
    u_hue: settings.hue,
    u_size: settings.size,
    u_style: styleMode,
    u_sat: settings.saturation,
    u_video: textures.u_video,
    u_resolution: [viewWidth, viewHeight]
  };
  gl.useProgram(chromaInfo.program);
  twgl.setBuffersAndAttributes(gl, chromaInfo, fbufferInfo);
  twgl.setUniforms(chromaInfo, chromaUniforms);
  twgl.drawBufferInfo(gl, fbufferInfo);

  requestAnimationFrame(render);
}

video.addEventListener("playing", () => render());
video.addEventListener("canplay", () => render());
