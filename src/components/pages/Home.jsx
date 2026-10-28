import Header from "../layouts/Header";

import ImageHowToUseGapPlus from "../../assets/How to use StarMeter.png";

import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/Router";

const Home = () => {
  const navigate = useNavigate();
  function AboutGapPlus(props) {
    return (
      <div>
        <div className="border min-h-screen">{props.children}</div>
      </div>
    );
  }

  function MainBanner(props) {
    return (
      <div className="m-1 h-175 p-10">
        <div className="flex justify-center">{props.children}</div>
      </div>
    );
  }

  function IntroSection(props) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-10">{props.children}</div>
      </div>
    );
  }

  function Headline() {
    return (
      <div className="flex justify-center font-supreme-regular font-bold text-9xl">
        <div>GAP Plus</div>
      </div>
    );
  }

  function SubHeadline() {
    return (
      <div className="font-thk2d-regular text-2xl font-semibold">
        <div>
          เลือกสมรรถนะที่ตรงกับตำแหน่งงาน ลงทะเบียนพัฒนาทักษะ
          และติดตามคะแนนของคุณได้ในที่เดียว
        </div>
      </div>
    );
  }

  function ImageDescription() {
    return (
      <div className="w-128">
        <img src={ImageHowToUseGapPlus} alt="ภาพแสดงวิธีการใช้งาน Gap Plus" />
      </div>
    );
  }

  function goToMyLearning() {
    navigate(ROUTES.MYLEARNING);
  }

  function IntroButton() {
    return (
      <div className="flex justify-center">
        <button
          onClick={goToMyLearning}
          className="w-90 h-20 rounded-xl text-white bg-black font-supreme-regular text-xl"
        >
          My Learning
        </button>
      </div>
    );
  }

  function IntroText(props) {
    return (
      <div className="">
        <div>{props.children}</div>
      </div>
    );
  }

  function ProblemSection(props) {
    return (
      <div>
        <div className="border h-100 m-1 p-20">{props.children}</div>
      </div>
    );
  }

  function ProblemHeadline(props) {
    return (
      <div className="flex justify-center items-center gap-3 h-20 ">{props.children}</div>
    );
  }

  function ProblemHeadlineText() {
    return (
      <div className="text-5xl font-supreme-regular font-semibold">
        We're here to help
      </div>
    );
  }

  function ProblemSubHeadlineText() {
    return (
      <div className=" font-thk2d-regular text-xl text-gray-600">
        Training Management Center: TMC
        พร้อมดูแลทุกท่านในการจัดทำแผนพัฒนาศักยภาพรายบุคคล ประจำปี 2026 <br/>
        หากท่านพบปัญหาหรือมีข้อสงสัยในกรณีดังต่อไปนี้
        สามารถติดต่อทีมงานของเราได้ทันที
      </div>
    );
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
          <IntroButton />
        </IntroSection>
        <ImageDescription></ImageDescription>
      </MainBanner>
      <ProblemSection>
        <ProblemHeadline>
          <ProblemHeadlineText />
          <ProblemSubHeadlineText />
        </ProblemHeadline>
      </ProblemSection>
    </AboutGapPlus>
    // <div>
    //   <Header />
    //   <p>
    //     Training Management Center: TMC
    //     พร้อมดูแลทุกท่านในการจัดทำแผนพัฒนาศักยภาพรายบุคคล (Individual
    //     Development Plan: IDP) ประจำปี 2026
    //     หากท่านพบปัญหาหรือมีข้อสงสัยในกรณีดังต่อไปนี้
    //     สามารถติดต่อทีมงานของเราได้ทันที: 1. ปัญหาการเข้าสู่ระบบ (Technical
    //     Assistance & Access) ไม่สามารถเข้าสู่ระบบ StarMeter ได้
    //     ระบบหมดเวลาเชื่อมต่อ (System Timeout)
    //     หรือเกิดข้อผิดพลาดขณะบันทึกข้อมูลเป้าหมาย หน้าแดชบอร์ด (Dashboard)
    //     แสดงผลไม่ถูกต้อง 2. สอบถามข้อมูลการตั้งเป้าหมายและการประเมินผลงาน
    //     (Performance & Goal Setting Inquiries)
    //     มีข้อสงสัยเกี่ยวกับขั้นตอนการส่งและการอนุมัติ IDP
    //     ต้องการคำแนะนำในการค้นหาหลักสูตรการเรียนรู้เพื่อแนบในแผนพัฒนาตนเอง 3.
    //     การแก้ไขข้อมูลส่วนตัวและข้อมูลในระบบ (Data & Profile Corrections)
    //     ข้อมูลในโปรไฟล์ส่วนตัวไม่ถูกต้อง เช่น ตำแหน่งงานไม่อัปเดต,
    //     แผนกไม่ถูกต้อง หรือผู้บังคับบัญชา (Reporting Manager) ไม่ถูกต้อง
    //     (เนื่องจากการระบุสายการรายงานที่ถูกต้องมีความสำคัญอย่างยิ่ง
    //     เพื่อให้ระบบส่ง IDP ไปยังผู้อนุมัติได้ถูกต้อง)
    //     ประวัติการฝึกอบรมหรือใบรับรอง (Certifications)
    //     ในอดีตสูญหายหรือไม่แสดงในโปรไฟล์ ช่องทางการติดต่อ (How to Reach Us)
    //     หากท่านพบปัญหาตามข้างต้น
    //     หรือมีข้อสงสัยทั่วไปเกี่ยวกับการเรียนรู้และการประเมินผลงานบนแพลตฟอร์ม
    //     สามารถส่งอีเมลถึงศูนย์บริหารการจัดการการฝึกอบรม (TMC) ได้ที่:
    //     taa_learning@airasia.com ข้อแนะนำสำหรับการติดต่อ:
    //     เพื่อความรวดเร็วในการประสานงานและแก้ไขปัญหา
    //     กรุณาระบุข้อมูลต่อไปนี้ในอีเมลของท่าน: ชื่อ-นามสกุล รหัสพนักงาน
    //     (Employee ID) รายละเอียดของปัญหาหรือข้อสงสัยโดยสังเขป
    //   </p>
    // </div>
  );
};

export default Home;
