
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


// ゲームステータス管理
// ゲーム開始時
function fastGameStatus() {
	sessionStorage.setItem("gameStatus","play");
	sessionStorage.setItem("StageLevel",0);
	sessionStorage.setItem("DamageLevel",1);
	sessionStorage.setItem("inputTime",7);
}
// nextステージ
function nextGameStatus() {
	const Estatus = new Status("しんりゅうおう", 200, 200, "enemyImg1-2.jpg");
	const Pstatus = new Status(Player.Name, 120, 120, "playerImg1-1.jpg");
	sessionStorage.setItem("Estatus", JSON.stringify(Estatus));
	sessionStorage.setItem("Pstatus", JSON.stringify(Pstatus));
	sessionStorage.setItem("gameStatus","play");
	sessionStorage.setItem("StageLevel",1);
}

// POPUP関連 //
// POPUP設定
function PopSet(buttonValue){
	document.getElementById("typingArea").style.visibility = "hidden"; // タイピングエリア非表示
	document.getElementById("timer-bar-container").style.visibility = "hidden"; // タイマー非表示
	document.getElementById("message").style.visibility = "hidden";
	document.getElementById("translation").style.visibility = "hidden";
	document.getElementById("text").style.visibility = "hidden";

	// POPボタン設定
	document.getElementById("endButton").textContent = buttonValue;
}

let keydownHandler = null;
// POPUP表示
function showPopup(msg1,msg2) {
	console.log("showPopup log ");
	console.log("msg1:", msg1, "msg2:", msg2);
	document.getElementById("endButton").style.visibility = "hidden";
	document.getElementById("Button-message").style.visibility = "hidden";
	document.getElementById('popup-message1').textContent = msg1;
	const msg2Elem = document.getElementById('popup-message2');
	if (msg2Elem) {
		msg2Elem.textContent = msg2 ?? ""; // msg2が未定義なら空文字
	}
	document.getElementById('popup').classList.remove('hidden');
	const endButton = document.getElementById('endButton');

	// エンター・スペース押下でボタンをクリック
	keydownHandler = (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			endButton.click();
		}
	};
	endButton.addEventListener('keydown', keydownHandler);
}

function closePopup() {
	console.log("closePopup log ");
	document.getElementById('popup').classList.add('hidden'); // class="popup "にhiddenを追加する⇒非表示
	const gameStatus = sessionStorage.getItem("gameStatus");

	// イベントリスナー削除(エンター・スペース押下でボタンをクリック)
	if (keydownHandler) {
		endButton.removeEventListener('keydown', keydownHandler);
		keydownHandler = null;
	}

	if (gameStatus === "next"){
		nextGameStatus();
		location.reload(); // 画面を再読み込み
	}else if(gameStatus === "AbilityAttack"){
		// resolve() を呼び出すための callback 実行
		if (typeof window._popupCallback === "function") {
			document.getElementById("typingArea").style.visibility = "visible"; // タイピングエリア非表示
			document.getElementById("timer-bar-container").style.visibility = "visible"; // タイマー非表示
			document.getElementById("message").style.visibility = "visible";
			document.getElementById("wordInput").focus();
			void typingArea.offsetWidth;
			window._popupCallback();
			window._popupCallback = null;
		}
	}else if(gameStatus === "end"){
		NextPage('GameTitle.html', 0);
	}else{}
}

// 画面遷移
function NextPage(url, seconds) {
	const millis = seconds * 1000;
	setTimeout(() => {
    	window.location.href = url;
}, millis);
}

// 名前取得
function getName() {
	const userName = sessionStorage.getItem("userName") || "冒険者";
	return userName;
}

// 共通エフェクト
// ダメージエフェクト
function PlayerDamage() { // プレイヤーがダメージを受けた場合
    DamageEffect(document.getElementById("playerImg"));
}
function EnemyDamage() { // 敵がダメージを受けた場合
    DamageEffect(document.getElementById("enemyImg"));
}
// ダメージを受けた場合に画像を点滅させる関数
function DamageEffect(img) {
	// 点滅クラスを追加
	img.classList.add('hit');
	
	// 点滅を実行
	setTimeout(() => {
	  img.classList.remove('hit');
	}, 2000); // 2000ms（2秒）後に点滅を停止
}

// 回復エフェクト
function showHealEffect() {
	const effect = document.getElementById("heal-effect");

	// 表示してアニメーション開始
	effect.classList.add('show');

	// 1秒後にアニメーション終わるので非表示に戻す
	setTimeout(() => {
    	effect.classList.remove('show');
  	}, 3000);  // アニメーション時間に合わせる
}

// タイピング風メッセージ
function tyipngMessage(message,MsgId,callback) {
  let index = 0;
  let displayed = "";

  // HTMLも含めて描画するため、innerHTMLを使用, HTMLを含めないならtextContentを使用
  // MsgId:ElemntId
  function typeChar() {
    if (index < message.length) {
      displayed += message[index];
      MsgId.innerHTML = displayed;
      index++;
      setTimeout(typeChar, 75);
    }else {
      // タイピング終了後にコールバックを実行
      if (callback) callback();
    }
  }
  typeChar(); // 初回起動
}
