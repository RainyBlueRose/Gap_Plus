import Header from "../layouts/Header";

import GapPlusIcon from "../../assets/PaperPlaneGapPlus.png";

import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/Router";

const CONTACT_EMAIL = "taa_learning@airasia.com";

/* ------------------------------ page shell ------------------------------ */

function AboutGapPlus(props) {
  return <div className="min-h-screen bg-slate-50">{props.children}</div>;
}

/* ------------------------------ banner ------------------------------ */

function MainBanner(props) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-12 md:flex-row md:justify-between md:gap-12 md:py-20">
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

function IntroButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-supreme-regular rounded-lg bg-aa-red px-8 py-3 text-lg text-white hover:bg-aa-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
    >
      My Learning
    </button>
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

/* ------------------------------ problems ------------------------------ */

function ProblemSection(props) {
  return (
    <div className="border-y border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 md:py-20">
        {props.children}
      </div>
    </div>
  );
}

function ProblemHeadline(props) {
  return <div className="flex flex-col gap-3">{props.children}</div>;
}

function ProblemHeadlineText() {
  return (
    <h2 className="font-supreme-regular text-3xl font-semibold text-slate-900 md:text-4xl">
      We're here to help
    </h2>
  );
}

function ProblemSubHeadlineText() {
  return (
    <p className="font-notosanthai-regular max-w-3xl text-slate-600">
      Training Management Center: TMC
      พร้อมดูแลทุกท่านในการจัดทำแผนพัฒนาศักยภาพรายบุคคล ประจำปี 2026 <br />
      หากท่านพบปัญหาหรือมีข้อสงสัยในกรณีดังต่อไปนี้
      สามารถติดต่อทีมงานของเราได้ทันที
    </p>
  );
}

function ProblemSubject(props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {props.children}
    </div>
  );
}

function ProblemContainer({
  headlineNumber,
  headlineText,
  mainText,
  variant = "red",
}) {
  const colorStyle =
    variant === "red"
      ? "border-t-aa-red bg-aa-red-light/40"
      : "border-t-slate-200 bg-white";

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border border-slate-200 border-t-4 p-6 ${colorStyle}`}
    >
      <ProblemContainerHeadline
        headlineNumber={headlineNumber}
        headlineText={headlineText}
      />
      <ProblemContainerSeperateLine />
      <ProblemContainerMainText mainText={mainText} />
    </div>
  );
}

function ProblemContainerHeadline({ headlineNumber, headlineText }) {
  return (
    <div className="flex items-center gap-4">
      <ProblemContainerNumber headlineNumber={headlineNumber} />
      <ProblemContainerHeadlineText headlineText={headlineText} />
    </div>
  );
}

function ProblemContainerNumber({ headlineNumber }) {
  return (
    <div className="font-supreme-regular text-3xl text-slate-400">
      {headlineNumber}
    </div>
  );
}

function ProblemContainerHeadlineText({ headlineText }) {
  return (
    <div className="font-notosanthai-semibold text-xl text-slate-900">
      {headlineText}
    </div>
  );
}

function ProblemContainerSeperateLine() {
  return <div className="border-b border-slate-200" />;
}

function ProblemContainerMainText({ mainText }) {
  return (
    <div className="font-notosanthai-regular leading-relaxed text-slate-600">
      {mainText}
    </div>
  );
}

/* ------------------------------ contact ------------------------------ */

function ContactUsSection(props) {
  return (
    <div className="bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 px-4 py-14 md:flex-row md:py-20">
        {props.children}
      </div>
    </div>
  );
}

function ContactUsHeadline() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <ContactUsHeadlineText />
      <ContactUsSubHeadline />
    </div>
  );
}

function ContactUsHeadlineText() {
  return (
    <h2 className="font-supreme-regular text-2xl font-semibold text-white">
      CONTACT <span className="text-aa-red">US!</span>
    </h2>
  );
}

function ContactUsSubHeadline() {
  return (
    <p className="font-notosanthai-regular leading-relaxed text-slate-300">
      หากท่านพบปัญหาหรือมีข้อสงสัยทั่วไปเกี่ยวกับการเรียนรู้และการประเมินผลงานบนแพลตฟอร์ม
      สามารถส่งอีเมลถึงศูนย์บริหารการจัดการการฝึกอบรม (TMC) ได้ที่{" "}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="break-all font-semibold text-white underline underline-offset-2 hover:text-aa-red"
      >
        {CONTACT_EMAIL}
      </a>
    </p>
  );
}

function ContactUsSuggestion() {
  return (
    <div className="flex max-w-md flex-col gap-4 rounded-lg border border-slate-700 p-6">
      <ContactUsSuggestionHeadline />
      <ContactUsSuggestionSubHeadline />
    </div>
  );
}

function ContactUsSuggestionHeadline() {
  return (
    <h3 className="font-notosanthai-semibold text-lg text-white">
      ข้อแนะนำสำหรับการติดต่อ
    </h3>
  );
}

function ContactUsSuggestionSubHeadline() {
  return (
    <div className="font-notosanthai-regular text-slate-300">
      <p>
        เพื่อความรวดเร็วในการประสานงานและแก้ไขปัญหา
        กรุณาระบุข้อมูลต่อไปนี้ในอีเมลของท่าน
      </p>
      <ul className="mt-3 list-disc pl-5">
        <li>ชื่อ-นามสกุล</li>
        <li>รหัสพนักงาน (Employee ID)</li>
        <li>รายละเอียดของปัญหาหรือข้อสงสัยโดยสังเขป</li>
      </ul>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

const Home = () => {
  const navigate = useNavigate();

  function goToMyLearning() {
    navigate(ROUTES.MYLEARNING);
  }

  return (
    <AboutGapPlus>
      <Header />
      <MainBanner>
        <IntroSection>
          <IntroText>
            <Headline />
            <SubHeadline />
          </IntroText>
          <IntroButton onClick={goToMyLearning} />
        </IntroSection>
        <ImageDescription />
      </MainBanner>
      <ProblemSection>
        <ProblemHeadline>
          <ProblemHeadlineText />
          <ProblemSubHeadlineText />
        </ProblemHeadline>
        <ProblemSubject>
          <ProblemContainer
            variant="white"
            headlineNumber="01"
            headlineText="ปัญหาการเข้าสู่ระบบ"
            mainText={
              <>
                พบปัญหาที่เกี่ยวกับการเชื่อมต่อเข้าสู่ระบบ เช่น
                ไม่สามารถเข้าสู่ระบบได้หรือหมดเวลาการเชื่อมต่อ
              </>
            }
          />
          <ProblemContainer
            variant="red"
            headlineNumber="02"
            headlineText="สอบถามข้อมูลเพิ่มเติม"
            mainText={
              <>
                สอบถามข้อมูลเกี่ยวกับการตั้งเป้าหมายและการประเมินผลงาน
                มีข้อสงสัยเกี่ยวกับขั้นตอนการส่งและการอนุมัติ IDP
                ต้องการคำแนะนำในการค้นหาหลักสูตรการเรียนรู้เพื่อแนบในแผนพัฒนาตนเองหรืออื่นๆ
              </>
            }
          />
          <ProblemContainer
            variant="white"
            headlineNumber="02"
            headlineText="สอบถามข้อมูลเพิ่มเติม"
            mainText={
              <>
                ข้อมูลในโปรไฟล์ส่วนตัวไม่ถูกต้อง เช่น ตำแหน่งงานไม่อัปเดต,
                แผนกไม่ถูกต้องรายชื่อหัวหน้างาน (Manager) ไม่ถูกต้อง
                (เนื่องจากการระบุสายการรายงานที่ถูกต้องมีความสำคัญอย่างยิ่ง
                เพื่อให้ระบบส่ง IDP ไปยังผู้อนุมัติได้ถูกต้อง)
                ประวัติการฝึกอบรมหรือใบรับรอง (Certifications)
                ในอดีตสูญหายหรือไม่แสดงในโปรไฟล์
              </>
            }
          />
        </ProblemSubject>
      </ProblemSection>
      <ContactUsSection>
        <ContactUsHeadline />
        <ContactUsSuggestion />
      </ContactUsSection>
    </AboutGapPlus>
  );
};

export default Home;
