// 互換モード（compat）版として Firebase SDK を使っているならこれでOK
window.updateAllQuestions = async function () {
  const db = window.db;
  const qSnap = await db.collection("typing_questions").get();
  const updatePromises = [];

  qSnap.forEach((docSnap) => {
    const docRef = db.collection("typing_questions").doc(docSnap.id);
    updatePromises.push(docRef.update({ showText: "true" }));
  });

  await Promise.all(updatePromises);
  console.log("全件 showText を true にしました");
};
