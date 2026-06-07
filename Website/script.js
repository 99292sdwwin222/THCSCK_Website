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
  measurementId: "G-0WKFR8CJ09"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messaging = getMessaging(app);

const VAPID_KEY = "BJjbtEkO0g86Qiy48CtMWvzYZ3iNsUBXVVbxWr7LPXDKApti5r7rMNRvCdeOdJZtWHPCpq9QcCB2uJtOozjNaVE";

document.addEventListener("DOMContentLoaded", () => {
    const authArea = document.getElementById("authArea");
    
    // ĐỌC TRẠNG THÁI: Lấy user đã đăng nhập từ localStorage ra (Đã đăng nhập từ Đăng Ký)
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
        const userRef = ref(db, 'users/' + loggedInUser);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const avt = data.avatar || "/Frontend/Icons/avtreg.png";
                
                // RENDER GIAO DIỆN CHUNG 1 DÒNG
                authArea.innerHTML = `
                    <div class="user-profile-header" id="profileTrigger">
                        <img src="${avt}" class="avatar-header" alt="Avatar" onerror="this.src='/Frontend/Icons/avtreg.png'">
                        <div class="user-info-text">
                            <span class="display-name-header">${data.displayName}</span>
                            <span class="username-header">@${data.username}</span>
                        </div>
                        
                        <div class="profile-dropdown" id="profileDropdown">
                            <div class="dropdown-block" style="text-align: center;">
                                <img src="${avt}" style="width:80px; height:80px; border-radius:10px; object-fit:cover; margin-bottom:10px;" onerror="this.src='/Frontend/Icons/avtreg.png'"><br>
                                <strong style="font-size:1.2rem;">${data.displayName}</strong><br>
                                <span style="color:#666;">@${data.username}</span>
                            </div>
                            <div class="dropdown-block">
                                <strong>Trạng thái:</strong> <span>${data.status || "Chưa thiết lập"}</span>
                            </div>
                            <div class="dropdown-block">
                                <strong>Nhật ký:</strong> <span>${data.diary || "Trống"}</span>
                            </div>
                            <div class="dropdown-block" style="display:flex; justify-content:space-between; font-weight:bold;">
                                <span>👥 Bạn bè: 0</span>
                                <span>📝 Bài đăng: 0</span>
                            </div>
                            <div class="dropdown-block">
                                <button id="btnLogOut" style="width:100%; padding:10px; background:#dc3545; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem; transition: background 0.3s;">Đăng xuất</button>
                            </div>
                        </div>
                    </div>
                `;

                const trigger = document.getElementById("profileTrigger");
                const dropdown = document.getElementById("profileDropdown");
                
                // Logic bật tắt dropdown
                trigger.addEventListener("click", (e) => {
                    e.stopPropagation();
                    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
                });
                
                document.addEventListener("click", () => { dropdown.style.display = "none"; });
                
                // Logic đăng xuất
                document.getElementById("btnLogOut").addEventListener("click", () => {
                    localStorage.removeItem("loggedInUser");
                    window.location.reload();
                });
            }
        });

        yêuCầuCấpQuyềnThôngBáo(loggedInUser);
    }
});

function yêuCầuCấpQuyềnThôngBáo(username) {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            getToken(messaging, { vapidKey: VAPID_KEY }).then((currentToken) => {
                if (currentToken) {
                    set(ref(db, 'users/' + username + '/fcmToken'), currentToken);
                }
            }).catch((err) => {
                console.error('Lỗi lấy token:', err);
            });
        }
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
        console.log('Service Worker OK:', registration.scope);
    }).catch((err) => {
        console.error('Lỗi SW:', err);
    });
}