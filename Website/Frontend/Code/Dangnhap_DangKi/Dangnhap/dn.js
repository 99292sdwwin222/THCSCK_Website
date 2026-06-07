import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA39JgS-0RUYWgWPsOR-dQdISD2IE3dFlo",
  authDomain: "thcsck-website.firebaseapp.com",
  projectId: "thcsck-website",
  storageBucket: "thcsck-website.firebasestorage.app",
  messagingSenderId: "2526504564",
  appId: "1:2526504564:web:7c6b25a314f029c1a0d321",
  databaseURL: "https://thcsck-website-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("dnForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = document.getElementById("dnUser").value.trim();
    const p = document.getElementById("dnPass").value;
    const pin = document.getElementById("dnPin").value;

    const userRef = ref(db, 'users/' + u);
    const snap = await get(userRef);

    if (snap.exists()) {
        const userData = snap.val();
        if (userData.password === p && userData.pin === pin) {
            localStorage.setItem("loggedInUser", u);
            alert("Đăng nhập thành công thực tế!");
            window.location.href = "../../../../index.html";
        } else {
            alert("Sai mật khẩu hoặc mã PIN bảo mật!");
        }
    } else {
        alert("Tài khoản này không tồn tại!");
    }
});