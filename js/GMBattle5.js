let db;
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
	const KillMsg = sessionStorage.getItem("AbilityPopMsg");
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
		// ここで毎回初期化することでループごとにリセットされる
    	let resolved = false;
		const bar = document.getElementById("timer-bar");
		const input = document.getElementById("wordInput");
		const message = document.getElementById("message");
		const totalTime = 1000 * Number(sessionStorage.getItem("inputTime")); // ミリ秒

		startTime = null;
		timerRunning = true;
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
				let level;

				if (!resolved) {
					resolved = true; // ← これが重要
					resolve("timeout");
				}

				if (Ability !== 3) {
					if (Ability === 5){ // 回復
						message.textContent = Enemy.Name + "が回復呪文を唱えた";
						level = 7;
						damageJudge(level, "enemy");
						showHealEffect2();
					}else { // 通常
						message.textContent = Enemy.Name + "から攻撃を受けた";
						level = Number(sessionStorage.getItem("DamageLevel"));
						damageJudge(level, "player");
						PlayerDamage();
					}
					const gameStatus = sessionStorage.getItem("gameStatus");
					sessionStorage.setItem("DamageLevel", sessionStorage.getItem("SaveDL") || 2); // DanegeLevelを戻す
					if (window.stopTimerEarly) stopTimerEarly();
					setTimeout(() => {
						statusCheck(gameStatus);
					}, 3000);
				}else if (Ability === 3){
					// 連続攻撃ループ
					message.textContent = Enemy.Name + "から攻撃を受けた";
					damageJudge(1, "player");
					PlayerDamage();
					const gameStatus = sessionStorage.getItem("gameStatus");
					if(QuestionsCount === ConsecutiveAttack){
						message.textContent = AttackConsecutiveCount + "回、攻撃をかわした";
						if (window.stopTimerEarly) stopTimerEarly();
						// 連続攻撃終了⇒通常攻撃へ
						setTimeout(() => {
							statusCheck(gameStatus);
						}, 3000);
					}else{
						// 連続攻撃継続
						if(Player.HP <= 0){ // HP判定
							sessionStorage.setItem("gameStatus", "end");
							sessionStorage.setItem("winner", "enemy");
							setTimeout(() => { // status判定
								statusCheck("end");
							}, 2000);
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
			// if(resolved) return;
			console.log("resolve 発火：typed");
			timerRunning = false;
			resolved = true;
			resolve("typed");
		};
		// 初期化
		startTime = null;
		timerRunning = true;
		requestAnimationFrame(updateBar);
	});
}

// 特殊設定
let AbilityCount = 1; // 特殊攻撃のカウンター初期値
let ConsecutiveAttack = 4; // 連続攻撃の設定回数
let AttackConsecutiveCount; // 連続攻撃の解答回数
let QuestionsCount // 連続攻撃の問題カウンター（何問目）
let AbilityTypingCount; // 長文タイピング数
let displayRomajiLngth; // 長文文字数
let heelCount = 20; // 体力回復カウント 20
let healPoint = 20; // 回復値 20
let lockHeelCount; // ターン制の回復阻止
let Ability = 0; // 特殊攻撃状態 0~4
sessionStorage.setItem("typingCount", true); // 体力回復 true/false
sessionStorage.setItem("typingMiss", false); // 体力回復 true/false
let stage; // 問題取得ステージ

// 特殊攻撃判定
function setAbility(){
	// Ability = 5;
	Ability = Math.floor(Math.random() * 5) + 1; // 1~4
	sessionStorage.setItem("SaveDL", sessionStorage.getItem("DamageLevel")); // 現在のDLを保持
	sessionStorage.setItem("gameStatus","AbilityAttack");
	switch (Ability){
		case 1 :
			sessionStorage.setItem("DamageLevel", 6); // level5+1
			sessionStorage.setItem("inputTime",2.5);
			sessionStorage.setItem("AbilityPopMsg","「すべてを焼き尽くす!」<br>エスタークは呪文を唱えた<br>「しゃくねつほのお」"); // POPメッセ
			stage = 1;
			break;
		case 2 :
			lockHeelCount = AbilityCount + 3; // 2ターン回復阻止
			sessionStorage.setItem("DamageLevel", 5); // level5+1
			sessionStorage.setItem("inputTime",7);
			sessionStorage.setItem("AbilityPopMsg","「すべてを凍てつかせよう…」エスタークは呪文を唱えた<br>「いてつくはどう」<br>勇者は２ターン回復できなくなった。"); // POPメッセ
			stage = 1;
			break;
		case 3 :
			AttackConsecutiveCount = 0; // リセット
			QuestionsCount = 0; // リセット
			sessionStorage.setItem("DamageLevel", 1); // level1
			sessionStorage.setItem("inputTime",2.5);
			sessionStorage.setItem("AbilityPopMsg","「消えろ… 人間ども!!」<br>エスタークは呪文を唱えた<br>「イオナズン」<br>エスタークの連続攻撃!!"); // POPメッセ
			stage = 2;
			break;
		case 4 :
			AbilityTypingCount = 0;
			sessionStorage.setItem("DamageLevel", 5);
			sessionStorage.setItem("inputTime",15);
			sessionStorage.setItem("AbilityPopMsg","「滅びよ……」<br>エスタークは呪文を唱えた<br>「かがやくいき」"); // POPメッセ
			stage = 4;
			break;
		case 5 :
			sessionStorage.setItem("DamageLevel", 4);
			sessionStorage.setItem("inputTime",6);
			sessionStorage.setItem("AbilityPopMsg","「グゴゴゴゴ…」<br>エスタークが回復呪文を唱えようとしている<br>「ホイミ」"); // POPメッセ
			stage = 3;
			break;
		default :
			break;
	}
}

// ゲーム管理
async function statusCheck(gameStatus){
	if (gameStatus === "play"){
		let level;
		AbilityCount++;
		if(AbilityCount % 3 === 0){
			setAbility();
			await AbilityAttack();
			level = Number(sessionStorage.getItem("DamageLevel"));
		}else {
			Ability = 0; // 通常,stage1と2の場合はレベルに1加算し調整
			sessionStorage.setItem("SaveDL", sessionStorage.getItem("DamageLevel")); // 現在のDLを保持
			stage = Math.floor(Math.random() * 3) + 1; // 1~4stage
			if(stage === 1 || stage === 2) level = Number(sessionStorage.getItem("DamageLevel")) + 1;
			else level = Number(sessionStorage.getItem("DamageLevel"));
			sessionStorage.setItem("inputTime",7);
		}

		if(Ability === 3 && AbilityCount % 3 === 0){
			// stage3の連続攻撃
			for(let c = 0; c < ConsecutiveAttack; c++){
				QuestionsCount++; // 何問目
				const result = await findQuestions(level, stage);
				questionList = result;
				randomIndex = Math.floor(Math.random() * questionList.length);
				updateQuestions(questionList[randomIndex].question, level, stage); // false更新。noとlevelを引数に渡す
				showQuestion(); // 問題表示
				await startTimerBar();
				console.log(QuestionsCount + "問目");
			}
			console.log("ループ終了");
		}else {
			const result = await findQuestions(level, stage);
			questionList = result;
			randomIndex = Math.floor(Math.random() * questionList.length);
			updateQuestions(questionList[randomIndex].question,level,stage); // false更新。noとlevelを引数に渡す
			showQuestion(); // 問題表示
			await startTimerBar();
		}
	}else if (gameStatus === "end"){
		const input = document.getElementById("wordInput");
		timerRunning = false;	 // タイマー無効
		input.disabled = true; // 要素削除：input無効
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
			updateUserInfo(Player.Name,6); // クリアstageを更新
			msg1Elem.style.color = 'rgb(2, 2, 2)';
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
	if (Enemy.HP >= Enemy.MaxHP) Enemy.HP = Enemy.MaxHP;
	const enemyHPPercentage = Enemy.HP;
	// HP色変化
	if (enemyHPPercentage <= (0.35 * Enemy.MaxHP)) {
		ConsecutiveAttack = 6;
		sessionStorage.setItem("DamageLevel",4);
		eHPBar.style.backgroundColor = "red";
	}else if (enemyHPPercentage <= (0.7 * Enemy.MaxHP)) {
		ConsecutiveAttack = 5;
		sessionStorage.setItem("DamageLevel",3);
		eHPBar.style.backgroundColor = "orange";
	}else {
		ConsecutiveAttack = 4;
		sessionStorage.setItem("DamageLevel",2);
		eHPBar.style.backgroundColor = "#4caf50";
	}
	if (enemyHPPercentage <= (0.5 * Enemy.MaxHP)) sessionStorage.setItem("typingMiss", true);
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
				x = 1.0;
				break;
			case 2:
				ans = 10;
				x = 2.0;
				break;
			case 3:
				ans = 20;
				x = 1.5;
				break;
			case 4:
				ans = 20;
				x = 2.0;
				break;
			case 5:
				if(stage === 4){
					if (AbilityTypingCount === displayRomajiLngth) ans = 0;
					else if (AbilityTypingCount >= displayRomajiLngth * 0.8) ans = 20;
					else if (AbilityTypingCount >= displayRomajiLngth * 0.6) ans = 40;
					else if (AbilityTypingCount >= displayRomajiLngth * 0.4) ans = 50;
					else ans = 60;
					x = 1;
				}else {
					ans = 25;
					x = 2.0;
				}
				break;
			case 6:
				ans = 40;
				x = 1.5;
				break;
			case 7:
				ans = -25;
				x = 0;
				break;
			default:
				ans = 0;
				x = 0;
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
		if(DummyHP <= 0){
			sessionStorage.setItem("gameStatus", "end");
			sessionStorage.setItem("winner", "player");
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

// スペルを一文字ごとに確認し色付けする
function matchTyping() {  // 定義したinput.入力するたびに処理実行
	const input = document.getElementById("wordInput");
	if (!timerRunning || input.disabled) return; // 時間切れの場合は入力ブロック
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
		// 特殊設定
		if(sessionStorage.getItem("typingMiss") === "true"){
			Player.HP -= 5;
			updatePlayerHPBar();
			PlayerDamage2();
			if(Player.HP <= 0){
				timerRunning = false; // タイマー停止
				input.disabled = true; // 入力停止
				sessionStorage.setItem("gameStatus", "end");
				sessionStorage.setItem("winner", "enemy");
				setTimeout(() => { // status判定
					statusCheck("end");
				}, 500);
			}
		}
	} else {
		AbilityTypingCount++; // 長文タイピングカウント
		if(sessionStorage.getItem("typingCount") === "true"){ // 体力回復 true/false
			typingCount++; // 正しい入力文字数カウント
			// 回復処理
			if (typingCount >= heelCount && AbilityCount > lockHeelCount) {
				Player.HP += heelPoint;
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
		timerRunning = false; // タイマー停止
		input.disabled = true; // 入力停止
		let level;
		// 特殊攻撃状態 or 通常状態
		if (Ability === 0) {
			message.textContent = "勇者の攻撃";
			if(stage === 1 || stage === 2) level = Number(sessionStorage.getItem("DamageLevel")) + 1;
			else level = Number(sessionStorage.getItem("DamageLevel"));
		}else if (Ability === 3) {
			AttackConsecutiveCount++; // 連続攻撃の回答数
			if(QuestionsCount === ConsecutiveAttack){
				// 終了
				if(AttackConsecutiveCount === ConsecutiveAttack){ // 全てタイピングした場合
					damageJudge(6, "enemy"); // ダメージ40
					message.textContent = "勇者のカウンター攻撃";
					EnemyDamage(); // プレイヤーがダメージを受けた場合に点滅
				}else {
					message.textContent = AttackConsecutiveCount + "回、攻撃をかわした";
				}
				const gameStatus = sessionStorage.getItem("gameStatus");
				if (window.stopTimerEarly) stopTimerEarly(); // resolve("typed") が呼ばれてループが進む(タイマー停止)
				setTimeout(() => { // status判定
					statusCheck(gameStatus);
				}, 3000);
				return;
			}else {
				// 継続
				message.textContent = Enemy.Name + "の攻撃をかわした";
				if (window.stopTimerEarly) stopTimerEarly(); // if で書けば未定義の場合にエラー回避
				return;
			}
		}else if (Ability === 4){// 特殊攻撃を全てタイピングした場合の挙動
			message.textContent = Enemy.Name + "の攻撃を防いだ";
			level = Number(sessionStorage.getItem("DamageLevel"));
		}else if (Ability === 5){// 回復
			message.textContent = Enemy.Name + "の回復呪文を阻止した";
			level = 7;
		}else {
			message.textContent = "勇者の攻撃";
			level = Number(sessionStorage.getItem("DamageLevel"));
		}
		damageJudge(level, "enemy"); // レベル・ダメージ判定⇒gameStatusを設定
		if (Ability !== 5) EnemyDamage(); // enemyダメージを受けた場合に点滅
		const gameStatus = sessionStorage.getItem("gameStatus");
		if (window.stopTimerEarly) stopTimerEarly();
		setTimeout(() => { // status判定
			statusCheck(gameStatus);
		}, 3000);
	}
};

let typingCount; // タイピングカウント
document.getElementById("wordInput").addEventListener("input", matchTyping); // inputを定義
sessionStorage.setItem("DamageLevel" ,2);
sessionStorage.setItem("inputTime",7);
// メイン //
// // 初期化関数を実行して読み込み時に開始。jsファイルを変数にしたため読込時の発火が使用できなくなったので初期化してる
async function initBattle() {
	console.log("Window loaded");  // ここでイベントが実行されているかを確認
	document.getElementById('popup').classList.add('hidden');
	updatePlayerHPBar();
	updateEnemyHPBar();
	if(sessionStorage.getItem("firstUpdate") === "true") await updateAllQuestions(); // 全問題をtrue
	db = window.db; // Firestore のグローバル接続を参照

	// 初回問題集の取得
	let level = Number(sessionStorage.getItem("DamageLevel")); // levelの問題を取得
	stage = Math.floor(Math.random() * 3) + 1;
	sessionStorage.setItem("SaveDL",sessionStorage.getItem("DamageLevel"));
	const result = await findQuestions(level, stage); // level1の問題を取得
	questionList = result;
	randomIndex = Math.floor(Math.random() * questionList.length);
	console.log(questionList);
	console.log(randomIndex);
	updateQuestions(questionList[randomIndex].question,level,stage); // false更新。noとlevelを引数に渡す
	setTimeout(() => { // status判定
		showQuestion(); // 最初の問題表示
		startTimerBar(); // タイマー開始
	}, 2000);
}