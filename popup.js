document.addEventListener("DOMContentLoaded", function() {
  const btn = document.getElementById("btn");
  const imagePreview = document.getElementById("image-preview");
  const videoPreview = document.getElementById("video-preview");
  const titleElement = document.getElementById("title");
  const optionsContainer = document.getElementById("options-container");

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    const url = tabs[0].url;
    document.getElementById("here").innerText = url;

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
    fetch(`https://free-pik.vercel.app/get-data/${id}`)
      .then(response => response.json())
      .then(data => {
        imagePreview.src = data.preview.url;
        imagePreview.style.display = "block";
        videoPreview.style.display = "none";
        titleElement.textContent = data.name;
        console.log(data.preview);

        return fetch(`https://free-pik.vercel.app/fetch-data/${id}`);
      })
      .then(response => response.json())
      .then(data => {
        window.location.href = data.url;
      })
      .catch(error => {
        console.error(error);
      });
  }

  function downloadVideo(id) {
    fetch(`https://free-pik.vercel.app/get-video/${id}`)
      .then(response => response.json())
      .then(data => {
        videoPreview.src = data.previews[0];
        videoPreview.style.display = "block";
        imagePreview.style.display = "none";

        titleElement.textContent = data.name;
        renderVideoOptions(data.options);
      })
      .catch(error => {
        console.error(error);
      });
  }

  function renderVideoOptions(options) {
    optionsContainer.innerHTML = "";
    options.forEach(option => {
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
    fetch(`https://free-pik.vercel.app/fetch-video/${id}`)
      .then(response => response.json())
      .then(data => {
        if (data.url) {
          window.location.replace(data.url);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }
});
