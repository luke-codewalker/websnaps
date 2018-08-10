const video = document.querySelector(".stream.video");
const snapshots = document.querySelector(".snapshots");
const filters = document.querySelector("#filters");
const mirror = document.querySelector("#mirror");

const canvas = document.querySelector(".utility-canvas");
const context = canvas.getContext("2d");

const snapBtn = document.querySelector(".snap-btn");
let frontCam = false;
let mirrored = mirror.checked ? -1 : 1;
let filter = filters.value;

video.style.transform = `scaleX(${mirrored})`;
video.style.filter = filter;

startStreamingCamera({ video: { facingMode: "user" } });

snapBtn.addEventListener("click", e => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imgUrl = canvas.toDataURL("image/png");

  const img = document.createElement("img");
  img.src = imgUrl;
  img.style.filter = filter;
  img.style.transform = `scaleX(${mirrored})`;

  img.addEventListener("click", downloadImg);

  snapshots.appendChild(img);
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
  link.setAttribute("href", e.target.src);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
