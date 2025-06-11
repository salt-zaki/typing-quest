// 名前入力チェック
document.getElementById("startForm").addEventListener("submit", function (e) {
    const userName = e.target.userName.value.trim(); // 空白除去
     const nameMsg = document.getElementById("nameMsg");

    if (!userName) {
      e.preventDefault(); // 送信を止める
      nameMsg.style.display = "inline"; // 表示する
      console.log("名前が入力されていません");
      return false;       // JS的にも処理を打ち切る
    }

  // セッションに保存
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("StageLevel", 0);
  sessionStorage.setItem("damage", "");
  console.log("入力された名前:", sessionStorage.getItem("userName"));

  // Beanにenemyとplayerのstatusを設定
  const Estatus = new Status("りゅうおう", 100, 100, "enemyImg1-1.jpg");
  const Pstatus = new Status(userName, 100, 100, "playerImg1-1.jpg");

  // 一時保存（オブジェクトはJSON文字列にする必要あり
  // JSON.stringify() で保存されるのはデータだけでクラス情報は削除される）
  sessionStorage.setItem("Estatus", JSON.stringify(Estatus));
  sessionStorage.setItem("Pstatus", JSON.stringify(Pstatus));
  
  // log
  console.log("画面遷移開始");
});