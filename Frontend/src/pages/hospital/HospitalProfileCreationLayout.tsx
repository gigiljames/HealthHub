import { useState } from "react";
import HProfileCreationStage1 from "../../components/hospital/HProfileCreationStage1";
import HProfileCreationStage2 from "../../components/hospital/HProfileCreationStage2";
import HProfileCreationStage3 from "../../components/hospital/HProfileCreationStage3";
import HProfileCreationStage4 from "../../components/hospital/HProfileCreationStage4";
import ProfileCreationBar from "../../components/common/ProfileCreationBar";
import HProfileCreationStage5 from "../../components/hospital/HProfileCreationStage5";

function HospitalProfileCreationLayout() {
  const [stage, setStage] = useState<number>(1);
  document.title = `Profile Creation - Stage ${stage}`;
  const stages = [
    "Basic Information",
    "Contact Information",
    "Upload Documents",
    "Features",
    "Declaration",
  ];
  function stageComponent(stage: number) {
    switch (stage) {
      case 1:
        return <HProfileCreationStage1 changeStage={setStage} />;
      case 2:
        return <HProfileCreationStage2 changeStage={setStage} />;
      case 3:
        return <HProfileCreationStage3 changeStage={setStage} />;
      case 4:
        return <HProfileCreationStage4 changeStage={setStage} />;
      case 5:
        return <HProfileCreationStage5 changeStage={setStage} />;
      default:
        return <HProfileCreationStage1 changeStage={setStage} />;
    }
  }
  return (
    <div className="h-[100vh] w-[100vw] flex justify-center p-2 overflow-y-scroll">
      <div className="flex flex-col my-3">
        <div className="bg-darkGreen text-white p-7 rounded-t-3xl">
          <p className="font-bold text-2xl">
            First time here? Complete your profile to continue
          </p>
          <p className="font-medium">
            You’re just a few steps away from empowering your hospital with
            data, security, and speed.
          </p>
        </div>
        <div className="bg-[#EDEDED] rounded-b-3xl p-7">
          <ProfileCreationBar
            totalStages={stages.length}
            stages={stages}
            currStage={stage}
          />
          {stageComponent(stage)}
        </div>
      </div>
    </div>
  );
}

export default HospitalProfileCreationLayout;
