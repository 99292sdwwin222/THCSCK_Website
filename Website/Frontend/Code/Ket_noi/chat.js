import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA39JgS-0RUYWgWPsOR-dQdISD2IE3dFlo",
  authDomain: "thcsck-website.firebaseapp.com",
  projectId: "thcsck-website",
  storageBucket: "thcsck-website.firebasestorage.app",
  messagingSenderId: "2526504564",
  appId: "1:2526504564:web:7c6b25a314f029c1a0d321",
  measurementId: "G-0WKFR8CJ09",
  databaseURL: "https://thcsck-website-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Hàm thông báo Loại 1
function showToastTop(message, type = "success") {
    let container = document.getElementById("toast-container-top");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container-top";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast-top ${type}`;
    toast.innerHTML = `<span>${message}</span><div class="toast-progress"></div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

// Logic bấm nút tạo phòng chat mới
document.getElementById("btnConfirmGrp").addEventListener("click", async () => {
    const roomName = document.getElementById("newGrpName").value.trim();
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!roomName) {
        showToastTop("Vui lòng nhập tên nhóm chat!", "warning");
        return;
    }

    try {
        const roomsRef = ref(db, 'chatRooms');
        const newRoomRef = push(roomsRef);

        await set(newRoomRef, {
            roomName: roomName,
            createdBy: loggedInUser,
            createdAt: Date.now()
        });

        showToastTop(`Đã tạo phòng nhóm "${roomName}" thành công!`, "success");
        document.getElementById("newGrpName").value = "";
        document.getElementById("grpModal").style.display = "none"; // Ẩn khung modal nhập tên
    } catch (error) {
        console.error(error);
        showToastTop("Không thể khởi tạo phòng chat nhóm!", "error");
    }
});

// Logic gửi tin nhắn chat công cộng / nhóm
document.getElementById("btnSendChat").addEventListener("click", () => {
    const msg = document.getElementById("chatMsgInput").value.trim();
    if (!msg) {
        showToastTop("Không thể gửi tin nhắn trống!", "warning");
        return;
    }
    // Code push tin nhắn lên nhánh phòng chat của bạn giữ nguyên bên dưới...
});