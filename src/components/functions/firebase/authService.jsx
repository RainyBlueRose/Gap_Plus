import { auth, googleAuthProvider } from "../../config/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

const provider = {
  google: googleAuthProvider,
};

export const signInWithProvider = (providerName) => {
  return signInWithPopup(auth, provider[providerName]);
};

export const handleSignout = async () => {
  signOut(auth);
};
