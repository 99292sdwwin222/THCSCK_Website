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

// Hàm thông báo nhỏ gọn rớt từ trên xuống (Loại 1)
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

document.getElementById("btnPost").addEventListener("click", async () => {
    const content = document.getElementById("postContent").value.trim();
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        showToastTop("Bạn cần đăng nhập để thực hiện chức năng này!", "warning");
        return;
    }

    if (!content) {
        showToastTop("Nội dung bài viết không được để trống!", "warning");
        return;
    }

    try {
        const postsRef = ref(db, 'posts');
        const newPostRef = push(postsRef);
        
        await set(newPostRef, {
            author: loggedInUser,
            content: content,
            timestamp: Date.now()
        });

        showToastTop("Đăng bài viết lên diễn đàn thành công!", "success");
        document.getElementById("postContent").value = ""; // Xóa trống khung nhập
    } catch (error) {
        console.error(error);
        showToastTop("Lỗi khi tải bài viết lên server!", "error");
    }
});