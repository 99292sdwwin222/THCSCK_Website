import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// VỊ TRÍ 1: Thêm "set" để lưu token và import các hàm của Firebase Messaging
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyA39JgS-0RUYWgWPsOR-dQdISD2IE3dFlo",
  authDomain: "thcsck-website.firebaseapp.com",
  projectId: "thcsck-website",
  storageBucket: "thcsck-website.firebasestorage.app",
  messagingSenderId: "2526504564",
  appId: "1:2526504564:web:7c6b25a314f029c1a0d321",
  measurementId: "G-0WKFR8CJ09"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
// Khởi tạo dịch vụ Messaging
const messaging = getMessaging(app);

// 🔴 CHÚ Ý: Hãy thay chuỗi này bằng mã VAPID thật bạn lấy trên Firebase Console nhé!
const VAPID_KEY = "BJjbtEkO0g86Qiy48CtMWvzYZ3iNsUBXVVbxWr7LPXDKApti5r7rMNRvCdeOdJZtWHPCpq9QcCB2uJtOozjNaVE";

document.addEventListener("DOMContentLoaded", () => {
    const authArea = document.getElementById("authArea");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
        // Lấy dữ liệu Realtime từ Firebase về để hiển thị lên Header
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

        // VỊ TRÍ 2: Gọi hàm kích hoạt xin quyền và lấy Token ngay sau khi user đăng nhập thành công
        yêuCầuCấpQuyềnThôngBáo(loggedInUser);
    }
});

// VỊ TRÍ 3: Thêm hàm xử lý xin quyền hiển thị thông báo & đăng ký Service Worker root
function yêuCầuCấpQuyềnThôngBáo(username) {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Đã được người dùng cấp quyền thông báo.');
            
            // Lấy Token thiết bị từ Firebase Cloud Messaging
            getToken(messaging, { vapidKey: VAPID_KEY }).then((currentToken) => {
                if (currentToken) {
                    console.log('FCM Token của thiết bị này:', currentToken);
                    // Lưu Token thẳng vào nhánh dữ liệu của user trên Realtime Database
                    set(ref(db, 'users/' + username + '/fcmToken'), currentToken);
                } else {
                    console.log('Không lấy được Token. Hãy kiểm tra lại VAPID Key.');
                }
            }).catch((err) => {
                console.error('Lỗi khi lấy FCM Token:', err);
            });
        } else {
            console.warn('Người dùng từ chối cấp quyền thông báo.');
        }
    });
}

// Tự động kích hoạt Service Worker chạy ngầm tương thích với cấu trúc Firebase Hosting
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
        console.log('Service Worker hoạt động tại Scope:', registration.scope);
    })
    .catch((err) => {
        console.error('Lỗi đăng ký Service Worker:', err);
    });
}