const video = document.querySelector(".stream.video");
const snapshots = document.querySelector(".snapshots");
const filters = document.querySelector("#filters");
const mirror = document.querySelector("#mirror");

const snapBtn = document.querySelector(".snap-btn");
let frontCam = false;
let mirrored = mirror.checked ? -1 : 1;
let filter = filters.value;

video.style.transform = `scaleX(${mirrored})`;
video.style.filter = filter;

startStreamingCamera({ video: { facingMode: "user" } });

snapBtn.addEventListener("click", e => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  context.filter = filter;
  context.scale(mirrored, 1);
  context.drawImage(
    video,
    -canvas.width / 2 + (canvas.width / 2) * mirrored,
    0,
    canvas.width,
    canvas.height
  );

  canvas.addEventListener("click", downloadImg);

  snapshots.appendChild(canvas);
});

filters.addEventListener("change", e => {
  filter = e.target.value;
  video.style.filter = filter;
});

mirror.addEventListener("change", e => {
  mirrored = e.target.checked ? -1 : 1;
  video.style.transform = `scaleX(${mirrored})`;
});

function startStreamingCamera(constraints) {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(mediaStream => {
      video.pause();

      video.srcObject = mediaStream;
      video.load();

      video.addEventListener("loadedmetadata", e => {
        video.play();
      });
    })
    .catch(err => {
      console.error(err);
    });
}

function downloadImg(e) {
  const link = document.createElement("a");
  link.setAttribute(
    "style",
    "position:absolute; transform:translateY(-10000px);"
  );
  link.setAttribute("download", `snapshot-${Date.now()}.png`);
  link.setAttribute("href", e.target.toDataURL("image/png"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
