// 封印の非表示
function openBoss(bossId) {
  const closeImg = document.getElementById(bossId);
  if (closeImg) {
    closeImg.style.display = 'none'; // 封印画像を非表示にする
  }
}

// stage解放
async function openImg(userName){
  const result = await findUser(userName);
  if(result){
    for (let i = 2; i < 5; i++) {
      const stageKey = "stage" + i; // "stage2", "stage3", ...
      if (result[stageKey] === true) { // 変数を使用する場合は[]。カラム名を指定する場合はresult.stage1
        openBoss("close" + i);
      }else{
        const closeImg = document.getElementById("close" + i);
        closeImg.style.display = 'block';
      }
    }
  }
}

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

  const result = await findUser(userName);

  if (!result){
    nameMsg.style.visibility = "visible"; // 表示する
    nameMsg.innerText = userName + "は登録されていません";
    console.log("未登録ユーザーが入力されました");
    return;
  }

  openImg(userName); // stage表示

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
    const clickedImg = event.target; // クリックされた画像を設定
    const clickedId = clickedImg ? clickedImg.id : "不明"; // クリックされた画像のidを設定

    // 封印画像がクリックされた場合は何もしない（封印中）
    if (clickedId.startsWith("close")) { // startsWith("close")：idが "close" で始まるなら true を返す。
      console.log("封印中：クリック無効");
      return;
    }

    // 初期設定と画像IDに応じた処理
    sessionStorage.setItem("userName", userName);
    sessionStorage.setItem("StageLevel", 0);
    sessionStorage.setItem("damage", "");
    // Beanにenemyとplayerのstatusを設定
    const Pstatus = new Status(userName, 100, 100, "playerImg1-1.jpg");
    let Estatus;
    switch (clickedId) {
      case "bossId1":
        Estatus = new Status("りゅうおう", 100, 100, "enemyImg1-1.jpg");
        sessionStorage.setItem("stageNo",1);
        console.log("選択：りゅうおう");
        break;
      case "bossId2":
        Estatus = new Status("邪神ハーゴン", 115, 115, "enemyImg2-1.jpg");
        sessionStorage.setItem("stageNo",2);
        console.log("選択：邪神ハーゴン");
        break;
      case "bossId3":
        Estatus = new Status("ピサロ", 130, 130, "enemyImg3-1.jpg");
        sessionStorage.setItem("stageNo",3);
        console.log("選択：エスターク");
        break;
      case "bossId4":
        Estatus = new Status("バラモス", 150, 150, "enemyImg4-1.jpg");
        sessionStorage.setItem("stageNo",4);
        console.log("選択：バラモス");
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