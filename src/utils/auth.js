import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Sign Up
export const signUp = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up successfully!");
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully!");
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out!");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
};
