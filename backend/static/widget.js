(function () {
  const script = document.currentScript;
  const widgetId = script.getAttribute("data-id");
  const API_BASE = script.src.replace("/widget.js", "");

  let sessionId = null;

  // --- 스타일 ---
  const style = document.createElement("style");
  style.textContent = `
    #shoprag-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: #2563eb; color: #fff; border: none;
      font-size: 26px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    #shoprag-window {
      position: fixed; bottom: 92px; right: 24px;
      width: 340px; height: 480px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex; flex-direction: column;
      z-index: 9998; overflow: hidden; font-family: sans-serif;
    }
    #shoprag-window.hidden { display: none; }
    #shoprag-header {
      background: #2563eb; color: #fff;
      padding: 14px 18px; font-weight: 600; font-size: 15px;
    }
    #shoprag-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .shoprag-msg {
      max-width: 80%; padding: 9px 13px;
      border-radius: 12px; font-size: 14px; line-height: 1.5; white-space: pre-wrap;
    }
    .shoprag-msg.user {
      align-self: flex-end; background: #2563eb; color: #fff;
      border-bottom-right-radius: 4px;
    }
    .shoprag-msg.assistant {
      align-self: flex-start; background: #f1f5f9; color: #1e293b;
      border-bottom-left-radius: 4px;
    }
    #shoprag-input-row {
      display: flex; gap: 8px; padding: 12px;
      border-top: 1px solid #e2e8f0;
    }
    #shoprag-input {
      flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1;
      border-radius: 8px; font-size: 14px; outline: none;
    }
    #shoprag-send {
      padding: 8px 14px; background: #2563eb; color: #fff;
      border: none; border-radius: 8px; cursor: pointer; font-size: 14px;
    }
    #shoprag-send:disabled { background: #94a3b8; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // --- 버튼 ---
  const btn = document.createElement("button");
  btn.id = "shoprag-btn";
  btn.innerHTML = "💬";
  document.body.appendChild(btn);

  // --- 창 ---
  const win = document.createElement("div");
  win.id = "shoprag-window";
  win.classList.add("hidden");
  win.innerHTML = `
    <div id="shoprag-header">고객 상담</div>
    <div id="shoprag-messages"></div>
    <div id="shoprag-input-row">
      <input id="shoprag-input" type="text" placeholder="메시지를 입력하세요..." />
      <button id="shoprag-send">전송</button>
    </div>
  `;
  document.body.appendChild(win);

  const messagesEl = document.getElementById("shoprag-messages");
  const inputEl = document.getElementById("shoprag-input");
  const sendBtn = document.getElementById("shoprag-send");

  // --- 토글 ---
  btn.addEventListener("click", async () => {
    const isHidden = win.classList.toggle("hidden");
    if (!isHidden && !sessionId) {
      await createSession();
    }
  });

  // --- 세션 생성 ---
  async function createSession() {
    try {
      const res = await fetch(`${API_BASE}/api/chat/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widget_id: widgetId }),
      });
      const data = await res.json();
      sessionId = data.id;
      appendMessage("assistant", "안녕하세요! 무엇이든 물어보세요.");
    } catch {
      appendMessage("assistant", "연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  // --- 메시지 전송 ---
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || !sessionId) return;

    inputEl.value = "";
    sendBtn.disabled = true;
    appendMessage("user", text);

    try {
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, content: text }),
      });
      const data = await res.json();
      appendMessage("assistant", data.content);
    } catch {
      appendMessage("assistant", "오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) sendMessage();
  });

  function appendMessage(role, content) {
    const el = document.createElement("div");
    el.className = `shoprag-msg ${role}`;
    el.textContent = content;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
})();
