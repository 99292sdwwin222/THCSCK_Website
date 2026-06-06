import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA39JgS-0RUYWgWPsOR-dQdISD2IE3dFlo",
  authDomain: "thcsck-website.firebaseapp.com",
  projectId: "thcsck-website",
  storageBucket: "thcsck-website.firebasestorage.app",
  messagingSenderId: "2526504564",
  appId: "1:2526504564:web:7c6b25a314f029c1a0d321"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const loggedInUser = localStorage.getItem("loggedInUser");

let currentRoomId = "";

const grpModal = document.getElementById("grpModal");
const groupRoomsContainer = document.getElementById("groupRoomsContainer");
const chatMessagesBox = document.getElementById("chatMessagesBox");
const chatMsgInput = document.getElementById("chatMsgInput");

// Đóng mở modal tạo nhóm công khai
document.getElementById("btnGroupOpen").addEventListener("click", () => grpModal.style.display = "flex");
document.getElementById("btnCancelGrp").addEventListener("click", () => grpModal.style.display = "none");

// Tạo phòng chat mới lưu thẳng lên DB
document.getElementById("btnConfirmGrp").addEventListener("click", () => {
    const name = document.getElementById("newGrpName").value.trim();
    if(name === "") return alert("Nhập tên phòng!");

    const roomsRef = ref(db, 'chat_rooms');
    const newRoomRef = push(roomsRef);
    set(newRoomRef, { name: name });

    document.getElementById("newGrpName").value = "";
    grpModal.style.display = "none";
});

// Lắng nghe danh sách phòng chat Real-time từ DB về Sidebar
onValue(ref(db, 'chat_rooms'), (snapshot) => {
    groupRoomsContainer.innerHTML = "";
    const rooms = snapshot.val();
    if(!rooms) return;

    Object.keys(rooms).forEach(id => {
        const item = document.createElement("div");
        item.className = "room-item";
        item.innerHTML = `<img src="../../../Icons/avtreg.png" style="width:30px;height:30px;border-radius:50%"> <span>${rooms[id].name}</span>`;
        item.onclick = () => loadRoomMessages(id, rooms[id].name);
        groupRoomsContainer.appendChild(item);
    });
});

// Đồng bộ tin nhắn Realtime của phòng được chọn
function loadRoomMessages(roomId, roomName) {
    currentRoomId = roomId;
    document.getElementById("activeRoomTitle").innerText = roomName;

    onValue(ref(db, 'messages/' + roomId), (snapshot) => {
        chatMessagesBox.innerHTML = "";
        const msgs = snapshot.val();
        if(!msgs) return;

        Object.keys(msgs).forEach(mid => {
            const m = msgs[mid];
            const isMe = m.sender === loggedInUser;
            const div = document.createElement("div");
            div.className = isMe ? "msg msg-send" : "msg msg-receive";
            div.innerHTML = isMe ? m.text : `<b style="font-size:0.75rem; color:#0056b3;">@${m.sender}:</b><br>${m.text}`;
            chatMessagesBox.appendChild(div);
        });
        chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    });
}

// Gửi tin nhắn real-time lên server để 2 máy tính / điện thoại đồng thời hiển thị luôn
document.getElementById("btnSendChat").addEventListener("click", sendMsgFunc);
chatMsgInput.addEventListener("keypress", (e) => { if(e.key === "Enter") sendMsgFunc(); });

function sendMsgFunc() {
    if(!loggedInUser) return alert("Bạn cần đăng nhập để chat!");
    if(!currentRoomId) return alert("Hãy chọn một phòng chat!");
    const txt = chatMsgInput.value.trim();
    if(txt === "") return;

    const msgRef = ref(db, 'messages/' + currentRoomId);
    push(msgRef, {
        sender: loggedInUser,
        text: txt,
        time: Date.now()
    });
    chatMsgInput.value = "";
}