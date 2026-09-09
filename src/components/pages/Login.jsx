import React from "react";
import { handleSignout } from "../functions/firebase/authService";
import { useSocialSignIn } from "../functions/hooks/useSocialSignIn";
import { useAuth } from "../functions/hooks/useAuth";

const Login = () => {
  const { signIn } = useSocialSignIn();
  const { signOut } = useAuth();

  return (
    <div>
      <div>
        <button
          onClick={() => {
            signIn("google");
          }}
        >
          Login by Google
        </button>
        <button
          onClick={() => {
            signOut();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Login;
