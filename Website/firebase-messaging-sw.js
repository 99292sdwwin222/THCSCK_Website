import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

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

// Khởi tạo các dịch vụ
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messaging = getMessaging(app);

// Cặp khóa công khai (VAPID Key) để định danh quyền đẩy thông báo của dự án thcsck-website
const VAPID_KEY = "BDp_ZzN8_lK6J5zP0p77kF-O_YyW6x7vE4-V0J8k_vD-o_K1GjV4j9V9bX4K5n8M9L-O4P-X8J6n4V7V8B9N0M4";

document.addEventListener("DOMContentLoaded", () => {
    const authArea = document.getElementById("authArea");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
        // 1. Lấy dữ liệu Realtime từ Firebase về để hiển thị lên Header
        const userRef = ref(db, 'users/' + loggedInUser);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const avt = data.avatar || "Frontend/Icons/avtreg.png";
                authArea.innerHTML = `
                    <div class="user-profile-header" id="profileTrigger">
                        <img src="${avt}" class="avatar-header" alt="Avatar" onerror="this.src='Frontend/Icons/avtreg.png'">
                        <div class="user-info-text">
                            <span class="display-name-header">${data.displayName}</span>
                            <span class="username-header">@${data.username}</span>
                        </div>
                        
                        <div class="profile-dropdown" id="profileDropdown">
                            <div class="dropdown-block" style="text-align: center;">
                                <img src="${avt}" style="width:70px; height:70px; border-radius:5px; object-fit:cover;" onerror="this.src='Frontend/Icons/avtreg.png'"><br>
                                <strong>${data.displayName}</strong> | <span>@${data.username}</span>
                            </div>
                            <div class="dropdown-block">
                                <strong>Trạng thái:</strong> <span>${data.status || "Chưa thiết lập"}</span>
                            </div>
                            <div class="dropdown-block">
                                <strong>Nhật ký:</strong> <span>${data.diary || "Trống"}</span>
                            </div>
                            <div class="dropdown-block" style="display:flex; justify-content:space-between;">
                                <span>👥 Bạn bè: 0</span>
                                <span>📝 Bài đăng: 0</span>
                            </div>
                            <div class="dropdown-block">
                                <button id="btnLogOut" style="width:100%; padding:8px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">Đăng xuất</button>
                            </div>
                        </div>
                    </div>
                `;

                // Xử lý đóng mở dropdown cá nhân
                const trigger = document.getElementById("profileTrigger");
                const dropdown = document.getElementById("profileDropdown");
                trigger.addEventListener("click", (e) => {
                    e.stopPropagation();
                    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
                });
                document.addEventListener("click", () => { dropdown.style.display = "none"; });
                
                document.getElementById("btnLogOut").addEventListener("click", () => {
                    localStorage.removeItem("loggedInUser");
                    window.location.reload();
                });
            }
        });

        // 2. Yêu cầu cấp quyền thông báo đẩy và lưu Token của User lên Firebase Database thật
        yêuCầuCấpQuyềnThôngBáo(loggedInUser);
    }
});

// Hàm xin quyền trình duyệt công khai
function yêuCầuCấpQuyềnThôngBáo(username) {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Đã được người dùng cấp quyền thông báo.');
            
            // Lấy Token định danh thiết bị từ Firebase Messaging
            getToken(messaging, { vapidKey: VAPID_KEY }).then((currentToken) => {
                if (currentToken) {
                    console.log('FCM Token của thiết bị này:', currentToken);
                    
                    // Lưu Token này vào nhánh user tương ứng trên Realtime Database để sau này gọi lệnh gửi là máy họ rung/kêu luôn
                    set(ref(db, 'users/' + username + '/fcmToken'), currentToken);
                } else {
                    console.log('Không thể lấy được Token. Hãy kiểm tra lại cấu hình Cloud Messaging.');
                }
            }).catch((err) => {
                console.error('Gặp lỗi khi lấy Token:', err);
            });
        } else {
            console.warn('Người dùng đã từ chối cấp quyền thông báo.');
        }
    });
}

// 3. Đăng ký Service Worker ngầm trực tiếp bằng đường dẫn Root phục vụ Firebase Hosting
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
        console.log('Firebase Service Worker đã sẵn sàng hoạt động tại Scope:', registration.scope);
    })
    .catch((err) => {
        console.error('Lỗi đăng ký Service Worker trên Hosting:', err);
    });
}