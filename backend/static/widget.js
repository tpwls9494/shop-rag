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
      background: #3b82f6; color: #fff; border: none;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s;
    }
    #shoprag-btn:hover { transform: scale(1.08); }
    #shoprag-window {
      position: fixed; bottom: 92px; right: 24px;
      width: 340px; height: 500px;
      background: #1e293b; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: flex; flex-direction: column;
      z-index: 9998; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      border: 1px solid #334155;
    }
    #shoprag-window.hidden { display: none; }
    #shoprag-header {
      background: #0f172a; color: #f1f5f9;
      padding: 14px 18px; font-weight: 600; font-size: 15px;
      border-bottom: 1px solid #334155;
      display: flex; align-items: center; gap: 8px;
    }
    #shoprag-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      background: #1e293b;
    }
    #shoprag-messages::-webkit-scrollbar { width: 4px; }
    #shoprag-messages::-webkit-scrollbar-track { background: transparent; }
    #shoprag-messages::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }
    .shoprag-msg-wrap { display: flex; flex-direction: column; gap: 4px; }
    .shoprag-msg-wrap.user { align-items: flex-end; }
    .shoprag-msg-wrap.assistant { align-items: flex-start; }
    .shoprag-msg {
      max-width: 82%; padding: 9px 13px;
      border-radius: 12px; font-size: 14px; line-height: 1.55; white-space: pre-wrap;
    }
    .shoprag-msg.user {
      background: #3b82f6; color: #fff;
      border-bottom-right-radius: 4px;
    }
    .shoprag-msg.assistant {
      background: #334155; color: #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .shoprag-badge {
      font-size: 11px; padding: 2px 8px;
      border-radius: 999px; display: inline-flex; align-items: center; gap: 3px;
    }
    .shoprag-badge.rag {
      background: #1e3a5f; color: #60a5fa;
      border: 1px solid #2563eb44;
    }
    .shoprag-badge.direct {
      background: #1e293b; color: #94a3b8;
      border: 1px solid #47556944;
    }
    .shoprag-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 10px 14px;
      background: #334155; border-radius: 12px; border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .shoprag-typing span {
      width: 6px; height: 6px;
      background: #94a3b8; border-radius: 50%;
      animation: shoprag-bounce 1.2s infinite;
    }
    .shoprag-typing span:nth-child(2) { animation-delay: 0.2s; }
    .shoprag-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes shoprag-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    #shoprag-input-row {
      display: flex; gap: 8px; padding: 12px;
      border-top: 1px solid #334155;
      background: #0f172a;
    }
    #shoprag-input {
      flex: 1; padding: 8px 12px;
      background: #1e293b; color: #f1f5f9;
      border: 1px solid #475569;
      border-radius: 8px; font-size: 14px; outline: none;
    }
    #shoprag-input::placeholder { color: #64748b; }
    #shoprag-input:focus { border-color: #3b82f6; }
    #shoprag-send {
      width: 38px; height: 38px;
      background: #3b82f6; color: #fff;
      border: none; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; flex-shrink: 0;
    }
    #shoprag-send:hover { background: #2563eb; }
    #shoprag-send:disabled { background: #334155; color: #64748b; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // --- 플로팅 버튼 ---
  const btn = document.createElement("button");
  btn.id = "shoprag-btn";
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  document.body.appendChild(btn);

  // --- 창 ---
  const win = document.createElement("div");
  win.id = "shoprag-window";
  win.classList.add("hidden");
  win.innerHTML = `
    <div id="shoprag-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      고객 상담
    </div>
    <div id="shoprag-messages"></div>
    <div id="shoprag-input-row">
      <input id="shoprag-input" type="text" placeholder="메시지를 입력하세요..." />
      <button id="shoprag-send">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
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
      appendMessage("assistant", "안녕하세요! 무엇이든 물어보세요.", null);
    } catch {
      appendMessage("assistant", "연결에 실패했습니다. 잠시 후 다시 시도해주세요.", null);
    }
  }

  // --- 타이핑 인디케이터 ---
  function showTyping() {
    const wrap = document.createElement("div");
    wrap.className = "shoprag-msg-wrap assistant";
    wrap.id = "shoprag-typing-wrap";
    wrap.innerHTML = `<div class="shoprag-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("shoprag-typing-wrap");
    if (el) el.remove();
  }

  // --- 메시지 전송 ---
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || !sessionId) return;

    inputEl.value = "";
    sendBtn.disabled = true;
    appendMessage("user", text, null);
    showTyping();

    try {
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, content: text }),
      });
      const data = await res.json();
      hideTyping();
      appendMessage("assistant", data.content, data.route);
    } catch {
      hideTyping();
      appendMessage("assistant", "오류가 발생했습니다. 다시 시도해주세요.", null);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) sendMessage();
  });

  function appendMessage(role, content, route) {
    const wrap = document.createElement("div");
    wrap.className = `shoprag-msg-wrap ${role}`;

    const el = document.createElement("div");
    el.className = `shoprag-msg ${role}`;
    el.textContent = content;
    wrap.appendChild(el);

    if (role === "assistant" && route) {
      const badge = document.createElement("div");
      badge.className = `shoprag-badge ${route}`;
      badge.textContent = route === "rag" ? "📚 상품 정보 기반" : "💬 일반 답변";
      wrap.appendChild(badge);
    }

    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
})();
