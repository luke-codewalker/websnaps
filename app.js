const video = document.querySelector(".video");
const snapshots = document.querySelector(".snapshots");
const filters = document.querySelector(".filter-select");
const mirrorBtnInput = document.querySelector(".mirror-btn-input");
const mirrorBtn = document.querySelector(".mirror-btn");

const trigger = document.querySelector(".trigger-btn");
let mirrored = mirrorBtnInput.checked ? -1 : 1;
mirrorBtnInput.checked
  ? mirrorBtn.classList.remove("inactive")
  : mirrorBtn.classList.add("inactive");
let filter = filters.value;

const countdown = document.querySelector(".countdown");
let secs = 3;
countdown.textContent = secs;

video.style.transform = `scaleX(${mirrored})`;
video.style.filter = filter;

startStreamingCamera({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 1024 },
    facingMode: "user"
  }
});

video.addEventListener("click", takeSnapshot);

window.addEventListener("keydown", e => {
  if (e.keyCode == 32) {
    e.preventDefault();
    takeSnapshot();
  }
});

trigger.addEventListener("click", () => {
  trigger.setAttribute("disabled", "");

  const intervalID = setInterval(() => {
    countdown.textContent = --secs;
  }, 1000);

  setTimeout(() => {
    trigger.removeAttribute("disabled", "");
    secs = 3;
    countdown.textContent = secs;
    clearInterval(intervalID);
    takeSnapshot();
  }, secs * 1000);
});

filters.addEventListener("change", e => {
  filter = e.target.value;
  video.style.filter = filter;
});

mirrorBtnInput.addEventListener("change", e => {
  mirrored = e.target.checked ? -1 : 1;
  mirrorBtnInput.checked
    ? mirrorBtn.classList.remove("inactive")
    : mirrorBtn.classList.add("inactive");
  video.style.transform = `scaleX(${mirrored})`;
});

function startStreamingCamera(constraints) {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(mediaStream => {
      video.pause();
      console.log(mediaStream);
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

function takeSnapshot() {
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

  canvas.classList.add("snapshot");
  const wrapper = document.createElement("div");

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "&times;";
  deleteBtn.setAttribute("title", "Delete this snap!");
  deleteBtn.classList.add("delete-btn", "snap-btn");
  deleteBtn.addEventListener("click", e => {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
  });

  const downloadBtn = document.createElement("button");
  downloadBtn.innerHTML = "💾";
  downloadBtn.setAttribute("title", "Download this snap!");
  downloadBtn.classList.add("download-btn", "snap-btn");
  downloadBtn.addEventListener("click", e =>
    downloadImg(e.target.parentNode.querySelector("canvas"))
  );

  wrapper.addEventListener("mouseenter", () =>
    wrapper.classList.add("focused")
  );

  wrapper.addEventListener("click", () => wrapper.classList.add("focused"));
  wrapper.addEventListener("mouseleave", () =>
    wrapper.classList.remove("focused")
  );
  wrapper.classList.add("snapshot-wrapper");
  wrapper.appendChild(canvas);
  wrapper.appendChild(deleteBtn);
  wrapper.appendChild(downloadBtn);
  snapshots.appendChild(wrapper);
}

function downloadImg(canvas) {
  const link = document.createElement("a");
  link.setAttribute(
    "style",
    "position:absolute; transform:translateY(-10000px);"
  );
  link.setAttribute("download", `snapshot-${Date.now()}.png`);
  link.setAttribute("href", canvas.toDataURL("image/png"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
