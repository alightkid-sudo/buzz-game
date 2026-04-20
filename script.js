// ================= 配置 =================
const ADMIN = { user: "MissWu", pwd: "admin1212" };
const ROOM = { id: "1001", pwd: "room123" };

let currentUser = null;
let currentProfileUser = null;

let userList = JSON.parse(localStorage.getItem("userList")) || {};
let onlineMembers = new Set();

let game = {
    started: false,
    buzzed: false,
    winner: "",
    time: 0,
    timer: null
};

let records = JSON.parse(localStorage.getItem("records")) || [];

// 初始化管理员
if (!userList.admin) {
    userList.admin = { pwd: "admin123", score: 0, records: [] };
    saveUsers();
}

// ================= 登录/注册 =================
function login() {
    const user = document.getElementById("user").value.trim();
    const pwd = document.getElementById("pwd").value.trim();
    const roomId = document.getElementById("roomId").value.trim();
    const roomPwd = document.getElementById("roomPwd").value.trim();

    if (roomId !== ROOM.id || roomPwd !== ROOM.pwd) {
        alert("房间号或密码错误");
        return;
    }

    if (userList[user] && userList[user].pwd === pwd) {
        currentUser = user;
        onlineMembers.add(user);
        showPage("mainPage");
        refreshInfo();
        refreshMembers();
        refreshHistory();
        document.getElementById("adminPanel").style.display = user === "admin" ? "block" : "none";
    } else {
        alert("账号或密码错误");
    }
}

function register() {
    const user = document.getElementById("user").value.trim();
    const pwd = document.getElementById("pwd").value.trim();
    if (!user || !pwd || user === "admin") {
        alert("注册无效");
        return;
    }
    if (userList[user]) {
        alert("用户名已存在");
        return;
    }
    userList[user] = { pwd, score: 0, records: [] };
    saveUsers();
    alert("注册成功！请登录");
}

// ================= 页面切换 =================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function backToMain() {
    showPage("mainPage");
}

// ================= 游戏功能 =================
function startGame() {
    if (currentUser !== "admin") return;
    game = { started: true, buzzed: false, winner: "", time: 0 };
    document.getElementById("buzzBtn").disabled = false;
    document.getElementById("result").innerText = "";
    document.getElementById("status").innerText = "✅ 抢答开始！";
    startTimer();
    playSound("start");
}

function resetGame() {
    if (currentUser !== "admin") return;
    clearInterval(game.timer);
    game = { started: false, buzzed: false, winner: "", time: 0 };
    document.getElementById("buzzBtn").disabled = true;
    document.getElementById("timer").innerText = "00.000";
    document.getElementById("status").innerText = "等待管理员开始...";
    document.getElementById("result").innerText = "";
}

document.getElementById("buzzBtn").addEventListener("click", () => {
    if (!game.started || game.buzzed) return;
    game.buzzed = true;
    game.winner = currentUser;
    clearInterval(game.timer);
    document.getElementById("result").innerText = `🎉 ${currentUser} 抢到！`;
    document.getElementById("buzzBtn").disabled = true;
    playSound("buzz");
    saveRecord();
    refreshHistory();
});

function startTimer() {
    clearInterval(game.timer);
    game.time = 0;
    game.timer = setInterval(() => {
        game.time += 10;
        const s = Math.floor(game.time / 1000);
        const ms = game.time % 1000;
        document.getElementById("timer").innerText = `${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }, 10);
}

// ================= 分数 & 记录 =================
function showScoreModal() {
    if (currentUser !== "admin") return;
    const sel = document.getElementById("scoreUser");
    sel.innerHTML = "";
    for (let u in userList) {
        if (u === "admin") continue;
        const opt = document.createElement("option");
        opt.value = u;
        opt.innerText = `${u} (${userList[u].score} 分)`;
        sel.appendChild(opt);
    }
    document.getElementById("scoreModal").style.display = "block";
}

function saveScore() {
    const user = document.getElementById("scoreUser").value;
    const num = parseInt(document.getElementById("addScore").value) || 0;
    userList[user].score += num;
    saveUsers();
    alert("已保存");
    closeModal();
    refreshInfo();
}

function saveRecord() {
    const rec = {
        user: game.winner,
        time: game.time,
        timeStr: document.getElementById("timer").innerText,
        score: 1
    };
    records.unshift(rec);
    userList[game.winner].records.unshift(rec);
    userList[game.winner].score += 1;
    saveUsers();
    localStorage.setItem("records", JSON.stringify(records));
}

// ================= 成员 & 资料页 =================
function refreshMembers() {
    const box = document.getElementById("memberList");
    if (currentUser === "admin") {
        let html = `👥 当前房间成员（${onlineMembers.size}人）：`;
        onlineMembers.forEach(u => {
            html += `<span class="member-name" onclick="viewProfile('${u}')">${u}</span> `;
        });
        box.innerHTML = html;
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

function viewProfile(user) {
    currentProfileUser = user;
    const u = userList[user];
    document.getElementById("profileInfo").innerHTML = `
        <h3>${user}</h3>
        <p>总分：${u.score}</p>
        <p>抢答次数：${u.records.length}</p>
    `;
    let html = "<h4>历史成绩</h4>";
    u.records.forEach((r, i) => {
        html += `${i+1}. 用时 ${r.timeStr} <br>`;
    });
    document.getElementById("profileRecords").innerHTML = html;
    showPage("profilePage");
}

function openMyProfile() {
    viewProfile(currentUser);
}

// ================= 工具 =================
function refreshInfo() {
    document.getElementById("userInfo").innerText = `欢迎：${currentUser} | 总分：${userList[currentUser].score}`;
}

function refreshHistory() {
    let html = "<b>📜 本轮记录</b><br>";
    records.forEach((r, i) => {
        html += `${i+1}. ${r.user} | ${r.timeStr}<br>`;
    });
    document.getElementById("history").innerHTML = html;
}

function playSound(type) {
    const url = type === "buzz"
        ? "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3"
        : "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2576.mp3";
    new Audio(url).play().catch(() => {});
}

function closeModal() {
    document.getElementById("scoreModal").style.display = "none";
}

function logout() {
    onlineMembers.delete(currentUser);
    currentUser = null;
    showPage("loginPage");
}

function saveUsers() {
    localStorage.setItem("userList", JSON.stringify(userList));
}
