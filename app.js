// DOM hooks
const video = document.querySelector(".video");
const snapshots = document.querySelector(".snapshots");
const filters = document.querySelector(".filter-select");
const mirrorBtnInput = document.querySelector(".mirror-btn-input");
const mirrorBtn = document.querySelector(".mirror-btn");
const trigger = document.querySelector(".trigger-btn");
const countdown = document.querySelector(".countdown");

// Initial setup
let mirrored = mirrorBtnInput.checked ? -1 : 1;
mirrorBtnInput.checked
  ? mirrorBtn.classList.remove("inactive")
  : mirrorBtn.classList.add("inactive");
video.style.transform = `scaleX(${mirrored})`;

let filter = filters.value;
video.style.filter = filter;

let secs = 3;
countdown.textContent = secs;

startStreamingCamera({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 1024 },
    facingMode: "user"
  }
});

// Event Listeners
// taking a snapshot immediately
video.addEventListener("click", takeSnapshot);

window.addEventListener("keydown", e => {
  if (e.keyCode == 32) {
    e.preventDefault();
    takeSnapshot();
  }
});

// taking a snapshot with delay
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

// change filter
filters.addEventListener("change", e => {
  filter = e.target.value;
  video.style.filter = filter;
});

// change mirrored status
mirrorBtnInput.addEventListener("change", e => {
  mirrored = e.target.checked ? -1 : 1;
  mirrorBtnInput.checked
    ? mirrorBtn.classList.remove("inactive")
    : mirrorBtn.classList.add("inactive");
  video.style.transform = `scaleX(${mirrored})`;
});

// functions
// function to request camera stream
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

// function to record a snapshot
function takeSnapshot() {
  video.classList.add("flash");
  setTimeout(() => {
    video.classList.remove("flash");
  }, 500);

  // create a canvas and put image with all manipulations applied on it
  const canvas = document.createElement("canvas");
  canvas.classList.add("snapshot");

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

  // create wrapper element for canvas and buttons for downloading and deleting
  const wrapper = makeSnapshotWrapper();
  const deleteBtn = makeDeleteBtn();
  const downloadBtn = makeDownloadBtn();

  // insert into DOM
  wrapper.appendChild(canvas);
  wrapper.appendChild(deleteBtn);
  wrapper.appendChild(downloadBtn);
  snapshots.appendChild(wrapper);
}

// function to create a wrapper div for the snapshots and the buttons
function makeSnapshotWrapper() {
  const wrapper = document.createElement("div");
  wrapper.classList.add("snapshot-wrapper");

  // events on wrapper for hover on desktop and touch on mobile
  wrapper.addEventListener("mouseenter", () =>
    wrapper.classList.add("focused")
  );
  wrapper.addEventListener("click", () => wrapper.classList.add("focused"));
  wrapper.addEventListener("mouseleave", () =>
    wrapper.classList.remove("focused")
  );
  return wrapper;
}

//function to create delete button for snapshot
function makeDeleteBtn() {
  const btn = document.createElement("button");
  btn.innerHTML = "&times;";
  btn.setAttribute("title", "Delete this snap!");
  btn.classList.add("delete-btn", "snap-btn");
  btn.addEventListener("click", e => {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
  });
  return btn;
}

//function to create download button for snapshot
function makeDownloadBtn() {
  const btn = document.createElement("button");
  btn.innerHTML = "💾";
  btn.setAttribute("title", "Download this snap!");
  btn.classList.add("download-btn", "snap-btn");
  btn.addEventListener("click", e =>
    downloadImg(e.target.parentNode.querySelector("canvas"))
  );
  return btn;
}

// function to download an image
function downloadImg(canvas) {
  const link = document.createElement("a");
  link.setAttribute(
    "style",
    "position:absolute; transform:translateY(-10000px);"
  );

  const timeString = dateToString(new Date());
  link.setAttribute("download", `websnap_${timeString}.png`);
  link.setAttribute("href", canvas.toDataURL("image/png"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// helper function to pad with leading zeroes
function pad(str) {
  return str.padStart(2, "0");
}

// function to make string from a date
function dateToString(date) {
  // add empty string to convert Number to String for padding
  const day = date.getDate() + "";
  const month = date.getMonth() + 1 + "";
  const year = date.getFullYear();
  const hour = date.getHours() + "";
  const minute = date.getMinutes() + "";
  const second = date.getSeconds() + "";

  return `${pad(day)}-${pad(month)}-${year}_${pad(hour)}-${pad(minute)}-${pad(
    second
  )}`;
}
