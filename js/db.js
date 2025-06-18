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