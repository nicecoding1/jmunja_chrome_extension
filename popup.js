// 저장 버튼 클릭 시 ID와 비밀번호 저장
document.getElementById("saveAuth").addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    chrome.storage.local.set({ username, password }, () => {
      alert("API 인증 정보가 저장되었습니다.");
    });
  });
  
  // 페이지 로드 시 저장된 ID와 비밀번호 불러오기
  document.addEventListener("DOMContentLoaded", () => {
    const nowsend = document.getElementById("nowsend");
    const ressend = document.getElementById("ressend");
    const ressendSet = document.getElementById("ressend_set");

    // 라디오 버튼이 변경될 때 예약발송 설정 표시 상태 변경
    nowsend.addEventListener("change", () => {
      if (nowsend.checked) {
        ressendSet.style.display = "none";
      }
    });

    ressend.addEventListener("change", () => {
      if (ressend.checked) {
        ressendSet.style.display = "block";
      }
    });

    chrome.storage.local.get(["username", "password"], (result) => {
      if (result.username) document.getElementById("username").value = result.username;
      if (result.password) document.getElementById("password").value = result.password;
    });
  });
  
  // 발송 버튼 클릭 시 API 호출
  document.getElementById("send").addEventListener("click", async () => {
    const nowsend = document.getElementById("nowsend");
    const ressend = document.getElementById("ressend");
    var ressendSet = document.getElementById("ressend_set");
    const resDateInput = document.getElementById("res_date");
    const resTimeInput = document.getElementById("res_time");

    var resDate = "";
    var resTime = "";

    const title = document.getElementById("title").value;
    const message = document.getElementById("message").value;
    const reqlist = document.getElementById("reqlist").value;

    if (!title || !message || !reqlist) {
        alert("제목, 내용, 수신번호를 모두 입력하세요.");
        return;
    }

    if (ressend.checked) { // 예약발송인 경우 날짜와 시간을 추가
      resDate = resDateInput.value;
      resTime = resTimeInput.value;

      // 예약 날짜와 시간이 비어 있으면 경고 메시지 출력
      if (!resDate || !resTime) {
        alert("예약 발송 날짜와 시간을 입력해주세요.");
        return;
      }

      ressendSet = 'Y';
    } else {
      resDate = "";
      resTime = "";
      ressendSet = 'N';
    }

    // 수신번호를 줄 단위로 구분하고, |로 연결된 문자열로 변환
    const recipients = reqlist
    .split("\n")                // 줄바꿈을 기준으로 분할하여 배열로 변환
    .map(number => number.trim()) // 각 번호의 공백을 제거
    .filter(number => number)    // 빈 줄 제거
    .join("|");                 // 각 번호를 |로 연결
  
    // 저장된 API 인증 정보 불러오기
    chrome.storage.local.get(["username", "password"], async (result) => {
      if (!result.username || !result.password) {
        alert("API 인증 정보가 필요합니다.");
        return;
      }

      if(!confirm('문자를 발송하시겠습니까?')) return;
  
      // API 호출
      try {
        const formData = new URLSearchParams();
        formData.append("id", result.username);
        formData.append("pw", result.password);
        formData.append("mode", "send");
        formData.append("title", title);
        formData.append("message", message);
        formData.append("reqlist", recipients);
        formData.append("reserv_fg", ressendSet);
        formData.append("send_dttm", resDate + " " + resTime);
  
        const response = await fetch("https://jmunja.com/sms/app/api_v2.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
  
        // JSON 형식의 응답 처리
        if (response.ok) {
            const jsonResponse = await response.json();
    
            // result_code와 result_message를 추출하여 표시
            const resultCode = jsonResponse.result_code;
            const resultMessage = jsonResponse.result_message;
    
            alert(`발송 결과: ${resultMessage} (코드: ${resultCode})`);
          } else {
            alert("메시지 발송에 실패했습니다.");
          }
      } catch (error) {
        console.error("API 호출 실패:", error);
        alert("메시지 발송 중 오류가 발생했습니다.");
      }
    });
  });
  