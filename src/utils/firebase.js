import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyAzzbJeN4NrO1HoYdM7Vl9fqdiXtUDsnvY",
    authDomain: "brainbyte-7a15c.firebaseapp.com",
    databaseURL: "https://brainbyte-7a15c-default-rtdb.firebaseio.com",
    projectId: "brainbyte-7a15c",
    storageBucket: "brainbyte-7a15c.firebasestorage.app",
    messagingSenderId: "768489892304",
    appId: "1:768489892304:web:7aa35f033578fb157971d5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };
