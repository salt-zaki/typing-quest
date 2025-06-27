
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
	sessionStorage.setItem("inputTime",7); // 初期タイマー設定
}

// nextステージ

// nextボス
function nextBossStatus(){
	let stage = Number(sessionStorage.getItem("stageNo"));
	let Estatus;
	switch (stage){
		case 1 :
			Estatus = new Status("竜王", 200, 200, "enemyImg1-2.jpg");
			break;
		case 2 :
			Estatus = new Status("破壊神シドー", 200, 200, "enemyImg2-2.jpg");
			break;
		case 3 :
			Estatus = new Status("デスピサロ", 230, 230, "enemyImg3-2.jpg");
			break;
		case 4 :
			Estatus = new Status("ゾーマ", 250, 250, "enemyImg4-2.jpg");
			break;
		case 5 :
			Estatus = new Status("ゾーマ", 200, 200, "enemyImg5-2.jpg");
			break;
		default :
			console.log("Error");
			break;

	}
	sessionStorage.setItem("Estatus", JSON.stringify(Estatus));
}

// nextステージ設定
function nextGameStatus() {
	nextBossStatus();
	let playerHP = Player.HP+50
	if(playerHP >= 120) playerHP = 120;
	const Pstatus = new Status(Player.Name, playerHP, 120, "playerImg1-1.jpg");
	sessionStorage.setItem("Pstatus", JSON.stringify(Pstatus));
	sessionStorage.setItem("gameStatus","play");
	sessionStorage.setItem("StageLevel",1);
	sessionStorage.setItem("DamageLevel",1);
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
// ダメージエフェクト2
function PlayerDamage2() { // プレイヤーがダメージを受けた場合
  DamageEffect2(document.getElementById("playerImg"));
}
function EnemyDamage2() { // 敵がダメージを受けた場合
  DamageEffect2(document.getElementById("enemyImg"));
}
// ダメージを受けた場合に画像を点滅させる関数
function DamageEffect2(img) {
	// 点滅クラスを追加
	img.classList.add('hit');
	
	// 点滅を実行
	setTimeout(() => {
	  img.classList.remove('hit');
	}, 750); // 2000ms（2秒）後に点滅を停止
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

// ローマ字辞書
const ROMAJI_DICT = {
	"あ": ["a"], "い": ["i"], "う": ["u"], "え": ["e"], "お": ["o"],
	"か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
	"さ": ["sa"], "し": ["shi", "si"], "す": ["su"], "せ": ["se"], "そ": ["so"],
	"た": ["ta"], "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": ["te"], "と": ["to"],
	"な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
	"は": ["ha"], "ひ": ["hi"], "ふ": ["fu", "hu"], "へ": ["he"], "ほ": ["ho"],
	"ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
	"や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
	"ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
	"わ": ["wa"], "を": ["wo"], "ん": ["n"],
	"が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
	"ざ": ["za"], "じ": ["ji", "zi"], "ず": ["zu"], "ぜ": ["ze"], "ぞ": ["zo"],
	"だ": ["da"], "ぢ": ["di"], "づ": ["du"], "で": ["de"], "ど": ["do"],
	"ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
	"ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],
	"ぁ": ["xa", "la", "a"], "ぃ": ["xi", "li", "i"], "ぅ": ["xu", "lu", "u"], "ぇ": ["xe", "le", "e"], "ぉ": ["xo", "lo", "o"],
	"ゃ": ["xya", "lya"], "ゅ": ["xyu", "lyu"], "ょ": ["xyo", "lyo"], "ゎ": ["xwa", "lwa"],

	// 拗音（2文字）
	"きゃ": ["kya"], "きぃ": ["kyi"], "きゅ": ["kyu"], "きぇ": ["kye"], "きょ": ["kyo"],
	"ぎゃ": ["gya"], "ぎぃ": ["gyi"], "ぎゅ": ["gyu"], "ぎぇ": ["gye"], "ぎょ": ["gyo"],
	"しゃ": ["sha", "sya"], "しぃ": ["syi"], "しゅ": ["shu", "syu"], "しぇ": ["she", "sye"], "しょ": ["sho", "syo"],
	"じゃ": ["ja", "jya", "zya"], "じぃ": ["jyi", "zyi"], "じゅ": ["ju", "jyu", "zyu"], "じぇ": ["je", "jye", "zye"], "じょ": ["jo", "jyo", "zyo"],
	"ちゃ": ["cha", "cya", "tya"], "ちぃ": ["cyi", "tyi"], "ちゅ": ["chu", "cyu", "tyu"], "ちぇ": ["che", "cye", "tye"], "ちょ": ["cho", "cyo", "tyo"],
	"にゃ": ["nya"], "にぃ": ["nyi"], "にゅ": ["nyu"], "にぇ": ["nye"], "にょ": ["nyo"],
	"ひゃ": ["hya"], "ひぃ": ["hyi"], "ひゅ": ["hyu"], "ひぇ": ["hye"], "ひょ": ["hyo"],
	"びゃ": ["bya"], "びぃ": ["byi"], "びゅ": ["byu"], "びぇ": ["bye"], "びょ": ["byo"],
	"ぴゃ": ["pya"], "ぴぃ": ["pyi"], "ぴゅ": ["pyu"], "ぴぇ": ["pye"], "ぴょ": ["pyo"],
	"みゃ": ["mya"], "みぃ": ["myi"], "みゅ": ["myu"], "みぇ": ["mye"], "みょ": ["myo"],
	"りゃ": ["rya"], "りぃ": ["ryi"], "りゅ": ["ryu"], "りぇ": ["rye"], "りょ": ["ryo"],
	"うぁ": ["wha"], "うぃ": ["wi", "whi"], "うぇ": ["we", "whe"], "うぉ": ["wo", "who"],
	"ゔぁ": ["va"], "ゔぃ": ["vi"], "ゔ": ["vu"], "ゔぇ": ["ve"], "ゔぉ": ["vo"], "ゔゅ": ["vyu"],
	"くぁ": ["kwa", "qa"], "くぃ": ["qi"], "くぇ": ["qe"], "くぉ": ["qo"],
	"ぐぁ": ["gwa"], "ぐぃ": ["gwi"], "ぐぅ": ["gwu"], "ぐぇ": ["gwe"], "ぐぉ": ["gwo"],
	"てゃ": ["tha"], "てぃ": ["thi"], "てゅ": ["thu"], "てぇ": ["the"], "てょ": ["tho"],
	"でゃ": ["dha"], "でぃ": ["dhi"], "でゅ": ["dhu"], "でぇ": ["dhe"], "でょ": ["dho"],
	"ふぁ": ["fa"], "ふぃ": ["fi"], "ふぇ": ["fe"], "ふぉ": ["fo"], "ふゅ": ["fyu"],
	"つぁ": ["tsa"], "つぃ": ["tsi"], "つぇ": ["tse"], "つぉ": ["tso"],

	// 記号・句読点・補助文字
	"ー": ["-"],
	"!": ["!"],
	"！": ["!"],
	"?": ["?"],
	"？": ["?"],
	",": [","],
	"、": [","],
	".": ["."],
	"。": ["."],
	"（": ["("],
	"）": [")"],
	"「": ["["],
	"」": ["]"],
	"・": ["/"],
	"っ": ["ltu", "xtu", "ltu"], // 促音は別途ロジックで子音重ねを処理するのが一般的
	"ッ": ["ltu", "xtu", "ltu"], // カタカナで使う場合も同様
};

// DOM要素
// const translation = questionList[randomIndex].kana;
const text = document.getElementById("text");
const romajiDisplay = document.getElementById("romajiDisplay");
const input = document.getElementById("wordInput");

// ひらがな1文字からローマ字候補を取得する（ROMAJI_DICTは別途用意）
function getRomajiCandidates(kanaChar) {
  return ROMAJI_DICT[kanaChar] || kanaChar; // なければそのまま返す
}

// ひらがな文字列から全ローマ字候補パターンを生成する（全組み合わせ）
function generateAllRomajiCandidates(kanaStr) { // kanaStr：表示文字のひらがな
	let results = [""]; // リストとして返す
	const kanaChars = kanaStr.split(""); // kanaStr = "しゃしん" → kanaChars = ["し", "ゃ", "し", "ん"]
	const n = kanaChars.length; // 文字数

	for(let i = 0; i < n;){
		let candidates = [];
		let step = 1; // 文字列の位置の加算値（しゃ、ぎゃ...などの場合は+2加算する）
		const twoChars = kanaChars[i] + (kanaChars[i + 1] || ""); // 2文字を作成 しゃ,ゃし...

		// 2文字一致（例: "しゃ", "きょ", "ちゃ"）
		if (ROMAJI_DICT[twoChars]) {
			candidates = getRomajiCandidates(twoChars);
			step = 2; // 2文字一致したので文字位置も2動く

		// [っ]の処理
		}else if (kanaChars[i] === "っ") {
			const nextRomajis = getRomajiCandidates(kanaChars[i + 1]); // nextRomajis:っ の次の文字（っく⇒[ku,cu]）
			const consonants = nextRomajis.map(r => r[0]).filter(Boolean); // 各ローマ字の先頭文字を取得（例: "k", "c"）し、.filter(Boolean)：空文字やundefinedなどを除外
			candidates = consonants;
			step = 1;

		// 通常1文字処理
    	}else {
			candidates = getRomajiCandidates(kanaChars[i]);
			step = 1;
    	}

		// 結合処理
		const temp = [];
		for (const prefix of results) {
			for (const c of candidates) {
			temp.push(prefix + c);
			}
		}
		results = temp;
		i += step;
	}
	return results;
}

// 入力値が複数ローマ字候補のいずれかのprefixになっているか判定する
function isInputPrefixOfAnyCandidate(input, candidates) {
	for (const candidate of candidates) {
		if (candidate.startsWith(input)) return true; // candidate = "shita"、input = "shi" ⇒true
	}
	return false;
}

// 入力値が複数ローマ字候補のどれかと完全一致しているか判定する
function isInputExactlyAnyCandidate(input, candidates) {
	for (const candidate of candidates) {
		if (candidate === input) return true;
	}
	return false;
}