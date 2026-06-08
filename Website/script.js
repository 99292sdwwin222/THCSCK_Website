import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue,
    set
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import {
    getMessaging,
    getToken
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

// ================= FIREBASE CONFIG =================
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
const messaging = getMessaging(app);

const VAPID_KEY = "BJjbtEkO0g86Qiy48CtMWvzYZ3iNsUBXVVbxWr7LPXDKApti5r7rMNRvCdeOdJZtWHPCpq9QcCB2uJtOozjNaVE";

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

    // ===== EVENTS =====
    onValue(ref(db, "events/"), (snapshot) => {
        const container = document.getElementById("eventsContainer");
        const data = snapshot.val();

        if (!container) return;

        if (data) {
            container.innerHTML =
                '<div class="card-grid">' +
                Object.values(data).map(item => `
                    <div class="info-card">
                        <div class="card-body">
                            <h3 class="card-title">${item.title}</h3>
                            <p class="card-desc">${item.content}</p>
                            <a href="${item.link}" class="btn-readmore">Đọc tiếp</a>
                        </div>
                    </div>
                `).join('') +
                '</div>';
        }
    });

    // ===== FORUM =====
    onValue(ref(db, "forum/"), (snapshot) => {
        const container = document.getElementById("forumContainer");
        const data = snapshot.val();

        if (!container) return;

        if (data) {
            container.innerHTML =
                '<div class="forum-list">' +
                Object.values(data).map(item => `
                    <a href="${item.link}" class="forum-item">
                        <div class="forum-info">
                            <h4>${item.title}</h4>
                            <p>${item.author} • ${item.replies} bình luận</p>
                        </div>
                    </a>
                `).join('') +
                '</div>';
        }
    });

    // ===== HAMBURGER MENU =====
    const hamburger = document.getElementById("hamburger");
    const sidebarMenu = document.getElementById("sidebarMenu");

    if (hamburger && sidebarMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            sidebarMenu.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            if (!sidebarMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove("active");
                sidebarMenu.classList.remove("active");
            }
        });
    }

    // ===== ADMIN EASTER EGG =====
    const logo = document.querySelector(".school-logo");
    if (logo) logo.addEventListener("click", handleLogoClick);

    // ===== USER AUTH UI =====
    const authArea = document.getElementById("authArea");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser && authArea) {
        const userRef = ref(db, "users/" + loggedInUser);

        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const avt = data.avatar || "/Frontend/Icons/avtreg.png";

            authArea.innerHTML = `
                <div class="user-profile-header" id="profileTrigger">
                    <img src="${avt}" class="avatar-header" onerror="this.src='/Frontend/Icons/avtreg.png'">

                    <div class="user-info-text">
                        <span>${data.displayName}</span>
                        <span>@${data.username}</span>
                    </div>

                    <div class="profile-dropdown" id="profileDropdown">
                        <div style="text-align:center;">
                            <img src="${avt}" style="width:80px;height:80px;border-radius:10px;">
                            <br><b>${data.displayName}</b>
                            <br><span>@${data.username}</span>
                        </div>

                        <p><b>Trạng thái:</b> ${data.status || "Chưa thiết lập"}</p>
                        <p><b>Nhật ký:</b> ${data.diary || "Trống"}</p>

                        <button id="btnLogOut">Đăng xuất</button>
                    </div>
                </div>
            `;

            const trigger = document.getElementById("profileTrigger");
            const dropdown = document.getElementById("profileDropdown");

            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdown.style.display =
                    dropdown.style.display === "block" ? "none" : "block";
            });

            document.getElementById("btnLogOut").addEventListener("click", () => {
                localStorage.removeItem("loggedInUser");
                location.reload();
            });
        });

        requestNotificationPermission(loggedInUser);
    }

    // ===== SERVICE WORKER =====
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/firebase-messaging-sw.js")
            .then(r => console.log("SW OK:", r.scope))
            .catch(err => console.error("SW lỗi:", err));
    }
});

// ================= PUSH NOTIFICATION =================
function requestNotificationPermission(username) {
    Notification.requestPermission().then(permission => {
        if (permission !== "granted") return;

        getToken(messaging, { vapidKey: VAPID_KEY })
            .then(token => {
                if (token) {
                    set(ref(db, "users/" + username + "/fcmToken"), token);
                }
            })
            .catch(console.error);
    });
}

// ================= ADMIN SECRET CLICK =================
let clickCount = 0;
let lastClickTime = 0;

function handleLogoClick() {
    const now = Date.now();

    if (now - lastClickTime > 800) clickCount = 0;

    clickCount++;
    lastClickTime = now;

    if (clickCount === 10) {
        const pw = prompt("Admin access:");
        if (pw === "thcsckadminpnl2014@") {
            location.href = "/Frontend/Admin/adpn.html";
        }
        clickCount = 0;
    }
}