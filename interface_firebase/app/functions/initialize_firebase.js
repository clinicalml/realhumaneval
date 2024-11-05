import firebase, { initializeApp , initializeAppCheck, ReCaptchaEnterpriseProvider} from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBXIO5wsyR3Vv73NZ3qIEJaAzeWo0ChQHg",
    authDomain: "codeonline-ee37b.firebaseapp.com",
    databaseURL: "https://codeonline-ee37b-default-rtdb.firebaseio.com",
    projectId: "codeonline-ee37b",
    storageBucket: "codeonline-ee37b.appspot.com",
    messagingSenderId: "818310751027",
    appId: "1:818310751027:web:eff1d64b6b0a9f1d365446",
    measurementId: "G-K0VGTPT176",
  };

export const app = initializeApp(firebaseConfig);
