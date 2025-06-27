let db;

// メッセージ表示（タイピング風）
const nextMsg = "お,おのれ...くちおし...。<br>だが、私を倒してももはや世界を救えまい！<br>わが、破壊の神よ...シドーよ!!<br>今ここに、いけにえをささぐ!!          ぐふっ!";

// 常にEnter押下による送信をブロック
const form = document.getElementById('typingForm');
form.addEventListener("submit", function(e) {
  e.preventDefault(); // 送信させない
});

// input時に文字制御
document.getElementById("wordInput").addEventListener("input", function() {
this.value = this.value.replace(/[^\x20-\x7E]/g, ''); // 半角英数字と記号以外を除去
});

//　特殊攻撃
function AbilityAttack(){
	const KillMsg = "シドーは呪文を唱えた<br>ルカナン<br>勇者は２ターン回復できなくなった。";
	PopSet("たたかう"); // 共通処理
	sessionStorage.setItem("typingCount", false);
	let msg1Elem = document.getElementById('popup-message1');
	msg1Elem.classList.remove('popup-message1-small');
	msg1Elem.style.color = 'white';

	// popup-message2を削除
	let msg2Elem = document.getElementById("popup-message2"); // 1. 要素を削除する前に保存
	let savedElement = msg2Elem;  // 削除前に保存
	msg2Elem.remove(); // 2. 要素を削除

	setTimeout(() => {
		showPopup(); // 0.5秒後に表示
		setTimeout(() => { // 1秒後に実行
			tyipngMessage(KillMsg, msg1Elem, () => {
				document.getElementById("endButton").style.visibility = "visible";
				document.getElementById("Button-message").style.visibility = "visible";
				document.getElementById('endButton').focus();
				document.body.appendChild(savedElement);  // 要素を復元（再追加）
			});
			}, 500);
	}, 1000);

	return new Promise((resolve) => {
		window._popupCallback = () => {
		resolve();
		};
	});
}

// タイマー
let startTime;
let timerRunning = true; // タイマー有効
function startTimerBar() {
	const bar = document.getElementById("timer-bar");
	const input = document.getElementById("wordInput");
	const message = document.getElementById("message");
	const totalTime = 1000 * Number(sessionStorage.getItem("inputTime")); // ミリ秒単位で正確に処理（5秒）
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

			message.textContent = Enemy.Name +"から攻撃を受けた";
	  		PlayerDamage(); // プレイヤーがダメージを受けた場合に点滅
			let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel"));
			damageJudge(level, "player"); // レベル・ダメージ判定
			const gameStatus = sessionStorage.getItem("gameStatus");
			sessionStorage.setItem("DamageLevel", sessionStorage.getItem("NowDL"));
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

let AbilityCount = 3; // 特殊攻撃カウント
let lockHeelCount; // シドー特別設定
// ゲーム管理
async function statusCheck(gameStatus){
	if (gameStatus === "play"){
		let level
		if(sessionStorage.getItem("StageLevel") === "1") AbilityCount++;
		if(AbilityCount % 5 === 0){
			lockHeelCount = AbilityCount + 3; // シドー特別設定
			level = 6; // ダメージlevel6設定
			sessionStorage.setItem("NowDL", sessionStorage.getItem("DamageLevel")); // 現在のDLを保持
			sessionStorage.setItem("DamageLevel", 5);
			sessionStorage.setItem("gameStatus","AbilityAttack");
			sessionStorage.setItem("inputTime",8);
			await AbilityAttack();
		}else {
			if(AbilityCount === lockHeelCount) sessionStorage.setItem("typingCount", true); // シドー特別設定
			sessionStorage.setItem("NowDL", sessionStorage.getItem("DamageLevel")); // 現在のDLを保持
			level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel")); // 通常level
			sessionStorage.setItem("inputTime",8);
		}
		let stage = Number(sessionStorage.getItem("stageNo"));
		await findQuestions(level,stage).then(result => {
			questionList = result;
			let max = questionList.length;
			randomIndex = Math.floor(Math.random() * max);
			updateQuestions(questionList[randomIndex].question,level,stage); // false更新。noとlevelを引数に渡す
			showQuestion(); // 問題表示
			startTimerBar(); // タイマー開始
		},3000);
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
			showPopup(); // 0.5秒後に表示
			setTimeout(() => { // 3秒後に実行
				tyipngMessage(nextMsg, msg1Elem, () => {
					document.getElementById("endButton").style.visibility = "visible";
					document.getElementById("Button-message").style.visibility = "visible";
					document.getElementById('endButton').focus();
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
			updateUserInfo(Player.Name,3); // クリアstageを更新
			msg1Elem.style.color = 'rgb(255,255,128)';
			showPopup("CONGRATULATIONS", Player.Name + "の勝利です。");
		}
		document.getElementById("endButton").style.visibility = "visible";
		document.getElementById("Button-message").style.visibility = "visible";
		document.getElementById('endButton').focus();
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
	if (playerHPPercentage <= 0) pHPBar.style.backgroundColor = "#444";
	else if (playerHPPercentage <= Player.MaxHP * 0.3) pHPBar.style.backgroundColor = "red";
	else if (playerHPPercentage <= Player.MaxHP * 0.6) pHPBar.style.backgroundColor = "orange";
	else pHPBar.style.backgroundColor = "#4caf50";
	playerHPBar.style.width = (Player.MaxHP * unitWidthPerHP) + "px";
	pHPBar.style.width = (playerHPPercentage / Player.MaxHP * 100) + "%"; 	// ゲージ内の進捗（HP%）
}
function updateEnemyHPBar() { // enemy
	const eHPBar = document.getElementById("eHPBar");
	const enemyHPBar = document.getElementById("enemyHPBar");
	if (Enemy.HP <= 0) Enemy.HP = 0;
	const enemyHPPercentage = Enemy.HP;

	// HP色変化
	if (enemyHPPercentage <= (0.3 * Enemy.MaxHP)) {
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

// Level別ダメージ調節
function DamageLevel(level, hitDamage,DummyHP) {
	let ans;
	let x;
	switch(level) {
			case 1:
				ans = 210;
				x = 1;
				break;
			case 2:
				ans = 210;
				x = 1.5;
				break;
			case 3:
				ans = 20;
				x = 1.0;
				break;
			case 4:
				ans = 20;
				x = 1.5;
				break;
			case 5:
				ans = 20;
				x = 2.0;
				break;
			case 6:
				ans = 20;
				x = 2.0;
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

// HP・ダメージ管理・status管理
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
		console.log("playerに" + (Player.HP-DummyHP) + "ダメージ");
		Player.HP = DummyHP;
		updatePlayerHPBar();
		// シドー特殊設定
		if(sessionStorage.getItem("StageLevel") === "1"){
			let randomDrain = Math.floor(Math.random() * 3);
			if(randomDrain === 0){
				Enemy.HP += 25;
				if(Enemy.HP >= Enemy.MaxHP) Enemy.HP = Enemy.MaxHP;
				updateEnemyHPBar();
			}
		}
	}else {
		DummyHP = Number(DamageLevel(level, hitDamage,Enemy.HP));
		const StageLevel = Number(sessionStorage.getItem("StageLevel")); // 文字列になるため型変換
		if(DummyHP <= 0 && StageLevel === 1){
			sessionStorage.setItem("gameStatus", "end");
			sessionStorage.setItem("winner", "player");
		}else if(DummyHP <= 0 &&  StageLevel === 0){
			sessionStorage.setItem("gameStatus", "next");
		}else{
			sessionStorage.setItem("gameStatus", "play");
		}
		console.log("enemyに" + (Enemy.HP-DummyHP) + "ダメージ");
		Enemy.HP = DummyHP;
		updateEnemyHPBar();
	}
}

let romajiCandidatesList = []; // ローマ字候補を複数保持 susi,sushi..

//問題の表示
function showQuestion() {
	let questionJ = questionList[randomIndex].translation;
	let kana = questionList[randomIndex].kana;
	console.log("問題文：" + questionList[randomIndex].text + "/" + questionList[randomIndex].translation);

	// ここで複数ローマ字候補を生成 susi,sushi..
	romajiCandidatesList = generateAllRomajiCandidates(kana);

	// UI表示は初期状態は 最小文字数を表示（画面表示用）
	const displayRomaji = romajiCandidatesList.reduce((shortest, current) =>
		current.length < shortest.length ? current : shortest
	);

  	const text = document.getElementById("text"); // タイピング文字
	const translation = document.getElementById("translation"); // 日本語
	const input = document.getElementById("wordInput");

	// 表示リセット
	text.innerHTML = ""; //<span>を使用しているため要素ごと削除
	translation.textContent = questionJ; // 問題文を出力
	input.value = ""; // 入力欄をクリア
	message.textContent = "正しく入力してください";

	// 文字列を<span> で分解して1文字ずつ表示
	for (let i = 0; i < displayRomaji.length; i++) {
		const span = document.createElement("span");
		span.id = `char${i}`; // spanのidを一文字づつ設定
		span.textContent = displayRomaji[i];
		span.style.color = "white";
		text.appendChild(span);
	}

	text.style.visibility = "visible";
	translation.style.visibility = "visible";
	input.disabled = true; // 要素削除：input無効
	input.focus(); // 要素inputにフォーカスを設定
}

let typingCount; // タイピングカウント
// メイン //
// // 初期化関数を実行して読み込み時に開始。jsファイルを変数にしたため読込時の発火が使用できなくなったので初期化してる
async function initBattle() {
	console.log("Window loaded");  // ここでイベントが実行されているかを確認
	document.getElementById('popup').classList.add('hidden');
	updatePlayerHPBar();
	updateEnemyHPBar();
	if(sessionStorage.getItem("firstUpdate") === "true") await updateAllQuestions(); // 全問題をtrue
	db = window.db; // Firestore のグローバル接続を参照
	let input = document.getElementById("wordInput"); // inputを定義
	sessionStorage.setItem("typingCount", true); // シドー特別設定

	// 初回問題集の取得
	let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel")); // levelの問題を取得
	let stage = Number(sessionStorage.getItem("stageNo"));
	sessionStorage.setItem("NowDL",sessionStorage.getItem("DamageLevel"));
	findQuestions(level,stage).then(result => { // level1の問題を取得
		questionList = result;
		let max = questionList.length;
		randomIndex = Math.floor(Math.random() * max);
		console.log(questionList);
		console.log(randomIndex);
		updateQuestions(questionList[randomIndex].question,level,stage); // false更新。noとlevelを引数に渡す
		showQuestion(); // 最初の問題表示

		// タイマー開始
		startTimerBar();
	},1000);

	// inputはDOMContentLoaded内で定義すればnullにならない
	// スペルを一文字ごとに確認し色付けする
	input.addEventListener("input", () => {  // 定義したinput.入力するたびに処理実行
		input.focus(); // 要素inputにフォーカスを設定
		let userInput = input.value; // 入力するたびに最新値
		console.log("入力文字：" + userInput); // 入力文字

		const charSpan = document.getElementById(`char${userInput.length - 1}`); // <span>内の要素を取得
		console.log("一致文字：" + charSpan);

		// 候補のうち、userInputをprefixとして満たすものだけに絞る
		if (!isInputPrefixOfAnyCandidate(userInput, romajiCandidatesList)) { // 候補文字と入力されている文字を比較
			// 不正入力：最後の1文字を削除
			input.value = userInput.slice(0, -1);
			userInput = input.value;
			typingCount = 0; // ミスったのでカウントリセット
		} else {
			if(sessionStorage.getItem("typingCount") === "true"){
				typingCount++; // 正しい入力文字数カウント

				// 回復処理
				if (typingCount >= 15) {
					Player.HP += 15;
					if (Player.HP > Player.MaxHP) Player.HP = Player.MaxHP;
					updatePlayerHPBar();
					showHealEffect();
					typingCount = 0;
				}
			}
		}

		// 表示の更新（画面上に最も近い候補を表示して色分け）
		let matchedCandidate = romajiCandidatesList.find(c => c.startsWith(userInput));
		if (!matchedCandidate) { // 上記見つからなかった場合の保険
			matchedCandidate = romajiCandidatesList.reduce((shortest, current) =>
				current.length < shortest.length ? current : shortest
			);
		}

		const textElem = document.getElementById("text");
		textElem.innerHTML = "";
		// matchedCandidateの先頭からuserInputの文字数だけグレーに設定し再表示
		for (let i = 0; i < matchedCandidate.length; i++) {
			const span = document.createElement("span");
			span.id = `char${i}`;
			span.textContent = matchedCandidate[i];
			span.style.color = i < userInput.length ? "gray" : "white";
			textElem.appendChild(span);
		}

		// すべて正しく入力されたら自動送信
		if (isInputExactlyAnyCandidate(userInput, romajiCandidatesList)) { // ローマ字候補と一致判定
			timerRunning = false; // タイマー停止
			input.disabled = true; // 入力停止
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
}