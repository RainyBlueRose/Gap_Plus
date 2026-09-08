import { auth, googleAuthProvider } from "../../config/firebase";
import { signInWithPopup } from "firebase/auth";

export const handleSigninByGoogle = async () => {
  const result = await signInWithPopup(auth, googleAuthProvider);
  console.log("result", result);
};
