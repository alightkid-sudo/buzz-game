// 全局状态
let buzzed = false;
let firstUser = "";

// 元素
const buzzBtn = document.getElementById("buzzBtn");
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById("result");
const usernameInput = document.getElementById("username");

// 抢答按钮
buzzBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (!name) {
        alert("请先输入名字！");
        return;
    }
    if (buzzed) return;

    // 标记已抢答
    buzzed = true;
    firstUser = name;
    result.innerText = `🎉 ${name} 第一个抢到！`;
    buzzBtn.disabled = true;
});

// 重置按钮
resetBtn.addEventListener("click", () => {
    buzzed = false;
    firstUser = "";
    result.innerText = "";
    buzzBtn.disabled = false;
});
