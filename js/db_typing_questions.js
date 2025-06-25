// 問題集取得function
let questionList = []; // 問題リスト格納先
let randomIndex; // index

// 全データの showText を true に更新
async function updateAllQuestions() {
	db = window.db;
	try {
		let stage = Number(sessionStorage.getItem("stageNo")); // stageを取得
    	const querySnapshot = await db
			.collection("typing_questions")
			.where("stage", "==", stage)
			.get();
    	const updatePromises = [];

    	querySnapshot.forEach((docSnap) => {
		const docRef = db.collection("typing_questions").doc(docSnap.id);
		updatePromises.push(docRef.update({ showText: "true" }));
    	});

    	await Promise.all(updatePromises);
		sessionStorage.setItem("firstUpdate", "false");
    	console.log("全データの showText を true に更新しました");
	} catch (err) {
    	console.error("updateAllQuestions エラー:", err);
	}
}

// showText = "true" かつdifficulty一致のデータを取得
async function findQuestions(level,stage) {
	db = window.db;
	try {
    	const querySnapshot = await db
		.collection("typing_questions")
		.where("difficulty", "==", level)
		.where("showText", "==", "true")
		.where("stage", "==", stage)
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

// Noとdifficultyの1件をshowText:"false"に更新
async function updateQuestions(question, level, stage) {
	db = window.db;
	try {
    	const querySnapshot = await db
		.collection("typing_questions")
		.where("question", "==", question)
		.where("difficulty", "==", level)
		.where("stage", "==", stage)
		.get();

    	if (querySnapshot.empty) {
			console.warn("該当するデータが見つかりませんでした");
			return;
		}

    	const docRef = querySnapshot.docs[0].ref;
    	await docRef.update({ showText: false });
		console.log(`question=${question}, level=${level} のデータを非表示(false)に更新しました`);
	} catch (err) {
    	console.error("updateQuestions エラー:", err);
	}
}