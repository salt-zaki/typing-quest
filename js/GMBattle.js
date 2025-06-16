let db;

// メッセージ表示（タイピング風）
const KillMsg = "りゅうおうは力をためている。<br>りゅうおうのまわりに邪悪なオーラが集まっている!!<br>「…これで終わりだ!!」<br>りゅうおうは『終焉の業火』をはなった！";
const nextMsg = "さすがだな。伝説の勇者とその一族たちよ。<br>しかし不幸なことだ...<br>なまじ強いばかりに私の本当のすがたを<br>見ることになるとは...!!";

// 常にEnter押下による送信をブロック
const form = document.getElementById('typingForm');
form.addEventListener("submit", function(e) {
  e.preventDefault(); // 送信させない
});

// input時に文字制御
document.getElementById("wordInput").addEventListener("input", function() {
this.value = this.value.replace(/[^\x20-\x7E]/g, ''); // 半角英数字と記号以外を除去
});

// タイマー
const totalTime = 100 * 1000; // ミリ秒単位で正確に処理（5秒）
let startTime;
let timerRunning = true; // タイマー有効
function startTimerBar() {
	const bar = document.getElementById("timer-bar");
	const input = document.getElementById("wordInput");
	const message = document.getElementById("message");
	timerRunning = true;
	input.disabled = false; // 要素削除：input有効
	input.focus(); // 要素inputにフォーカスを設定
	console.log("Timer started");  // ここでタイマーが開始されているかを確認

	function updateBar(timestamp) {
		if (!startTime) startTime = timestamp; // 初回呼び出しで基準時間記録

		const elapsed = timestamp - startTime;
		const remaining = Math.max(0, totalTime - elapsed);
		const percent = (remaining / totalTime) * 100;
		bar.style.width = percent + "%"; // 色の幅サイズ

		if (remaining <= 0) {
			timerRunning = false;	 // タイマー無効
			input.disabled = true; // 要素削除：input無効

			message.textContent = "魔王から攻撃を受けた";
	  		PlayerDamage(); // プレイヤーがダメージを受けた場合に点滅
			let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel"));
			damageJudge(level, "player"); // レベル・ダメージ判定
			const gameStatus = sessionStorage.getItem("gameStatus");
			setTimeout(() => { // status判定
  			statusCheck(gameStatus);
			}, 3000);
		}
		if (timerRunning) {
			requestAnimationFrame(updateBar);
		}
	}
	// 初期化
	startTime = null;
	timerRunning = true;
	requestAnimationFrame(updateBar);
}

// status判定及び、ゲーム管理
function statusCheck(gameStatus){
	if (gameStatus === "play"){
		let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel")); // levelの問題を取得
		findQuestions(level).then(result => { 
			questionList = result;
			let max = questionList.length;
			randomIndex = Math.floor(Math.random() * max);
			updateQuestions(questionList[randomIndex].No,level); // false更新。noとlevelを引数に渡す
			showQuestion(); // 問題表示
			startTimerBar(); // タイマー開始
		},5000);
	}else if (gameStatus === "next"){ 
		PopSet("すすむ"); // 共通処理
		let msg1Elem = document.getElementById('popup-message1');
		msg1Elem.classList.remove('popup-message1-small');
		msg1Elem.style.color = 'white'; 
		
		// popup-message2を削除
		let msg2Elem = document.getElementById("popup-message2"); // 1. 要素を削除する前に保存
		let savedElement = msg2Elem;  // 削除前に保存
		msg2Elem.remove(); // 2. 要素を削除
		
		setTimeout(() => {
			document.getElementById("endButton").style.visibility = "hidden";
			showPopup(); // 0.5秒後に表示
			setTimeout(() => { // 3秒後に実行
				tyipngMessage(nextMsg, msg1Elem, () => {
					document.getElementById("endButton").style.visibility = "visible";
					document.body.appendChild(savedElement);  // 要素を復元（再追加）
				});
			 }, 500); 
		}, 1000); 
	}else if (gameStatus === "KillAttack"){
		PopSet("たたかう"); // 共通処理
		let msg1Elem = document.getElementById('popup-message1');
		msg1Elem.classList.remove('popup-message1-small');
		msg1Elem.style.color = 'white'; 
		
		// popup-message2を削除
		let msg2Elem = document.getElementById("popup-message2"); // 1. 要素を削除する前に保存
		let savedElement = msg2Elem;  // 削除前に保存
		msg2Elem.remove(); // 2. 要素を削除

		setTimeout(() => {
			document.getElementById("endButton").style.visibility = "hidden";
			showPopup(); // 0.5秒後に表示
			setTimeout(() => { // 3秒後に実行
				tyipngMessage(KillMsg, msg1Elem, () => {
					document.getElementById("endButton").style.visibility = "visible";
					document.body.appendChild(savedElement);  // 要素を復元（再追加）
				});
			 }, 500); 
		}, 1000); 
	}else if (gameStatus === "end"){
		PopSet("おわり"); // 共通処理
		let msg1Elem = document.getElementById('popup-message1');
		msg1Elem.classList.remove('popup-message1-small'); // 旧クラス名を削除
		msg1Elem.classList.add('popup-message1-large'); // 新しいクラス名を設定
		const winner = sessionStorage.getItem("winner");
		if(winner === "enemy"){
			msg1Elem.style.color = 'red'; 
			showPopup("GAME OVER","出直してきてください");
		}else{
			msg1Elem.style.color = 'rgb(255,255,128)'; 
			showPopup("CONGRATULATIONS", Player.Name + "の勝利です。");
		}
	}
}

// HPBar更新
const unitWidthPerHP = 3; // 1HPあたり3px幅にする
function updatePlayerHPBar() { // player
	const pHPBar = document.getElementById("pHPBar");
	const playerHPBar = document.getElementById("playerHPBar");
	if (Player.HP <= 0) Player.HP = 0;
	const playerHPPercentage = Player.HP;

	// HP色変化
	if (playerHPPercentage <= 0)	pHPBar.style.backgroundColor = "#444";
	else if (playerHPPercentage <= Player.MaxHP * 0.3) pHPBar.style.backgroundColor = "red";
	else if (playerHPPercentage <= Player.MaxHP * 0.6) pHPBar.style.backgroundColor = "orange";
	playerHPBar.style.width = (Player.MaxHP * unitWidthPerHP) + "px";
	pHPBar.style.width = (playerHPPercentage / Player.MaxHP * 100) + "%"; 	// ゲージ内の進捗（HP%）
}
function updateEnemyHPBar() { // enemy
	const eHPBar = document.getElementById("eHPBar");
	const enemyHPBar = document.getElementById("enemyHPBar");
	if (Enemy.HP <= 0) Enemy.HP = 0;
	const enemyHPPercentage = Enemy.HP;

	// HP色変化
	if (enemyHPPercentage <= 0){
	    sessionStorage.setItem("status","next");
	}else if (enemyHPPercentage <= (0.3 * Enemy.MaxHP)) {
		sessionStorage.setItem("DamageLevel",4);
	    eHPBar.style.backgroundColor = "red";
	}else if (enemyHPPercentage <= (0.6 * Enemy.MaxHP)) {
		sessionStorage.setItem("DamageLevel",3);
		eHPBar.style.backgroundColor = "orange";
	}else if (enemyHPPercentage <= (0.8 * Enemy.MaxHP)) {
		sessionStorage.setItem("DamageLevel",2);
		eHPBar.style.backgroundColor = "#4caf50";
	}else {
		sessionStorage.setItem("DamageLevel",1);
		eHPBar.style.backgroundColor = "#4caf50";
	}
	enemyHPBar.style.width = (Enemy.MaxHP * unitWidthPerHP) + "px";  // ゲージ枠の幅
	eHPBar.style.width = (enemyHPPercentage / Enemy.MaxHP * 100) + "%";  // ゲージ内の進捗（HP%）
}

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

// Level別ダメージ調節
function DamageLevel(level, hitDamage,DummyHP) {
	let ans;
	let x;
	switch(level) {
			case 1:
				ans = 100;
				x = 1;
				break;
			case 2:
				ans = 10;
				x = 1.5;
				break;
			case 3:
				ans = 20;
				x = 1.5;
				break;
			case 4:
				ans = 20;
				x = 2;
				break;
			case 5:
				ans = 20;
				x = 2.5;
				break;
			case 6:
				ans = 20;
				x = 4;
				break;
			default:
				ans = 5;
				x = 1;
				break;
		}
	if(hitDamage === "player") {
		DummyHP = DummyHP-ans*x;
	}else {
		DummyHP = DummyHP-ans;
	}
	return DummyHP;
}

// HPからのstatus管理
function damageJudge(level, hitDamage) {
	let DummyHP;
	if(hitDamage === "player") {
		DummyHP = Number(DamageLevel(level, hitDamage,Player.HP));
		if(DummyHP <= 0){
			sessionStorage.setItem("gameStatus", "end");
			sessionStorage.setItem("winner", "enemy");
		}else{
			sessionStorage.setItem("gameStatus", "play");
		}
		Player.HP = DummyHP;
		updatePlayerHPBar();
	}else {
		DummyHP = Number(DamageLevel(level, hitDamage,Enemy.HP));
		Enemy.HP = DummyHP;
		updateEnemyHPBar();
		const StageLevel = Number(sessionStorage.getItem("StageLevel")); // 文字列になるため型変換
		if(DummyHP <= 0 && StageLevel === 1){
			sessionStorage.setItem("gameStatus", "end");
			sessionStorage.setItem("winner", "player");
		}else if(DummyHP <= 0 &&  StageLevel === 0){
			sessionStorage.setItem("gameStatus", "next");
		}else{
			sessionStorage.setItem("gameStatus", "play");
		}
	}
}

// 問題集取得function
let questionList = []; // 問題リスト格納先
let randomIndex; // index
async function updateAllQuestions() { // 全データの showText を true に更新
  db = window.db;
  try {
    const querySnapshot = await db.collection("typing_questions").get();
    const updatePromises = [];

    querySnapshot.forEach((docSnap) => {
      const docRef = db.collection("typing_questions").doc(docSnap.id);
      updatePromises.push(docRef.update({ showText: "true" }));
    });

    await Promise.all(updatePromises);
	window.fq = false;
    console.log("全データの showText を true に更新しました");
  } catch (err) {
    console.error("updateAllQuestions エラー:", err);
  }
}
async function findQuestions(level) { // showText = "true" かつdifficulty一致のデータを取得
  db = window.db;
  try {
    const querySnapshot = await db
      .collection("typing_questions")
      .where("difficulty", "==", level)
      .where("showText", "==", "true")
      .get();

    const results = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data());
    });

    console.log(`${results.length} 件取得（level=${level}, showText=true）`);
    return results;
  } catch (err) {
    console.error("findQuestions エラー:", err);
    return [];
  }
}
async function updateQuestions(No, level) { // Noとdifficultyの1件をshowText:"false"に更新
  db = window.db;
  try {
    const querySnapshot = await db
      .collection("typing_questions")
      .where("No", "==", No)
      .where("difficulty", "==", level)
      .get();

    if (querySnapshot.empty) {
      console.warn("該当するデータが見つかりませんでした");
      return;
    }

    const docRef = querySnapshot.docs[0].ref;
    await docRef.update({ showText: "false" });

    console.log(`No=${No}, level=${level} のデータを非表示に更新しました`);
  } catch (err) {
    console.error("updateQuestions エラー:", err);
  }
}

/*
// updateAllQuestions
function updateAllQuestions() {
  return fetch(`http://localhost:3000/typingQuestion/updateAll`)
	.then(res => res.json())
	.then(data => {
		console.log(data.message);
	})
	.catch(err => {
		console.error("updateAllQuestions エラー:", err);
	});
}

// findQuestions
function findQuestions(level){
	return fetch(`http://localhost:3000/typingQuestion/find/${level}`)
	.then(res => res.json())
	.then(data => {
		console.log(data.message);
		return data.results; // 呼び出し元で受け取れるように return
	})
	.catch(err => {
		console.error("updateAllQuestions エラー:", err);
	});
}

// updateQuestions
function updateQuestions(No,level){
	return fetch(`http://localhost:3000/typingQuestion/update/${No}/${level}`)
	.then(res => res.json())
	.then(data => {
		console.log(data.message);
	})
	.catch(err => {
		console.error("updateAllQuestions エラー:", err);
	});
}
*/

//問題の表示
function showQuestion() {
  let questionE = questionList[randomIndex].text;
  let questionJ = questionList[randomIndex].translation;
  console.log("問題文：" + questionList[randomIndex].text + "/" + questionList[randomIndex].translation);

  const text = document.getElementById("text"); // タイピング文字
  const translation = document.getElementById("translation"); // 日本語
  const input = document.getElementById("wordInput");

  // 表示リセット
  text.innerHTML = ""; //<span>を使用しているため要素ごと削除
  translation.textContent = questionJ; // 問題文を出力
  input.value = ""; // 入力欄をクリア
  message.textContent = "正しく入力してください";

  // <span> で分解して1文字ずつ表示
  for (let i = 0; i < questionE.length; i++) {
    const span = document.createElement("span");
    span.id = `char${i}`; // spanのidを一文字づつ設定
    span.textContent = questionE[i];
    text.appendChild(span);
  }

  text.style.visibility = "visible";
  translation.style.visibility = "visible";
  input.disabled = true; // 要素削除：input無効
  input.focus(); // 要素inputにフォーカスを設定
}

// メイン //
// ページ読み込み時に開始
document.addEventListener("DOMContentLoaded", async function () { // HTMLが読み込まれたタイミングで処理を実行
	db = window.db; // Firestore のグローバル接続を参照
	console.log("Window loaded");  // ここでイベントが実行されているかを確認
	document.getElementById('popup').classList.add('hidden');
	let input = document.getElementById("wordInput"); // inputを定義

	// 初回問題集の取得
	if(window.fq) await updateAllQuestions(); // 全問題をtrue
	let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel")); // levelの問題を取得
	findQuestions(level).then(result => { // level1の問題を取得
		questionList = result;
		let max = questionList.length;
		randomIndex = Math.floor(Math.random() * max);
		console.log(questionList);
		console.log(randomIndex);
		updateQuestions(questionList[randomIndex].No,level); // false更新。noとlevelを引数に渡す
		showQuestion(); // 最初の問題表示

		// タイマー開始
	  startTimerBar();
	},1500);

	// inputはDOMContentLoaded内で定義すればnullにならない
	// スペルを一文字ごとに確認し色付けする
	input.addEventListener("input", () => {  // 定義したinput.入力するたびに処理実行
		let correctWord = document.getElementById("text").textContent; // タイピング文字
		let userInput = input.value; // 入力するたびに最新値
		console.log("入力文字：" + userInput); // 入力文字
		
		const charSpan = document.getElementById(`char${userInput.length - 1}`); // <span>内の要素を取得
		const charText = document.getElementById(`char${userInput.length - 1}`).innerText; // <span>内のテキストを取得
		console.log("一致文字：" + charSpan); 
				  
		if(userInput[userInput.length - 1] === charText){
			charSpan.style.color = "gray"; // 正しく入力 → 灰色
    	} else {
      		charSpan.style.color = "white"; // 初期状態 or 間違い → 白色
			userInput = userInput.slice(0, -1); // 正しくない文字を入力しているので削除する

			// 更新した入力内容を反映
			input.value = userInput;
			return;
    	}
		// すべて正しく入力されたら自動送信
		if (userInput === correctWord) {
			timerRunning = false; // タイマー停止
			let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel"));
			damageJudge(level, "enemy"); // レベル・ダメージ判定

			// ダメージエフェクト
			message.textContent = "勇者の攻撃";
			EnemyDamage(); // プレイヤーがダメージを受けた場合に点滅
			const gameStatus = sessionStorage.getItem("gameStatus");
			setTimeout(() => { // status判定
				statusCheck(gameStatus);
			}, 3000);
		}
	});
});
