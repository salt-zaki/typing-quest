// 名前入力・登録チェック
document.getElementById("getNameBtn").addEventListener("click", async function (e) {
  const userName = document.getElementById("userNameInput").value.trim(); // 空白除去
  const nameMsg = document.getElementById("nameMsg"); // 要素取得

  if (!userName) {
    nameMsg.style.visibility = "visible"; // 表示する
    nameMsg.innerText = "名前が入力されていません";
    console.log("名前が未入力です");
    return;
  }
  // const result = await addUserRegister(userName);　登録
  const result = await findUser(userName);

  if (!result){
    nameMsg.style.visibility = "visible"; // 表示する
    nameMsg.innerText = userName + "は登録されていません";
    console.log("未登録ユーザーが入力されました");
    return;
  }

  nameMsg.style.visibility = "visible"; // 表示する
  nameMsg.style.color = "white";
  nameMsg.innerText = "挑むボスを選んでください";
  document.getElementById("bossSelection").style.visibility = "visible";
});


// DOMContentLoaded を使わないと、非表示状態の要素はまだ読み込まれておらず、querySelectorAll() で取得できないことがあるため起動時に読み込む
document.addEventListener("DOMContentLoaded", () => {
// すべてのリンクにイベントを付ける
  document.querySelectorAll(".linkBoss").forEach(link => {
  link.addEventListener("click", function (event) { // 画像クリックされた時の処理
    event.preventDefault(); // 遷移を一時停止
    const userName = document.getElementById("userNameInput").value.trim(); // 空白除去
    const clickedImg = link.querySelector("img"); // クリックされた画像を設定
    const clickedId = clickedImg ? clickedImg.id : "不明"; // クリックされた画像のidを設定

    // 初期設定と画像IDに応じた処理
    sessionStorage.setItem("StageLevel", 0);
    sessionStorage.setItem("damage", "");
    // Beanにenemyとplayerのstatusを設定
    const Pstatus = new Status(userName, 100, 100, "playerImg1-1.jpg");
    let Estatus;
    switch (clickedId) {
      case "bossAction1":
        Estatus = new Status("りゅうおう", 100, 100, "enemyImg1-1.jpg");
        console.log("選択：りゅうおう");
        break;
      case "bossAction2":
        Estatus = new Status("りゅうおう2", 100, 100, "enemyImg1-1.jpg");
        console.log("魔王の処理を実行");
        break;
      case "bossAction3":
        Estatus = new Status("りゅうおう3", 100, 100, "enemyImg1-1.jpg");
        console.log("魔王の処理を実行");
        break;
      case "bossAction4":
        Estatus = new Status("りゅうおう4", 100, 100, "enemyImg1-1.jpg");
        console.log("魔王の処理を実行");
        break;
      default:
        console.log("不明なボスがクリックされました");
        return;
    }

    // 一時保存（オブジェクトはJSON文字列にする必要あり。JSON.stringify() で保存されるのはデータだけでクラス情報は削除される）
    sessionStorage.setItem("Estatus", JSON.stringify(Estatus));
    sessionStorage.setItem("Pstatus", JSON.stringify(Pstatus));
    sessionStorage.setItem("firstUpdate", "true"); // 初回問題取得flag
    console.log("画面遷移開始");
    window.location.href = link.href; // 画面遷移
  });
  });
});