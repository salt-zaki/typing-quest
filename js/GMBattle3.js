let db;

// メッセージ表示（タイピング風）
const nextMsg = "ぐはあああ……！何ものだお前たちは？<br>うぐおおお……！私には何も思い出せぬ……<br>しかし何をやるべきかはわかっている。<br>お前たち人間どもを根絶やしにしてくれるわっ！";

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
	const KillMsg = "「消えろ！ 人間ども！」<br>デスピサロの連続攻撃!!<br>「いてつく波動」<br>";
	PopSet("たたかう"); // 共通処理
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
	return new Promise((resolve) => {
		const bar = document.getElementById("timer-bar");
		const input = document.getElementById("wordInput");
		const message = document.getElementById("message");
		const totalTime = 1000 * Number(sessionStorage.getItem("inputTime")); // ミリ秒

		startTime = null;
		input.disabled = false;
		input.focus();
		console.log("タイマー開始");

		function updateBar(timestamp) {
			if (!startTime) startTime = timestamp;

			const elapsed = timestamp - startTime;
			const remaining = Math.max(0, totalTime - elapsed);
			const percent = (remaining / totalTime) * 100;
			bar.style.width = percent + "%";

			if (remaining <= 0) {
				timerRunning = false;
				input.disabled = true;

				message.textContent = Enemy.Name + "から攻撃を受けた";
				PlayerDamage();
				if (sessionStorage.getItem("ConsecutiveAttack") === "1") {
					// 通常攻撃ループ
					let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel"));
					damageJudge(level, "player");
					const gameStatus = sessionStorage.getItem("gameStatus");
					setTimeout(() => {
						statusCheck(gameStatus);
					}, 3000);
				}else{
					// 連続攻撃ループ
					damageJudge(1, "player");
					const gameStatus = sessionStorage.getItem("gameStatus");
					if(EndConsecutiveCount ===  Number(sessionStorage.getItem("ConsecutiveAttack"))){
						message.textContent = AttackConsecutiveCount + "回、攻撃をかわした";
						if (window.stopTimerEarly) stopTimerEarly();
						// 連続攻撃終了⇒通常攻撃へ
						setTimeout(() => {
							statusCheck(gameStatus);
						}, 1000);
					}else{
						// 連続攻撃継続
						// HP判定
						if(Player.HP <= 0){
							sessionStorage.setItem("gameStatus", "end");
							sessionStorage.setItem("winner", "enemy");
							setTimeout(() => { // status判定
								statusCheck("end");
							}, 500);
						}
						if (window.stopTimerEarly) stopTimerEarly();
					}
				}
			} else if (timerRunning) {
				requestAnimationFrame(updateBar);
			}
		}

		// 外部からタイマー強制終了（例：タイピング成功）させたい場合用
		window.stopTimerEarly = () => {
			timerRunning = false;
			resolve("typed");
		};
		// 初期化
		startTime = null;
		timerRunning = true;
		requestAnimationFrame(updateBar);
	});
}

// 連続攻撃設定
sessionStorage.setItem("ConsecutiveAttack", 1); // 初期設定
function setConsecutiveAttack(){
	if (Enemy.HP <= (0.3 * Enemy.MaxHP)) sessionStorage.setItem("ConsecutiveAttack", 5);
	else if (Enemy.HP <= (0.6 * Enemy.MaxHP)) sessionStorage.setItem("ConsecutiveAttack", 4);
	else if (Enemy.HP <= (0.8 * Enemy.MaxHP)) sessionStorage.setItem("ConsecutiveAttack", 3);
	else sessionStorage.setItem("ConsecutiveAttack", 2);
}

let AbilityCount = 2; // 特殊攻撃カウント
let AttackConsecutiveCount; // 連続解答回数
let EndConsecutiveCount; // 終了するまで加算
// ゲーム管理
async function statusCheck(gameStatus){
	if (gameStatus === "play"){
		let level;
		let ConsecutiveAttack; // 連続攻撃回数
		if(sessionStorage.getItem("StageLevel") === "1") AbilityCount++;
		if(AbilityCount % 4 === 0){
			level = 1;
			AttackConsecutiveCount = 0;
			EndConsecutiveCount = 0;
			setConsecutiveAttack();
			ConsecutiveAttack = Number(sessionStorage.getItem("ConsecutiveAttack")); // ループ回数
			sessionStorage.setItem("gameStatus","AbilityAttack");
			sessionStorage.setItem("inputTime",2);
			await AbilityAttack();
		}else {
			ConsecutiveAttack = 1; // 通常時
			sessionStorage.setItem("ConsecutiveAttack", 1); //
			level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel")); // 通常level
			sessionStorage.setItem("inputTime",8);
		}
		let stage = Number(sessionStorage.getItem("stageNo"));
		if(ConsecutiveAttack === 1){
			// 通常攻撃
			const result = await findQuestions(level, stage);
			questionList = result;
			let max = questionList.length;
			randomIndex = Math.floor(Math.random() * max);
			updateQuestions(questionList[randomIndex].question,level,stage); // false更新。noとlevelを引数に渡す
			showQuestion(); // 問題表示
			await startTimerBar();
		}else{
			// 連続攻撃
			for(let c = 0; c < ConsecutiveAttack; c++){
				EndConsecutiveCount++; // 終了値
				const result = await findQuestions(level, stage);
				questionList = result;
				let max = questionList.length;
				randomIndex = Math.floor(Math.random() * max);
				updateQuestions(questionList[randomIndex].question,level,stage); // false更新。noとlevelを引数に渡す
				showQuestion(); // 問題表示
				await startTimerBar();
			}
		}
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

		// popup-message2 を確実に再作成・挿入（重複防止）
		if (document.getElementById("popup-message2") !== null) {
			const msg2 = document.createElement("p");
			msg2.id = "popup-message2";
			msg2.classList.add("popup-message2");

			const popupContent = document.querySelector(".popup-content");
			const endBtn = document.getElementById("endButton");
			popupContent.insertBefore(msg2, endBtn); // endButtonの前に追加
		}
		if(winner === "enemy"){
			msg1Elem.style.color = 'red';
			showPopup("GAME OVER","出直してきてください");
		}else{
			updateUserInfo(Player.Name,4); // クリアstageを更新
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
		sessionStorage.setItem("DamageLevel",3);
	    eHPBar.style.backgroundColor = "red";
	}else if (enemyHPPercentage <= (0.6 * Enemy.MaxHP)) {
		sessionStorage.setItem("DamageLevel",2);
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
				ans = 10;
				x = 1;
				break;
			case 2:
				ans = 10;
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
				ans = 40;
				x = 2;
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

// HP・ダメージ・status管理
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
	document.getElementById("text").scrollLeft = 0;
	text.style.visibility = "visible";
	translation.style.visibility = "visible";
	input.disabled = true; // 要素削除：input無効
	input.focus(); // 要素inputにフォーカスを設定
}

let typingCount; // タイピングカウント
document.getElementById("wordInput").addEventListener("input", matchTyping); // inputを定義
// エスターク特殊設定
if(sessionStorage.getItem("StageLevel") === 0) {
	sessionStorage.setItem("Count", 20);
	sessionStorage.setItem("typingDamage", 5);
}else {
	sessionStorage.setItem("Count", 25);
	sessionStorage.setItem("typingDamage", 10);
}
// スペルを一文字ごとに確認し色付けする
function matchTyping() {  // 定義したinput.入力するたびに処理実行
	const input = document.getElementById("wordInput");
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
		// エスターク特殊設定
		Player.HP -= Number(sessionStorage.getItem("typingDamage"));
		updatePlayerHPBar();
		PlayerDamage2();
		typingCount = 0;
		if(Player.HP <= 0){
			input.disabled = true; // 入力停止
			sessionStorage.setItem("gameStatus", "end");
			sessionStorage.setItem("winner", "enemy");
			setTimeout(() => { // status判定
				statusCheck("end");
			}, 500);
		}
	} else {
		typingCount++; // 正しい入力文字数カウント

		// 回復処理
		if (typingCount >= Number(sessionStorage.getItem("Count"))) {
			Player.HP += 15;
			if (Player.HP > Player.MaxHP) Player.HP = Player.MaxHP;
			updatePlayerHPBar();
			showHealEffect();
			typingCount = 0;
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

	// 文字スクロール
	const typedLength = input.value.length;
	const nextIndex = typedLength + 8; // 常に5文字先が見えるようにする
	const targetSpan = document.getElementById("char" + nextIndex);
	if (targetSpan) {
		targetSpan.scrollIntoView({
		behavior: "smooth",
		inline: "end",    // 右端に寄せる
		block: "nearest"  // 縦スクロールはしない
		});
	}

	// すべて正しく入力されたら自動送信
	if (isInputExactlyAnyCandidate(userInput, romajiCandidatesList)) { // ローマ字候補と一致判定
		timerRunning = false;
		input.disabled = true; // 入力停止
		if (sessionStorage.getItem("ConsecutiveAttack") === "1") {
			// 通常攻撃のループ
			let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel"));
			damageJudge(level, "enemy"); // レベル・ダメージ判定

			// ダメージエフェクト
			message.textContent = "勇者の攻撃";
			EnemyDamage(); // enemyダメージを受けた場合に点滅
			const gameStatus = sessionStorage.getItem("gameStatus");
			if (window.stopTimerEarly) stopTimerEarly();
			setTimeout(() => { // status判定
				statusCheck(gameStatus);
			}, 3000);
		}else {
			// 連続攻撃のループ
			AttackConsecutiveCount++;
			if(EndConsecutiveCount === Number(sessionStorage.getItem("ConsecutiveAttack"))){
				// 全てタイピングした場合
				if(AttackConsecutiveCount === Number(sessionStorage.getItem("ConsecutiveAttack"))){
					damageJudge(6, "enemy"); // ダメージ40
					message.textContent = "勇者のカウンター攻撃";
					EnemyDamage(); // プレイヤーがダメージを受けた場合に点滅
				}
				const gameStatus = sessionStorage.getItem("gameStatus");
				if (window.stopTimerEarly) stopTimerEarly(); // resolve("typed") が呼ばれてループが進む(タイマー停止)
				setTimeout(() => { // status判定
					statusCheck(gameStatus);
				}, 1000);
			}else {
				// 継続
				message.textContent = Enemy.Name + "の攻撃をかわした";
				if (window.stopTimerEarly) stopTimerEarly(); // if で書けば未定義の場合にエラー回避
			}
		}
	}
};

// メイン //
// // 初期化関数を実行して読み込み時に開始。jsファイルを変数にしたため読込時の発火が使用できなくなったので初期化してる
async function initBattle() {
	console.log("Window loaded");  // ここでイベントが実行されているかを確認
	document.getElementById('popup').classList.add('hidden');
	updatePlayerHPBar();
	updateEnemyHPBar();
	if(sessionStorage.getItem("firstUpdate") === "true") await updateAllQuestions(); // 全問題をtrue
	db = window.db; // Firestore のグローバル接続を参照
	sessionStorage.setItem("typingCount", true); // デスピサロ特別設定

	// 初回問題集の取得
	let level = Number(sessionStorage.getItem("DamageLevel")) + Number(sessionStorage.getItem("StageLevel")); // levelの問題を取得
	let stage = Number(sessionStorage.getItem("stageNo"));
	sessionStorage.setItem("NowDL",sessionStorage.getItem("DamageLevel"));
	const result = await findQuestions(level, stage); // level1の問題を取得
	questionList = result;
	let max = questionList.length;
	randomIndex = Math.floor(Math.random() * max);
	console.log(questionList);
	console.log(randomIndex);
	updateQuestions(questionList[randomIndex].question,level,stage); // false更新。noとlevelを引数に渡す
	showQuestion(); // 最初の問題表示
	await startTimerBar(); // タイマー開始
}