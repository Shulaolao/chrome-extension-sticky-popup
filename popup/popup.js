const target = {
  visible: false,
  sticky: false,
};
const input = new Proxy(target, {
  set(target, prop, val) {
    target[prop] = val;
    chrome.storage?.local.set({ [prop]: val });
    localStorage?.setItem([prop], val);
    return true;
  },
  get(target, prop) {
    return target[prop];
  },
});

// 为扩展 popup 添加点击事件
document.addEventListener("DOMContentLoaded", () => {
  input.visible =
    (localStorage && JSON.parse(localStorage?.getItem("visible"))) ?? false;
  input.sticky =
    (localStorage && JSON.parse(localStorage?.getItem("sticky"))) ?? false;

  chrome.storage?.local.get(["visible", "sticky"]).then((res) => {
    input.visible = res["visible"] ?? false;
    input.sticky = res["sticky"] ?? false;
  });

  chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs?.sendMessage(
      tabs[0].id,
      { value: input.visible, message: "visible" },
      (response) => {
        // console.log(response);
      }
    );
  });

  let checkbox = document.querySelector(".switch-checkbox");
  checkbox.checked = input.visible;
  checkbox.addEventListener("click", () => {
    input.visible = !input.visible;
    checkbox.checked = input.visible;

    if (input.visible) {
      // chrome.windows?.create({
      //   url: "popup/sticky.html",
      //   type: "popup",
      //   width: 400,
      //   height: 400,
      //   focused: true,
      // });
    }
    // 长连接
    // chrome.tabs.query(
    //   {
    //     active: true,
    //     currentWindow: true,
    //   },
    //   function (tabs) {
    //     const port = chrome.tabs.connect(
    //       //建立通道
    //       tabs[0].id,
    //       { name: "shulao" } //通道名称
    //     );
    //     port.postMessage({
    //       visible: input.visible,
    //       message: "switch click",
    //       type: "long",
    //     });
    //   }
    // );
    // 短连接
    // chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
    //   chrome.tabs?.sendMessage(
    //     tabs[0].id,
    //     { visible: input.visible, message: "switch click", type: "shot" },
    //     (response) => {
    //       // console.log("popup: from activeTab response", response);
    //     }
    //   );
    // });

    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs?.sendMessage(
        tabs[0].id,
        { value: input.visible, message: "visible" },
        (response) => {
          // console.log(response);
        }
      );
    });
  });

  let sticky = document.querySelector(".sticky-checkbox");
  sticky.checked = input.sticky;
  sticky.addEventListener("click", () => {
    input.sticky = !input.sticky;
    sticky.checked = input.sticky;
    // 长连接
    // chrome.tabs.query(
    //   {
    //     active: true,
    //     currentWindow: true,
    //   },
    //   function (tabs) {
    //     const port = chrome.tabs.connect(
    //       //建立通道
    //       tabs[0].id,
    //       { name: "shulao" } //通道名称
    //     );
    //     port.postMessage({
    //       sticky: input.sticky,
    //       message: "sticky click",
    //       type: "long",
    //     });
    //   }
    // );
    // 短连接
    // chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
    //   chrome.tabs?.sendMessage(
    //     tabs[0].id,
    //     { sticky: input.sticky, message: "sticky click", type: "shot" },
    //     (response) => {
    //       console.log("popup: from activeTab response", response);
    //     }
    //   );
    // });
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs?.sendMessage(
        tabs[0].id,
        { value: input.sticky, message: "sticky" },
        (response) => {
          // console.log(response);
        }
      );
    });
  });

  // 监听浮窗的显示隐藏、固定与否
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "visible" || request.message === "sticky") {
      input[request.message] = request.value;
    }
    sendResponse({
      message: "success",
    });
  });
});

// 监听长连接
// chrome.runtime.onConnect.addListener((port) => {
//   port.name === "shulao" &&
//     port.onMessage.addListener((msg) => {
//       console.log("popup onConnect onMessage", msg);
//       if (msg.message === "content") {
//         chrome.tabs.query(
//           {
//             active: true,
//             currentWindow: true,
//           },
//           function (tabs) {
//             const port = chrome.tabs.connect(
//               //建立通道
//               tabs[0].id,
//               { name: "shulao" } //通道名称
//             );
//             port.postMessage({
//               reply: "got it, content",
//               type: "long",
//             });
//           }
//         );
//       } else if (msg.answer === "reply switch") {
//         chrome.tabs.query(
//           {
//             active: true,
//             currentWindow: true,
//           },
//           function (tabs) {
//             const port = chrome.tabs.connect(
//               //建立通道
//               tabs[0].id,
//               { name: "shulao" } //通道名称
//             );
//             port.postMessage({
//               reply: "got it, switch",
//               type: "long",
//             });
//           }
//         );
//       } else if (msg.answer === "reply sticky") {
//         chrome.tabs.query(
//           {
//             active: true,
//             currentWindow: true,
//           },
//           function (tabs) {
//             const port = chrome.tabs.connect(
//               //建立通道
//               tabs[0].id,
//               { name: "shulao" } //通道名称
//             );
//             port.postMessage({
//               reply: "got it, sticky",
//               type: "long",
//             });
//           }
//         );
//       } else {
//         chrome.tabs.query(
//           {
//             active: true,
//             currentWindow: true,
//           },
//           function (tabs) {
//             const port = chrome.tabs.connect(
//               //建立通道
//               tabs[0].id,
//               { name: "shulao" } //通道名称
//             );
//             port.postMessage({
//               reply: msg.reply || msg.message,
//               type: msg.type,
//             });
//           }
//         );
//       }
//     });
// });
// 监听短连接
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   console.log("popup onMessage", msg);
//   if (msg.type !== "shot") {
//     sendResponse({
//       message: "error",
//       type: msg.type,
//     });
//     return;
//   }
//   if (msg.answer === "reply switch") {
//     sendResponse({
//       reply: "got it, switch",
//     });
//   } else if (msg.answer === "reply sticky") {
//     sendResponse({
//       reply: "got it, sticky",
//     });
//   } else {
//     sendResponse({
//       reply: msg.reply || msg.message,
//       type: msg.type,
//     });
//   }
// });
