
// Statusのインスタンスを取得
const Estatus = sessionStorage.getItem("Estatus");
const Pstatus = sessionStorage.getItem("Pstatus");
const e = JSON.parse(Estatus); // この時点ではインスタンス化されていない。オブジェクト
const p = JSON.parse(Pstatus);

// 再度インスタンス化
window.Enemy = reviveStatus(e); // window.:グローバル変数。他ファイルでも使用可能
window.Player = reviveStatus(p);

// JSON → Statusのインスタンスに再構築
function reviveStatus(obj) {
  return new Status(obj.Name, Number(obj.HP), Number(obj.MaxHP), obj.Img);
}

// DOMに表示
document.getElementById("EnemyName").textContent = Enemy.Name;
document.getElementById("PlayerName").textContent = Player.Name;
document.getElementById("enemyImg").src = "img/" + Enemy.Img;
document.getElementById("playerImg").src = "img/" + Player.Img;

// POPUP
function showPopup(msg1,msg2,id1,id2) {
	console.log("showPopup log ");
	console.log("msg1:", msg1, "msg2:", msg2);
	document.getElementById('id1').textContent = msg1;
	document.getElementById('id2').textContent = msg2;
  	document.getElementById('popup').classList.remove('hidden'); // class="popup hidden"からhiddenを削除する⇒表示させる
}

function closePopup() {
	console.log("closePopup log ");
	ocument.getElementById('popup').classList.add('hidden'); // class="popup "にhiddenを追加する⇒非表示
			
	// 画面遷移
	if (gameStatus === "next"){
		document.getElementById("stageChange").value = "start2";
		document.getElementById("damageLevel").value = "2"
		document.getElementById("typingForm").submit();
	}else if(gameStatus === "KillAttack"){
		// ゲーム再開
		setTimeout(() => {
	        // タイピングエリアとタイマー表示
			document.getElementById("typingArea").style.visibility = "visible";
			document.getElementById("timer").style.visibility = "visible";
			document.getElementById("translation").style.visibility = "visible";
			document.getElementById("text").style.visibility = "visible";
			document.getElementById("stageChange").value = "battle";
			document.getElementById("damageLevel").value = "5";
			document.getElementById("wordInput").focus();
			document.getElementById('typingArea').classList.add('typing-area'); 
			message.textContent = "正しく入力してください";
	        // タイマー開始
	        startTimerBar();
	    }, 1000); // 3秒後に実行
	}else if(gameStatus === "end"){
		NextPage();
	}else{
		//window.location.href = 'gameTitle.html';
		document.getElementById("stageChange").value = "gameEnd";
		document.getElementById("typingForm").submit();
	}
}

// 画面遷移
function NextPage(url, seconds) {
  const millis = seconds * 1000;
  setTimeout(() => {
    window.location.href = url;
  }, millis);
}

// タイピング風メッセージ
function typeNextChar(message,MsgId) {
  let index = 0;
  let displayed = "";

  // HTMLも含めて描画するため、innerHTMLを使用, HTMLを含めないならtextContentを使用
  // MsgId:ElemntId
  function typeChar() {
    if (index < message.length) {
      displayed += message[index];
      MsgId.innerHTML = displayed;
      index++;
      setTimeout(typeChar, 100);
    }
  }
  typeChar(); // 初回起動
}

// 名前取得
function getName() {
  const userName = sessionStorage.getItem("userName") || "冒険者";
	return userName;
}