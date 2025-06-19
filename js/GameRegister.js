// 名前登録
document.getElementById("setNameBtn").addEventListener("click", async function (e) {
  const userName = document.getElementById("userNameInput").value.trim(); // 空白除去
  let input = document.getElementById("userNameInput");
  let btn = document.getElementById("setNameBtn");
  const nameMsg = document.getElementById("nameMsg"); // 要素取得
  input.disabled = false;
  btn.disabled = false;

  if (!userName) {
    nameMsg.style.visibility = "visible"; // 表示する
    nameMsg.innerText = "名前が入力されていません";
    console.log("名前が未入力です");
    return;
  }

  const result = await addUserRegister(userName); // 登録

  if (!result){
    nameMsg.style.visibility = "visible"; // 表示する
    nameMsg.innerText = userName + "は既に登録されています";
    console.log("登録済みユーザー名が入力されました");
    return;
  }

  nameMsg.style.visibility = "visible"; // 表示する
  nameMsg.style.color = "white";
  nameMsg.innerText = "勇者様...世界の命運を託しましたぞ!!";
  const link = document.getElementById("href");
  link.href = "GameSet.html";  // ここで遷移先を変更
  link.innerText = "すすむ";
  link.style.color = "white";
  input.disabled = true;
  btn.disabled = true;
});