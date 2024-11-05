chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
      url: "popup.html", // 열고자 하는 HTML 파일 경로
      type: "popup",
      width: 450,
      height: 550,
      focused: true       // 창에 포커스를 맞춤
    });
  });
  