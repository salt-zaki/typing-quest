// 名前登録
document.getElementById("setNameBtn").addEventListener("click", async function (e) {
  const userName = document.getElementById("userNameInput").value.trim(); // 空白除去
  let input = document.getElementById("userNameInput");
  let btn = document.getElementById("setNameBtn");
  const nameMsg1 = document.getElementById("nameMsg1"); // 要素取得
  input.disabled = false;
  btn.disabled = false;

  if (!userName) {
    nameMsg1.style.display = "inline"; // 表示する
    nameMsg1.innerText = "名前が入力されていません";
    console.log("名前が未入力です");
    return;
  }

  const result = await addUserRegister(userName); // 登録

  if (!result){
    nameMsg1.style.display = "inline"; // 表示する
    nameMsg1.innerText = userName + "は既に登録されています";
    console.log("登録済みユーザー名が入力されました");
    return;
  }

  const startRegister = document.getElementById("startRegister"); // 要素取得
  const endRegister = document.getElementById("endRegister"); // 要素取得
  startRegister.style.display = "none"; // 非表示する
  endRegister.style.display = "inline"; // 表示する
  input.disabled = true;
  btn.disabled = true;
});

// 名前入力・登録チェック
document.getElementById("getNameBtn").addEventListener("click", async function (e) {
  const userName = document.getElementById("userNameInput").value.trim(); // 空白除去
  const nameMsg = document.getElementById("nameMsg"); // 要素取得

  if (!userName) {
    nameMsg.style.display = "inline"; // 表示する
    nameMsg.innerText = "名前が入力されていません";
    console.log("名前が未入力です");
    return;
  }
  // const result = await addUserRegister(userName);　登録
  const result = await findUser(userName);

  if (!result){
    nameMsg.style.display = "inline"; // 表示する
    nameMsg.innerText = userName + "は登録されていません";
    console.log("未登録ユーザーが入力されました");
    return;
  }

  nameMsg.style.display = "none"; // 非表示する
  document.getElementById("bossSelection").style.visibility = "visible";

});



// document.getElementById("startForm").addEventListener("submit", function (e) { // eが変数
//     const userName = e.target.userName.value.trim(); // 空白除去
//     const nameMsg = document.getElementById("nameMsg");

//     if (!userName) {
//       e.preventDefault(); // 送信を止める
//       nameMsg.style.display = "inline"; // 表示する
//       console.log("名前が入力されていません");
//       return false;       // JS的にも処理を打ち切る
//     }

//   // セッションに保存
//   sessionStorage.setItem("userName", userName);
//   sessionStorage.setItem("StageLevel", 0);
//   sessionStorage.setItem("damage", "");
//   console.log("入力された名前:", sessionStorage.getItem("userName"));

//   // Beanにenemyとplayerのstatusを設定
//   const Estatus = new Status("りゅうおう", 100, 100, "enemyImg1-1.jpg");
//   const Pstatus = new Status(userName, 100, 100, "playerImg1-1.jpg");

//   // 一時保存（オブジェクトはJSON文字列にする必要あり
//   // JSON.stringify() で保存されるのはデータだけでクラス情報は削除される）
//   sessionStorage.setItem("Estatus", JSON.stringify(Estatus));
//   sessionStorage.setItem("Pstatus", JSON.stringify(Pstatus));

//   sessionStorage.setItem("firstUpdate", "true"); // 初回問題取得flag
//   // log
//   console.log("画面遷移開始");
// });