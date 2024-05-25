let current = 0;
let limit = 100;
function reexecuteLogic() {
  //   document.querySelectorAll(".hide-u").forEach((asideElement) => {
  //     asideElement.remove();
  //   });
  function hasGridArea(element, areaName) {
    return window.getComputedStyle(element).gridArea === areaName;
  }
 
  

  // Select all aside elements and all elements with the grid-area set to 'aside'
  const asideElements = [
    ...document.querySelectorAll("aside"),
    ...Array.from(document.querySelectorAll("*")).filter((elem) =>
      hasGridArea(elem, "aside")
    ),
  ];

  // Create the parent container with the button
  const parentTemplate = document.createElement("div");
  parentTemplate.className =
    "detail__aside--left detail__aside--left-premium unique";

  const btn = document.createElement("button");
  btn.className =
    "download-go-premium down-button  custom-button button button--flat button--sm button--yellow button--yellow--hover button--auto full-width mg-bottom-lv3 pd-lv2 pd-left-lv4 pd-right-lv4 alignc";
  btn.setAttribute("data-resource-id", "9513487");

  const span1 = document.createElement("span");
  span1.className = "block ff--title font-lg bold capitalize";
  span1.textContent = "Download";

  const span2 = document.createElement("span");

  span2.className = "block font-sm regular block mg-top-lv1  limit";
  span2.textContent = `${current} / ${limit}  (Today's Limit)`;

  btn.appendChild(span1);
  btn.appendChild(span2);


  parentTemplate.appendChild(btn);

  asideElements.forEach((asideElement) => {
    // Check if the element with the unique identifier already exists within this aside
    if (!asideElement.querySelector(".unique")) {
      const textDiv = document.createElement("div");
      textDiv.innerHTML = `<span class="head first font-lg block semibold mg-bottom-lv2 inline custom-span">
              <span class=" inline "><i class="icon icon--premium inline-block mg-right-lv1"></i> Freepik Downloader By </span>
              <a href="https://github.com/ahfoysal" class="premium bold underline">Foysal</a></span>`;

      const parentClone = parentTemplate.cloneNode(true);
      parentClone.insertBefore(textDiv, parentClone.firstChild);
      asideElement.insertBefore(parentClone, asideElement.firstChild);
    }
  });

  document.querySelectorAll(".custom-button").forEach((elem) => {
    // Check if the click handler is already attached
    if (!elem.dataset.clickAttached) {
      const clickHandler = () => {
        console.log("click");
        const mediaType = determineMediaType(window.location.href);
        if (mediaType === "video") {
          const videoId = parseIdFromUrl(window.location.href, /_(\d+)\b/);
          if (videoId) {
            downloadVideo(videoId);
          }
        } else {
          const photoId = parseIdFromUrl(window.location.href, /_(\d+)\.htm/);
          if (photoId) {
            downloadImage(photoId);
          }
        }
        elem.removeEventListener("click", clickHandler);
      };

      elem.addEventListener("click", clickHandler);
      // Mark this element as having the click handler attached
      elem.dataset.clickAttached = "true";
    }
  });
  fetch("https://free-pik.vercel.app/limit")
  .then((response) => response.json())
  .then((data) => {
    console.log(data.current, data.limit);
    if(data.current > 90) {
      console.log("Limit exceeded")
      document.querySelectorAll(".down-button ").forEach(button =>{
        button.innerHTML = "<span> Download limit exceeded for today. Please try again tomorrow.</span>"
        button.disabled = true
        button.style.curson = "not-allowed"

      })
    }
    document.querySelectorAll(".limit").forEach((item) => {

      return item.textContent = `${data.current || 0}  / ${ data.limit || 100}  (Today's Limit)`;
    })
   
  })
  .catch((error) => {
    console.error("Error fetching the JSON:", error);
  });
}

function determineMediaType(url) {
  if (url.includes("free-video") || url.includes("premium-video")) {
    return "video";
  }
  return "image";
}

function parseIdFromUrl(url, regex) {
  const matches = url.match(regex);
  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
}

function downloadImage(id) {
  showLoading();
  fetch(`https://free-pik.vercel.app/fetch-data/${id}`)
    .then((response) => response.json())
    .then((data) => {
      window.location.href = data.url;
      hideLoading();
    })
    .catch((error) => {
      console.error(error);
      hideLoading();
    });
}

function downloadVideo(id) {
  fetch(`https://free-pik.vercel.app/get-video/${id}`)
    .then((response) => response.json())
    .then((data) => {
      renderVideoOptions(data.options);
    })
    .catch((error) => {
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
          </div>`;

    optionElement.querySelector("button").addEventListener("click", () => {
      downloadVideoFromId(option.id);
    });

    document
      .querySelectorAll(".detail__aside--left")
      .forEach((asideElement) => {
        if (!asideElement.querySelector(`.unique-${index}`)) {
          asideElement.appendChild(optionElement);
        }
      });
  });
}

function downloadVideoFromId(id) {
  showLoading();
  fetch(`https://free-pik.vercel.app/fetch-video/${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.url) {
        window.location.replace(data.url);
        hideLoading();
      }
    })
    .catch((error) => {
      console.error(error);
      hideLoading();
    });
}

const downloadIcon = `<div class="loading">Loading&#8230;</div>
`;
const newDiv = document.createElement("div");

reexecuteLogic();

window.navigation.addEventListener("navigate", () => {
  console.log("location changed!");
  reexecuteLogic();
});

const showLoading = () => {
  const body = document.querySelector("body");
  const icon = document.getElementById("__plasmo-loading__");

  if (icon) {
    icon.style.opacity = 1;
    icon.style.bottom = "50%";
    icon.style.right = "50%";
    body.style.filter = "blur(1px)";
    body.style.pointerEvents = "none";
  } else {
    newDiv.innerHTML = downloadIcon;
    document.body.appendChild(newDiv);

    console.log(newDiv);
  }
};
const hideLoading = () => {
  const body = document.querySelector("body");
  const icon = document.getElementById("__plasmo-loading__");

  if (icon) {
    icon.style.opacity = 0;
    icon.style.bottom = "50px";
    icon.style.right = "50px";
    body.style.filter = "none";
    body.style.pointerEvents = "auto";
  } else {
    newDiv.innerHTML = "";
  }
};

fetch(
  "https://cdn.jsdelivr.net/gh/notpewds/freepik-by-foysal-chrome-extention@latest/version.json"
)
  .then((response) => response.json())
  .then((data) => {
    console.log("Version:", data.version);
    currentVersion = "2.0.1";
    if (currentVersion != data.version) {
      console.log(" Update need");
      const updateBtn = `
       <button   onclick="window.open('https://github.com/notpewds/freepik-by-foysal-chrome-extention/releases', '_blank')" class="download-go-premium custom-button button button--flat button--sm button--yellow button--yellow--hover button--auto full-width mg-bottom-lv3 pd-lv2 pd-left-lv4 pd-right-lv4 alignc" data-resource-id="9513487" data-click-attached="true"><span class="block ff--title font-lg bold capitalize">Update Available</span>/button>`;
      const newDiv = document.createElement("div");
      newDiv.innerHTML = updateBtn;

      document.querySelector(".unique").appendChild(newDiv);
      console.log(document.querySelector(".unique"));
    } else {
      console.log(" No Update need");
      const updateBtn = `
       <a target="_blank" style="font-size:15px !important;" href="https://join.skype.com/rgqRzMIWrlWI" class="premium bold underline">JOIN OUR SKYPE GROUP.</a>`;
      const newDiv = document.createElement("div");
      newDiv.innerHTML = updateBtn;

      document.querySelector(".unique").appendChild(newDiv);
    }
  })
  .catch((error) => {
    console.error("Error fetching the JSON:", error);
  });
