// ================= 核心配置 =================
const ADMIN = { user: "admin", pwd: "admin123" };
const ROOM = { id: "1001", pwd: "room123" };
let currentUser = null;
let userList = JSON.parse(localStorage.getItem("userList")) || {};
let gameStatus = { started: false, buzzed: false, winner: "", time: 0, timer: null };
let recordList = JSON.parse(localStorage.getItem("recordList")) || [];

// 初始化管理员
if (!userList.admin) userList.admin = { pwd: "admin123", score: 0, records: [] };

// ================= 登录注册 =================
function login() {
    const user = document.getElementById("user").value;
    const pwd = document.getElementById("pwd").value;
    const roomId = document.getElementById("roomId").value;
    const roomPwd = document.getElementById("roomPwd").value;

    if (roomId !== ROOM.id || roomPwd !== ROOM.pwd) {
        alert("房间号或密码错误！");
        return;
    }

    if (userList[user] && userList[user].pwd === pwd) {
        currentUser = user;
        switchPage("mainPage");
        loadUserInfo();
        refreshHistory();
        document.getElementById("adminPanel").style.display = user === "admin" ? "block" : "none";
        return;
    }
    alert("账号或密码错误！");
}

function register() {
    const user = document.getElementById("user").value;
    const pwd = document.getElementById("pwd").value;
    if (!user || !pwd || user === "admin") {
        alert("注册失败！");
        return;
    }
    if (userList[user]) {
        alert("用户名已存在！");
        return;
    }
    userList[user] = { pwd, score: 0, records: [] };
    saveUsers();
    alert("注册成功！");
}

// ================= 游戏功能 =================
function startGame() {
    if (currentUser !== "admin") return;
    gameStatus = { started: true, buzzed: false, winner: "", time: 0 };
    document.getElementById("buzzBtn").disabled = false;
    document.getElementById("result").innerText = "";
    document.getElementById("status").innerText = "✅ 抢答已开始！";
    startTimer();
    playSound("start");
}

function resetGame() {
    if (currentUser !== "admin") return;
    clearInterval(gameStatus.timer);
    gameStatus = { started: false, buzzed: false, winner: "", time: 0 };
    document.getElementById("buzzBtn").disabled = true;
    document.getElementById("timer").innerText = "00:00.000";
    document.getElementById("status").innerText = "等待管理员开始...";
    document.getElementById("result").innerText = "";
}

// 抢答按钮
document.getElementById("buzzBtn").addEventListener("click", () => {
    if (!gameStatus.started || gameStatus.buzzed) return;
    gameStatus.buzzed = true;
    gameStatus.winner = currentUser;
    clearInterval(gameStatus.timer);

    document.getElementById("result").innerText = `🎉 ${currentUser} 抢到了！`;
    document.getElementById("buzzBtn").disabled = true;
    playSound("buzz");
    saveRecord();
    refreshHistory();
});

// 计时器
function startTimer() {
    clearInterval(gameStatus.timer);
    gameStatus.time = 0;
    gameStatus.timer = setInterval(() => {
        gameStatus.time += 10;
        const ms = gameStatus.time % 1000;
        const s = Math.floor(gameStatus.time / 1000) % 60;
        document.getElementById("timer").innerText = `${s.toString().padStart(2,0)}.${ms.toString().padStart(3,0)}`;
    }, 10);
}

// ================= 分数与记录 =================
function showScoreModal() {
    if (currentUser !== "admin") return;
    const sel = document.getElementById("scoreUser");
    sel.innerHTML = "";
    for (let u in userList) {
        if (u === "admin") continue;
        const opt = document.createElement("option");
        opt.value = u;
        opt.innerText = `${u} (当前：${userList[u].score}分)`;
        sel.appendChild(opt);
    }
    document.getElementById("scoreModal").style.display = "block";
}

function saveScore() {
    const user = document.getElementById("scoreUser").value;
    const num = parseInt(document.getElementById("addScore").value) || 0;
    userList[user].score += num;
    saveUsers();
    alert("修改成功！");
    closeModal();
    refreshHistory();
}

function saveRecord() {
    const rec = {
        user: gameStatus.winner,
        time: gameStatus.time,
        score: 1,
        timeStr: document.getElementById("timer").innerText
    };
    recordList.unshift(rec);
    userList[gameStatus.winner].records.unshift(rec);
    userList[gameStatus.winner].score += 1;
    saveUsers();
    localStorage.setItem("recordList", JSON.stringify(recordList));
}

// ================= 工具 =================
function switchPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function loadUserInfo() {
    document.getElementById("userInfo").innerText = `欢迎：${currentUser} | 总分：${userList[currentUser].score}`;
}

function refreshHistory() {
    let html = "<b>📜 抢答记录</b><br>";
    recordList.forEach((r, i) => {
        html += `${i+1}. ${r.user} | ${r.timeStr} | +${r.score}分<br>`;
    });
    document.getElementById("history").innerHTML = html;
}

function playSound(type) {
    const audio = new Audio(type === "buzz" 
        ? "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3"
        : "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2576.mp3"
    );
    audio.play().catch(e => {});
}

function closeModal() {
    document.getElementById("scoreModal").style.display = "none";
}

function logout() {
    currentUser = null;
    switchPage("loginPage");
}

function saveUsers() {
    localStorage.setItem("userList", JSON.stringify(userList));
}
