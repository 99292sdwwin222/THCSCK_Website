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
const currentUid = localStorage.getItem("loggedInUser");

// Đăng bài viết
document.getElementById("btnPost").addEventListener("click", () => {
    const text = document.getElementById("postContent").value.trim();
    if (!currentUid) return alert("Vui lòng đăng nhập để đăng bài!");
    if (text === "") return alert("Nội dung trống!");

    const postsRef = ref(db, 'forum_posts');
    const newPostRef = push(postsRef);
    set(newPostRef, {
        uid: currentUid,
        content: text,
        likes: 0,
        timestamp: Date.now()
    });
    document.getElementById("postContent").value = "";
});

// Đồng bộ hóa bài đăng Realtime
const forumFeed = document.getElementById("forumFeed");
onValue(ref(db, 'forum_posts'), (snapshot) => {
    forumFeed.innerHTML = "";
    const posts = snapshot.val();
    if (!posts) return;

    Object.keys(posts).reverse().forEach(key => {
        const post = posts[key];
        
        // Lấy thông tin user của bài đăng
        onValue(ref(db, 'users/' + post.uid), (uSnap) => {
            const uData = uSnap.val() || { displayName: "Ẩn danh", avatar: "../../../Icons/avtreg.png" };
            
            let postHtml = `
                <div class="post-card">
                    <div class="post-header">
                        <img src="${uData.avatar}" class="post-avt" onerror="this.src='../../../Icons/avtreg.png'">
                        <div>
                            <strong>${uData.displayName}</strong> <span style="font-size:0.8rem; color:#888;">@${post.uid}</span>
                        </div>
                    </div>
                    <p>${post.content}</p>
                    <div class="post-actions">
                        <button class="btn-act" onclick="window.likeReal('${key}', ${post.likes || 0})">👍 Thích (${post.likes || 0})</button>
                        <button class="btn-act">❤️ React</button>
                    </div>
                </div>
            `;
            forumFeed.insertAdjacentHTML("beforeend", postHtml);
        }, { onlyOnce: true });
    });
});

window.likeReal = function(id, curLike) {
    set(ref(db, 'forum_posts/' + id + '/likes'), curLike + 1);
};