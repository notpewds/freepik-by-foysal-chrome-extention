const currentVersion = "4.0.0";
const current = 0;
const limit = 100;

function reexecuteLogic() {
  setTimeout(() => {
    handleButtonStates();
  }, 500);

  injectDownloadButtons();

  setupCustomButtonHandlers();
}

function handleButtonStates() {
  if (window.location.href.includes("free-photo") || window.location.href.includes("free-video")) {
    disableDownloadButtons("Free image is not supported.");
  } else {
    enableDownloadButtons();
  }
}

function disableDownloadButtons(message) {
  document.querySelectorAll(".down-button").forEach(button => {
    button.innerHTML = `<span>${message}</span>`;
    button.disabled = true;
    button.style.cursor = "not-allowed";
  });
}

function enableDownloadButtons() {
  document.querySelectorAll(".down-button").forEach(button => {
    button.innerHTML = `
      <span class="block ff--title font-lg bold capitalize inline">Download</span>
      <span class="limit"></span>
    `;
    button.disabled = false;
    button.style.cursor = "pointer";

    const storedPassword = localStorage.getItem("pass");
    fetch(`https://free-pik.vercel.app/limit?pass=${storedPassword}`)
      .then(response => response.json())
      .then(data => {
        updateDownloadLimits(data);
      })
      .catch(error => {
        console.error("Error fetching the JSON:", error);
      });
  });
}

function updateDownloadLimits(data) {
  if (data.current > 180) {
    disableDownloadButtons("Download limit exceeded for today. Please try again tomorrow.");
  }

  document.querySelectorAll(".limit").forEach(item => {
    item.textContent = `${data.current || 0} / ${data.limit || 100} (Today's Limit)`;
  });
}

function injectDownloadButtons() {
  const asideElements = getAsideElements();

  asideElements.forEach(asideElement => {
    if (!asideElement.querySelector(".unique")) {
      const parentTemplate = createDownloadButtonTemplate();
      const textDiv = createTextDiv();
      const parentClone = parentTemplate.cloneNode(true);

      parentClone.insertBefore(textDiv, parentClone.firstChild);
      asideElement.insertBefore(parentClone, asideElement.firstChild);
    }
  });
}

function getAsideElements() {
  const hasGridArea = (element, areaName) => window.getComputedStyle(element).gridArea === areaName;

  return [
    ...document.querySelectorAll("aside"),
    ...Array.from(document.querySelectorAll("*")).filter(elem => hasGridArea(elem, "aside")),
  ];
}

function createDownloadButtonTemplate() {
  const parentTemplate = document.createElement("div");
  parentTemplate.className = "detail__aside--left detail__aside--left-premium unique";

  const btn = document.createElement("button");
  btn.className = `
    download-go-premium down-button custom-button button button--flat button--sm button--yellow 
    button--yellow--hover button--auto full-width mg-bottom-lv3 pd-lv2 pd-left-lv4 pd-right-lv4 alignc
  `;
  btn.setAttribute("data-resource-id", "9513487");

  const span1 = document.createElement("span");
  span1.className = "block ff--title font-lg bold capitalize";
  span1.textContent = "Download";

  const span2 = document.createElement("span");
  span2.className = "block font-sm regular block mg-top-lv1 limit";
  span2.textContent = `${current} / ${limit} (Today's Limit)`;

  btn.appendChild(span1);
  btn.appendChild(span2);

  parentTemplate.appendChild(btn);

  return parentTemplate;
}

function createTextDiv() {
  const textDiv = document.createElement("div");
  textDiv.innerHTML = `
    <span class="head first font-lg block semibold mg-bottom-lv2 inline custom-span">
      <span class="inline"><i class="icon icon--premium inline-block mg-right-lv1"></i> Freepik Downloader By </span>
      <a href="https://github.com/ahfoysal" class="premium bold underline">Foysal</a>
    </span>
  `;
  return textDiv;
}

function setupCustomButtonHandlers() {
  document.querySelectorAll(".custom-button").forEach(elem => {
    const clickHandler = () => {
      console.log("click");
      const mediaType = determineMediaType(window.location.href);
      const id = parseIdFromUrl(window.location.href, /_(\d+)\b/);

      if (mediaType === "video" && id) {
        downloadVideo(id);
      } else if (id) {
        downloadImage(id);
      }
      // Do not remove the event listener
    };

    elem.addEventListener("click", clickHandler);
  });
}


function determineMediaType(url) {
  return url.includes("free-video") || url.includes("premium-video") ? "video" : "image";
}

function parseIdFromUrl(url, regex) {
  const matches = url.match(regex);
  return matches && matches.length > 1 ? matches[1] : null;
}

async function downloadImage(id) {
  const storedPassword = localStorage.getItem("pass");
  if (!storedPassword) {
    return alert("Please Enter Password");
  }
  
  showLoading();

  try {
    const response = await fetch(`https://free-pik.vercel.app/fetch-data/${id}?pass=${storedPassword}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData, "response error");
      throw new Error(errorData.message || "Unknown error occurred");
    }
    
    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('URL not found in the response');
    }
  } catch (error) {
    console.log(error, "error downloading");
    if(error.message == "Pass Required"){
      return alert("Wrong password. Please try again.")
    }
    alert(error.message || "Download limit exceeded for today. Please try again tomorrow.");
  } finally {
    hideLoading();
  }
}

function downloadVideo(id) {
  const storedPassword = localStorage.getItem("pass");
  fetch(`https://free-pik.vercel.app/get-video/${id}?pass=${storedPassword}`)
    .then(response => response.json())
    .then(data => {
      renderVideoOptions(data.options);
    })
    .catch(error => {
      if(error.response.data.message === "Pass Required") {
        return alert("Wrong password. Please try again.")

      }
      console.error(error);
    });
}

function renderVideoOptions(options) {
  options.forEach((option, index) => {
    const optionElement = document.createElement("div");
    optionElement.className = `hide-u card mb-3 unique-${index}`;
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

    document.querySelectorAll(".detail__aside--left").forEach(asideElement => {
      if (!asideElement.querySelector(`.unique-${index}`)) {
        asideElement.appendChild(optionElement);
      }
    });
  });
}

function downloadVideoFromId(id) {
  showLoading();
  const storedPassword = localStorage.getItem("pass");
  fetch(`https://free-pik.vercel.app/fetch-video/${id}?pass=${storedPassword}`)
    .then(response => response.json())
    .then(data => {
      if (data.url) {
        window.location.replace(data.url);
        hideLoading();
      }
    })
    .catch(error => {
      console.log(error, "Error downloading");
      // if(error.response.data.message === "Pass Required") {
      //   hideLoading();
      //   return alert("Wrong password. Please try again.")

      // }
      alert("Download limit exceeded for today. Please try again tomorrow.")
      console.error(error);
      hideLoading();
    });
}

function showLoading() {
  const body = document.querySelector("body");
  const icon = document.getElementById("__plasmo-loading__");

  if (icon) {
    icon.style.opacity = 1;
    icon.style.bottom = "50%";
    icon.style.right = "50%";
    body.style.filter = "blur(1px)";
    body.style.pointerEvents = "none";
  } else {
    const newDiv = document.createElement("div");
    newDiv.innerHTML = `<div class="loading">Loading&#8230;</div>`;
    document.body.appendChild(newDiv);
  }
}

function hideLoading() {
  const body = document.querySelector("body");
  const icon = document.getElementById("__plasmo-loading__");

  if (icon) {
    icon.style.opacity = 0;
    icon.style.bottom = "50px";
    icon.style.right = "50px";
    body.style.filter = "none";
    body.style.pointerEvents = "auto";
  } else {
    document.querySelector("div.loading").remove();
  }
}

fetch("https://cdn.jsdelivr.net/gh/notpewds/freepik-by-foysal-chrome-extention@latest/version.json")
  .then(response => response.json())
  .then(data => {
    handleVersionCheck(data.version);
  })
  .catch(error => {
    console.error("Error fetching the JSON:", error);
  });

function handleVersionCheck(latestVersion) {
  if (currentVersion !== latestVersion) {
    showUpdateButton();
  } else {
    showJoinGroupLink();
    showPasswordInput();
  }
}

function showUpdateButton() {
  const updateBtn = `
    <button onclick="window.open('https://github.com/notpewds/freepik-by-foysal-chrome-extention/releases', '_blank')" 
      class="download-go-premium custom-button button button--flat button--sm button--yellow button--yellow--hover 
      button--auto full-width mg-bottom-lv3 pd-lv2 pd-left-lv4 pd-right-lv4 alignc" 
      data-resource-id="9513487">
      <span class="block ff--title font-lg bold capitalize">Update Available</span>
    </button>`;
  const newDiv = document.createElement("div");
  newDiv.innerHTML = updateBtn;

  document.querySelector(".unique").appendChild(newDiv);
}

function showJoinGroupLink() {
  const joinGroupLink = `
    <a target="_blank" style="font-size:15px !important;" 
      href="https://join.skype.com/rgqRzMIWrlWI" class="premium bold underline">
      JOIN OUR SKYPE GROUP.
    </a>`;
  const newDiv = document.createElement("div");
  newDiv.innerHTML = joinGroupLink;

  document.querySelector(".unique").appendChild(newDiv);
}

function showPasswordInput() {
  const inputElement = document.createElement("input");
  inputElement.placeholder = "Enter password";
  inputElement.classList.add("custom-input");
  inputElement.id = "custom-input";

  const storedPassword = localStorage.getItem("pass");
  if (storedPassword) {
    inputElement.value = storedPassword;
  }

  inputElement.addEventListener('input', () => {
    localStorage.setItem("pass", inputElement.value);
  });

  document.querySelector(".unique").appendChild(inputElement);
}

reexecuteLogic();

window.navigation.addEventListener("navigate", () => {
  console.log("location changed!");
  reexecuteLogic();
});
