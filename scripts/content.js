// 建立长连接
// const port = chrome.runtime.connect({ name: "shulao" });
// port.postMessage({ message: "connect", type: "long" });
// 长连接监听
// chrome.runtime.onConnect.addListener((port) => {
//   port.name === "shulao" &&
//     port.onMessage.addListener((msg) => {
//       console.log("content port onMessage", msg);
//       if (msg.type !== "long") {
//         const port = chrome.runtime.connect({ name: "shulao" });
//         port.postMessage({ message: "error", type: msg.type });
//         return;
//       }
//       if (msg.message === "switch click") {
//         const port = chrome.runtime.connect({ name: "shulao" });
//         port.postMessage({ answer: "reply switch", type: "long" });
//       } else if (msg.message === "sticky click") {
//         const port = chrome.runtime.connect({ name: "shulao" });
//         port.postMessage({ answer: "reply sticky", type: "long" });
//       } else if (msg.reply === "got it, switch") {
//         const port = chrome.runtime.connect({ name: "shulao" });
//         port.postMessage({
//           message: "end",
//           type: "long",
//         });
//       } else if (msg.reply === "got it, sticky") {
//         const port = chrome.runtime.connect({ name: "shulao" });
//         port.postMessage({
//           message: "end",
//           type: "long",
//         });
//       }
//     });
// });

// 短连接监听
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 异步 sendResponse
  /* function getResponse(request, sender, sendResponse) {
      new Promise((resolve) => {
        setTimeout(() => {
          console.log(111);
          resolve();
        }, 1000);
      }).then(() => {
        sendResponse({
          message: "success",
          type: "shot",
          t: new Date().getTime(),
        });
      });
    }
  
    getResponse(request, sender, sendResponse);
    return true; */

  const callback = () => {
    sendResponse({
      message: "success",
    });
  };
  if (request.message === "visible" || request.message === "sticky") {
    try {
      switch (request.value) {
        case true:
          setPopup(request.message, true, callback);
          break;

        case false:
          setPopup(request.message, false, callback);
          break;

        default:
          break;
      }
      return true;
    } catch (error) {
      sendResponse({
        message: error.msg || "error",
      });
    }
  } else {
    sendResponse({
      message: "unknown: " + request.message,
    });
  }
});

// 固定框
const setPopup = (action, value, callback) => {
  if (action === "visible") {
    value && popup.getVisible() === false && popup.setVisible(true);
    !value && popup.setVisible(false);
  } else {
    value && popup.getSticky() === true && popup.setSticky(true);
    !value && popup.setSticky(false);
  }
  callback();
};

// 创建浮窗类
class Popup {
  constructor(url) {
    this.visible = false;
    this.sticky = false;
    this.popup = null;
    this.url = url || "https://developer.chrome.com/docs/";
    this.initPopup();
  }

  initPopup() {
    const fragment = document.createDocumentFragment();
    const popup = document.createElement("div");
    const iframe = document.createElement("iframe");
    const closeBtn = document.createElement("div");
    const header = document.createElement("header");

    closeBtn.style.display = "flex";
    header.style.justifyContent = "center";
    header.style.alignItems = "center";
    closeBtn.style.width = "20px";
    closeBtn.style.height = "20px";
    closeBtn.innerText = "X";
    closeBtn.style.fontSize = "16px";
    closeBtn.style.color = "#ffffff";
    closeBtn.style.cursor = "pointer";

    header.style.display = "flex";
    header.style.justifyContent = "flex-end";
    header.style.alignItems = "center";
    header.style.padding = "10px";
    header.style.backgroundColor = "#5caf9e";
    header.style.cursor = "move";
    header.style.height = "40px";
    header.style.borderRadius = "8px 8px 0 0";

    iframe.style.width = "100%";
    iframe.style.marginTop = "10px";
    iframe.style.height = "calc(100% - 50px)";
    iframe.src = this.url;

    popup.style.display = "none";
    popup.style.position = "fixed";
    popup.style.top = "10%";
    popup.style.left = "10%";
    popup.style.zIndex = "99999999";
    popup.style.minWidth = "600px";
    popup.style.minHeight = "400px";
    popup.style.width = "600px";
    popup.style.height = "400px";
    popup.style.backgroundColor = "white";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    popup.style.resize = "both";
    popup.style.overflow = "hidden";

    popup.class = "popup";
    popup.id = "popup";

    this.popup = popup;

    header.appendChild(closeBtn);
    popup.appendChild(header);
    popup.appendChild(iframe);
    fragment.appendChild(popup);
    document.body.appendChild(fragment);

    header.addEventListener("mousedown", this.handleMouseDown);

    closeBtn.addEventListener("click", () => {
      this.setVisible(false);
    });

    document.addEventListener("click", (e) => {
      const { x, y } = e;
      const { left, top, width, height } = this.popup.getBoundingClientRect();
      if (x < left || x > left + width || y < top || y > top + height) {
        !this.getSticky() && this.setVisible(false);
      }
    });
  }

  handleMouseDown(e) {
    const popup = this.parentElement;
    let offsetX = e.clientX - popup?.offsetLeft;
    let offsetY = e.clientY - popup?.offsetTop;

    // 鼠标移动事件处理函数
    document.addEventListener("mousemove", dragPopup);

    // 鼠标释放事件处理函数
    document.addEventListener("mouseup", function () {
      document.removeEventListener("mousemove", dragPopup);
    });

    // 拖动窗口函数
    function dragPopup(e) {
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;
      newX > 0 && (popup.style.left = newX + "px");
      newY > 0 && (popup.style.top = newY + "px");
    }
  }

  getVisible() {
    return this.visible;
  }

  getSticky() {
    return this.sticky;
  }

  setVisible(value) {
    this.visible = value;
    value &&
      (this.popup.style.display = "block") &&
      this.reSetPosition({ left: "10%", top: "10%" });
    !value && (this.popup.style.display = "none");
    chrome.runtime.sendMessage({ message: "visible", value: value });
  }

  setSticky(value) {
    this.sticky = value;
    chrome.runtime.sendMessage({ message: "sticky", value: value });
  }

  reSetPosition({ left, top } = { left: "10%", top: "10%" }) {
    this.popup.style.left = typeof left === "number" ? left + "px" : left;
    this.popup.style.top = typeof top === "number" ? top + "px" : top;
  }

  removePopup() {
    this.popup.removeEventListener("mousedown", this.handleMouseDown);
    document.body.removeChild(this.popup);
  }
}

// 输入你想要弹出来的网页地址
const popup = new Popup("https://developer.chrome.com/docs/extensions/how-to");
