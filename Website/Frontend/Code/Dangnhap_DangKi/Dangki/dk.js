import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Hàm thông báo Toast
function showToastTop(message, type = "success") {
    const container = document.getElementById("toast-container-top");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast-top ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

// Hàm thông báo Modal
function showModalCenter(title, message, type = "success") {
    const overlay = document.createElement("div");
    overlay.className = "modal-notify-overlay";
    const iconHtml = type === "success" ? "✓" : "✕";
    overlay.innerHTML = `
        <div class="modal-notify-card ${type}">
            <button class="modal-notify-close-x" id="modalCloseX">×</button>
            <div class="modal-notify-icon">${iconHtml}</div>
            <div class="modal-notify-title">${title}</div>
            <div class="modal-notify-text">${message}</div>
            <button class="modal-notify-btn" id="modalCloseBtn">Đóng</button>
        </div>
    `;
    document.body.appendChild(overlay);
    const closeModal = () => { overlay.remove(); clearTimeout(autoCloseTimeout); };
    overlay.querySelector("#modalCloseX").addEventListener("click", closeModal);
    overlay.querySelector("#modalCloseBtn").addEventListener("click", closeModal);
    const autoCloseTimeout = setTimeout(closeModal, 4000);
}

// Logic hiển thị ảnh xem trước
const fileInp = document.getElementById("fileInp");
const imgView = document.getElementById("imgView");

fileInp.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        if (!file.type.startsWith("image/")) {
            showToastTop("Vui lòng chọn tệp tin hình ảnh!", "warning");
            this.value = ""; 
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            imgView.src = e.target.result; 
        };
        reader.readAsDataURL(file);
    }
});

// Logic Submit Form Đăng Ký
document.getElementById("dkForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("inpUser").value.trim();
    const displayName = document.getElementById("inpDisplay").value.trim();
    const password = document.getElementById("inpPass").value;
    const confirmPass = document.getElementById("inpConfirm").value;
    const pin = document.getElementById("inpPin").value;
    const contact = document.getElementById("inpContact").value.trim();

    if (password !== confirmPass) {
        showToastTop("Mật khẩu xác nhận không trùng khớp!", "warning");
        return;
    }

    try {
        const userRef = ref(db, 'users/' + username);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            showModalCenter("ĐĂNG KÝ THẤT BẠI", "Tên đăng nhập này đã có người sử dụng!", "error");
        } else {
            const avatarData = imgView.src.includes("data:image") ? imgView.src : "";

            await set(userRef, {
                username: username,
                displayName: displayName,
                password: password,
                pin: pin,
                contact: contact,
                avatar: avatarData,
                status: "Thành viên mới",
                diary: ""
            });

            // SỬA Ở ĐÂY: Thông báo và tự động đăng nhập
            showModalCenter("ĐĂNG KÝ THÀNH CÔNG", "Hệ thống đang tự động đăng nhập cho bạn...", "success");
            
            setTimeout(() => {
                // Tự động gán user vào localStorage và bay thẳng ra trang chủ
                localStorage.setItem("loggedInUser", username);
                window.location.href = "/index.html";
            }, 2000);
        }
    } catch (error) {
        console.error(error);
        showToastTop("Lỗi hệ thống không thể đăng ký!", "error");
    }
});