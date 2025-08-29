import { useState } from "react";
import ProfileCreationBar from "../../components/common/ProfileCreationBar";
import UProfileCreationStage1 from "../../components/user/UProfileCreationStage1";
import UProfileCreationStage2 from "../../components/user/UProfileCreationStage2";
import UProfileCreationStage3 from "../../components/user/UProfileCreationStage3";
import UProfileCreationStage4 from "../../components/user/UProfileCreationStage4";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import USurgeryModal from "../../components/user/USurgeryModal";

function UProfileCreationLayout() {
  const [stage, setStage] = useState<number>(1);
  const surgeryModal = useUserProfileCreationStore(
    (state) => state.surgeryModal
  );
  document.title = `Profile Creation - Stage ${stage}`;
  const stages = [
    "Basic Information",
    "Body metrics & Contact info",
    "Previous Illnesses",
    "Past Surgeries",
  ];
  function stageComponent(stage: number) {
    switch (stage) {
      case 1:
        return <UProfileCreationStage1 changeStage={setStage} />;
      case 2:
        return <UProfileCreationStage2 changeStage={setStage} />;
      case 3:
        return <UProfileCreationStage3 changeStage={setStage} />;
      case 4:
        return <UProfileCreationStage4 changeStage={setStage} />;
      default:
        return <UProfileCreationStage1 changeStage={setStage} />;
    }
  }
  return (
    <>
      {surgeryModal && <USurgeryModal />}
      <div className="lg:h-[100vh] w-[100vw] flex justify-center items-center px-3 md:px-4 py-5 ">
        <div className="flex flex-col w-full md:w-[90%] lg:w-[85%] xl:w-[65%] h-full ">
          <div className="bg-darkGreen text-white p-5 md:p-7 rounded-t-3xl">
            <p className="font-bold text-lg md:text-2xl">
              First time here? Complete your profile to continue
            </p>
            <p className="font-medium text-[12px] md:text-[16px]">
              Almost there! Let's get you set up for hassle-free healthcare.
            </p>
          </div>
          <div className="bg-[#EDEDED] rounded-b-3xl p-5 md:p-7 h-full flex flex-col justify-between">
            <ProfileCreationBar
              totalStages={stages.length}
              stages={stages}
              currStage={stage}
            />
            {stageComponent(stage)}
          </div>
        </div>
      </div>
    </>
  );
}

export default UProfileCreationLayout;
