import firebase from 'firebase'
var firebaseConfig = {
    apiKey: "AIzaSyAQ_T3msnoizQi6pqqU5MMC3kJwdhDqcNE",
    authDomain: "willy-23054.firebaseapp.com",
    projectId: "willy-23054",
    databaseURL: "https//willy-23054.firebaseio.com",
    storageBucket: "willy-23054.appspot.com",
    messagingSenderId: "531586020478",
    appId: "1:531586020478:web:06700696ce3507c9cd542f"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()