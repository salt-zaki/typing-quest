// firebase-init.js
// Firebase SDK を使うには HTML 側で script タグで読み込む（このファイルでは import しない）
// Firebase 設定オブジェクト
const firebaseConfig = {
  apiKey: "AIzaSyAy9JGNSosbnqqTCHdHeiPGj8qF9oYIAno",
  authDomain: "typing-quest-f6d00.firebaseapp.com",
  projectId: "typing-quest-f6d00",
  storageBucket: "typing-quest-f6d00.firebasestorage.app",
  messagingSenderId: "963773838833",
  appId: "1:963773838833:web:6a999a10e2d52a19a9c050",
  measurementId: "G-LH4CGXSBL3"
};

// Firebase 初期化（firebase-app.js および firebase-analytics.js を読み込んでいることが前提）
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Firestore 初期化
window.db = firebase.firestore();