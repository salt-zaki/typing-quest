// ユーザー情報登録
async function addUserRegister(userName) {
    const db = window.db;

    try {
        // userName の重複チェック
        const querySnapshot = await db.collection("user_Information")
        .where("userName", "==", userName)
        .get();

        if (!querySnapshot.empty) {
            console.warn("すでに登録されているユーザー名です:", userName);
            return false; // 登録しない
        }

        // userName 登録処理
        await db.collection("user_Information").add({
            userName: userName,
            stage1: true,  // true:解放 / false:未開放
            stage2: false,
            stage3: false,
            stage4: false,
            stage5: false,
            stage6: false,
            score: "",
        });
        console.log("登録完了");
        return true;
    } catch (error) {
        console.error("user_Register 保存エラー:", error);
        return false;
    }
}

// ユーザー情報取得
async function findUser(userName) {
	const db = window.db;
	try {
        const querySnapshot = await db
		.collection("user_Information")
		.where("userName", "==", userName)
		.get();

        if (querySnapshot.empty) {
            console.warn(`${userName} は登録されていません`);
            return false;
        }

        // 通常1件のみの想定なので、最初のドキュメントを取得
        const doc = querySnapshot.docs[0];
        const userData = doc.data();
        console.log(`${userName}：ユーザー情報取得`, userData);
        return userData;
	} catch (err) {
        console.error("user_Information エラー:", err);
        return false;
	}
}

// ユーザー情報更新
async function updateUserInfo(userName,stage) {
    const db = window.db;

    try {
        // userName の重複チェック
        const querySnapshot = await db.collection("user_Information") // table指定
        .where("userName", "==", userName)
        .get();

        if (querySnapshot.empty) { // クエリ結果が空白の場合
            console.warn("ユーザー名が見つかりません:", userName);
            return false; // 更新しない
        }

        // stageX の形式でフィールド名を生成
        const stageKey = `stage${stage}`; // stageKey:カラム名を文字列で作成
        const docRef = querySnapshot.docs[0].ref; // .ref:ドキュメントの参照先をdocRefに指定している

        // 指定の stageX だけ true に更新（他は変更しない）
        await docRef.update({
            [stageKey]: true
        });

        console.log("更新完了");
        return true;
    } catch (error) {
        console.error("ステージ更新エラー:", error);
        return false;
    }
}