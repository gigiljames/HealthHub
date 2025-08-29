import { useState } from "react";
import ProfileCreationBar from "../../components/common/ProfileCreationBar";
import DProfileCreationStage1 from "../../components/doctor/DProfileCreationStage1";
import DProfileCreationStage2 from "../../components/doctor/DProfileCreationStage2";
import DProfileCreationStage3 from "../../components/doctor/DProfileCreationStage3";
import DProfileCreationStage4 from "../../components/doctor/DProfileCreationStage4";
import DProfileCreationStage5 from "../../components/doctor/DProfileCreationStage5";
import DProfileCreationButton from "../../components/doctor/DProfileCreationButton";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";
import DEducationModal from "../../components/doctor/DEducationModal";
import DExperienceModal from "../../components/doctor/DExperienceModal";

function DProfileCreationLayout() {
  const educationModal = useDoctorProfileCreationStore(
    (state) => state.educationModal
  );
  const experienceModal = useDoctorProfileCreationStore(
    (state) => state.experienceModal
  );
  const [stage, setStage] = useState<number>(1);
  const [loading] = useState<boolean>(false);
  document.title = `Profile Creation - Stage ${stage}`;
  const stages = [
    "Basic Information",
    "Declaration",
    "Education",
    "Experience",
    "Verification",
  ];
  let buttonTitle = "Next";
  function stageComponent(stage: number) {
    switch (stage) {
      case 1:
        return <DProfileCreationStage1 />;
      case 2:
        return <DProfileCreationStage2 />;
      case 3:
        return <DProfileCreationStage3 />;
      case 4:
        return <DProfileCreationStage4 />;
      case 5:
        buttonTitle = "Get Started";
        return <DProfileCreationStage5 />;
      default:
        return <DProfileCreationStage1 />;
    }
  }
  return (
    <>
      {experienceModal && <DExperienceModal />}
      {educationModal && <DEducationModal />}
      <div className="lg:h-[100vh] w-[100vw] flex justify-center items-center p-2">
        <div className="flex flex-col max-w-[95%] lg:max-w-[75%]">
          <div className="bg-darkGreen text-white p-7 rounded-t-3xl">
            <p className="font-bold text-2xl">
              First time here? Complete your profile to continue
            </p>
            <p className="font-medium">
              You’re just a few steps away from making your mark on the
              internet.
            </p>
          </div>
          <div className="bg-[#EDEDED] rounded-b-3xl p-7">
            <ProfileCreationBar
              totalStages={stages.length}
              stages={stages}
              currStage={stage}
            />
            {stageComponent(stage)}

            <div className="flex justify-end">
              <DProfileCreationButton
                loading={loading}
                title={buttonTitle}
                changeState={setStage}
                totalStages={stages.length}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DProfileCreationLayout;
