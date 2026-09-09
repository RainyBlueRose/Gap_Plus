import { auth, googleAuthProvider } from "../../config/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export const handleSigninByGoogle = async () => {
  const result = await signInWithPopup(auth, googleAuthProvider);
  console.log("result", result);
  console.log("token", await result.user.getIdTokenResult());
};

export const handleSignout = async () => {
  signOut();
};
