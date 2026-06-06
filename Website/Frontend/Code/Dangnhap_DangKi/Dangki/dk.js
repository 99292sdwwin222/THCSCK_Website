import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const inpUser = document.getElementById("inpUser");
const inpPass = document.getElementById("inpPass");
const inpConfirm = document.getElementById("inpConfirm");
const lblStrength = document.getElementById("lblStrength");
const fileInp = document.getElementById("fileInp");
const imgView = document.getElementById("imgView");
let strAvt = "";

// Đổi ảnh cục bộ
fileInp.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const r = new FileReader();
        r.onload = (ev) => { imgView.src = ev.target.result; strAvt = ev.target.result; };
        r.readAsDataURL(file);
    }
});

// Kiểm tra định dạng tên đăng nhập
inpUser.addEventListener("input", () => {
    const res = /^[a-zA-Z0-9_.]+$/.test(inpUser.value);
    document.getElementById("ctrlUser").className = res ? "control dung" : "control sai";
});

// Đánh giá mật khẩu
inpPass.addEventListener("input", () => {
    let v = inpPass.value;
    if(v.length < 5) { lblStrength.innerText = "Mật khẩu: Yếu ❌"; lblStrength.style.color="red"; }
    else if(v.length < 8) { lblStrength.innerText = "Mật khẩu: Trung bình ⚠️"; lblStrength.style.color="orange"; }
    else { lblStrength.innerText = "Mật khẩu: Mạnh  🔥"; lblStrength.style.color="green"; }
});

// Khớp mật khẩu
inpConfirm.addEventListener("input", () => {
    const khop = inpConfirm.value === inpPass.value;
    document.getElementById("ctrlConfirm").className = khop ? "control dung" : "control sai";
});

// Gửi thẳng lên Firebase Realtime Database
document.getElementById("dkForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (inpConfirm.value !== inpPass.value) return alert("Xác nhận mật khẩu sai!");
    
    const u = inpUser.value.trim();
    const userRef = ref(db, 'users/' + u);
    
    // Check trùng tài khoản thời gian thực
    const snap = await get(userRef);
    if(snap.exists()) return alert("Tên đăng nhập này đã tồn tại trên hệ thống!");

    await set(userRef, {
        username: u,
        displayName: document.getElementById("inpDisplay").value,
        contact: document.getElementById("inpContact").value,
        password: inpPass.value,
        pin: document.getElementById("inpPin").value,
        avatar: strAvt || "../../../Icons/avtreg.png",
        status: "🌱 Đang trực tuyến",
        diary: "Chào mừng đến với trang cá nhân của tôi!"
    });

    alert("Đăng ký tài khoản REAL-TIME thành công!");
    window.location.href = "../Dangnhap/dn.html";
});