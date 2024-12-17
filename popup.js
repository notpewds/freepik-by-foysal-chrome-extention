document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btn");
  // const imagePreview = document.getElementById("image-preview");
  // const videoPreview = document.getElementById("video-preview");
  const titleElement = document.getElementById("title");
  const optionsContainer = document.getElementById("options-container");

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const url = tabs[0].url;
    if (url.includes("premium-") || url.includes("free-")) {
      // Supported URL
      console.log("Supported URL");
    } else {
      // Not supported URL
      document.getElementById("here2").innerText =
        "This extension only works with premium freepik images and video.";
      document.getElementById("btn").style.display = "none";
      console.log("Not supported");
    }
    if (url.includes("free-video") || url.includes("free-photo")) {
      // document.getElementById("btn").style.display = "none";
      document.getElementById("here").style.display = "none";
      document.getElementById("here2").innerText =
        "This image is available for free. Only premium images or videos will be accepted, and the option to download free videos and images will be removed soon.  ";
    }

    // document.getElementById("here").innerText = url;

    btn.addEventListener("click", () => {
      const mediaType = determineMediaType(url);
      if (mediaType === "video") {
        const videoId = parseVideoIdFromUrl(url);
        if (videoId) {
          downloadVideo(videoId);
        }
      } else {
        const photoId = parsePhotoIdFromUrl(url);
        if (photoId) {
          downloadImage(photoId);
        }
      }
    });
  });

  function determineMediaType(url) {
    if (url.includes("free-video") || url.includes("premium-video")) {
      return "video";
    } else if (
      url.includes("free-photo") ||
      url.includes("premium-photo") ||
      url.includes("premium-ai-image") ||
      url.includes("free-ai-image")
    ) {
      return "image";
    } else {
      return "image";
    }
  }

  function parsePhotoIdFromUrl(url) {
    const matches = url.match(/_(\d+)\.htm/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return null;
  }

  function parseVideoIdFromUrl(url) {
    const matches = url.match(/_(\d+)\b/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return null;
  }

  function downloadImage(id) {
    fetch(`https://freepik.softvencefsd.xyz/get-data/${id}`)
      .then((response) => response.json())
      .then((data) => {
        // imagePreview.src = data.preview.url;
        // imagePreview.style.display = "block";
        // videoPreview.style.display = "none";
        titleElement.textContent = data.name;
        console.log(data.preview);

        return fetch(`https://freepik.softvencefsd.xyz/fetch-data/${id}`);
      })
      .then((response) => response.json())
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function downloadVideo(id) {
    fetch(`https://freepik.softvencefsd.xyz/get-video/${id}`)
      .then((response) => response.json())
      .then((data) => {
        // videoPreview.src = data.previews[0];
        // videoPreview.style.display = "block";
        // imagePreview.style.display = "none";

        titleElement.textContent = data.name;
        renderVideoOptions(data.options);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function renderVideoOptions(options) {
    optionsContainer.innerHTML = "";
    options.forEach((option) => {
      const optionElement = document.createElement("div");
      optionElement.className = "card mb-3";
      optionElement.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Quality: ${option.quality}</h5>
          <p class="card-text">Resolution: ${option.width}x${option.height}</p>
          <p class="card-text">Size: ${option.size} MB</p>
          <button class="btn btn-primary">Download</button>
        </div>
      `;
      optionElement.querySelector("button").addEventListener("click", () => {
        downloadVideoFromId(option.id);
      });
      optionsContainer.appendChild(optionElement);
    });
  }

  function downloadVideoFromId(id) {
    fetch(`https://freepik.softvencefsd.xyz/fetch-video/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.url) {
          window.location.replace(data.url);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
});
