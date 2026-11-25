import { useState } from "react";

import GapPlusIcon from "../../assets/PaperPlaneGapPlus.png";

import { useSocialSignIn } from "../functions/hooks/useSocialSignIn";

const CONTACT_EMAIL = "taa_learning@airasia.com";

/* ------------------------------ page shell ------------------------------ */

function LoginPage(props) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {props.children}
    </div>
  );
}

/* ------------------------------ banner ------------------------------ */

function MainBanner(props) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 px-4 py-12 md:flex-row md:justify-between md:gap-12 md:py-24">
      {props.children}
    </div>
  );
}

function IntroSection(props) {
  return (
    <div className="flex flex-col items-center gap-8 text-center md:items-start md:text-left">
      {props.children}
    </div>
  );
}

function IntroText(props) {
  return <div className="flex flex-col gap-4">{props.children}</div>;
}

function Headline() {
  return (
    <h1 className="font-supreme-regular text-6xl font-bold text-aa-ink md:text-8xl">
      GAP <span className="text-aa-red">Plus</span>
    </h1>
  );
}
function SubHeadline() {
  return (
    <p className="font-notosanthai-regular max-w-md text-lg text-slate-600">
      เลือกสมรรถนะที่ตรงกับตำแหน่งงาน ลงทะเบียนพัฒนาทักษะ
      และติดตามคะแนนของคุณได้ในที่เดียว
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function LoginButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="font-supreme-regular flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-8 py-3 text-lg text-slate-900 hover:bg-slate-100 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
    >
      <GoogleIcon />
      {loading ? "กำลังเข้าสู่ระบบ..." : "Login by Google"}
    </button>
  );
}

function LoginError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="font-notosanthai-regular text-sm text-rose-700">
      {message}
    </p>
  );
}

function ImageDescription() {
  return (
    <div className="w-full max-w-2xl">
      <img
        className="w-full"
        src={GapPlusIcon}
        alt="ภาพแสดงวิธีการใช้งาน Gap Plus"
      />
    </div>
  );
}

/* ------------------------------ help ------------------------------ */

function HelpSection(props) {
  return (
    <div className="bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-4 py-12 md:flex-row md:py-16">
        {props.children}
      </div>
    </div>
  );
}

function HelpHeadline() {
  return (
    <div className="flex max-w-md flex-col gap-3">
      <h2 className="font-notosanthai-semibold text-xl text-white">
        พบปัญหาการเข้าสู่ระบบ?
      </h2>
      <p className="font-notosanthai-regular leading-relaxed text-slate-300">
        หากไม่สามารถเข้าสู่ระบบได้หรือหมดเวลาการเชื่อมต่อ
        สามารถส่งอีเมลถึงศูนย์บริหารการจัดการการฝึกอบรม (TMC) ได้ที่{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="break-all font-semibold text-white underline underline-offset-2 hover:text-aa-red"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    </div>
  );
}

function HelpSuggestion() {
  return (
    <div className="font-notosanthai-regular max-w-md rounded-lg border border-slate-700 p-5 text-slate-300">
      <p>กรุณาระบุข้อมูลต่อไปนี้ในอีเมลของท่าน</p>
      <ul className="mt-3 list-disc pl-5">
        <li>ชื่อ-นามสกุล</li>
        <li>รหัสพนักงาน (Employee ID)</li>
        <li>รายละเอียดของปัญหาหรือข้อสงสัยโดยสังเขป</li>
      </ul>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

const Login = () => {
  const { signIn } = useSocialSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");
    try {
      await signIn("google");
    } catch (err) {
      console.error(err);
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginPage>
      <MainBanner>
        <IntroSection>
          <IntroText>
            <Headline />
            <SubHeadline />
          </IntroText>
          <div className="flex flex-col items-center gap-3 md:items-start">
            <LoginButton onClick={handleGoogleSignIn} loading={loading} />
            <LoginError message={error} />
          </div>
        </IntroSection>
        <ImageDescription />
      </MainBanner>
      <HelpSection>
        <HelpHeadline />
        <HelpSuggestion />
      </HelpSection>
    </LoginPage>
  );
};

export default Login;
