// lib/authFunctions.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,} from 'firebase/auth';
import { auth } from './firebase'; // Assuming './firebase' correctly exports the 'auth' instance

export async function signUp(email: string, password: string) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error during signUp:", error);
    // Re-throw the error so the calling component can catch it and show specific messages
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error during signIn:", error);
    // Re-throw the error
    throw error;
  }
}

export async function logOut() {
  try {
    return await signOut(auth);
  } catch (error: any) {
    console.error("Error during signOut:", error);
    throw error;
  }
}




// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import { auth } from './firebase';

// export async function signUp(email: string, password: string) {
//   return await createUserWithEmailAndPassword(auth, email, password);
// }

// export async function signIn(email: string, password: string) {
//   return await signInWithEmailAndPassword(auth, email, password);
// }

// export async function logOut() {
//   return await signOut(auth);
// }
