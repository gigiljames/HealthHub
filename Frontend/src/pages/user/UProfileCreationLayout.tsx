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
    (state) => state.surgeryModal,
  );
  const editSurgeryModal = useUserProfileCreationStore(
    (state) => state.editSurgeryModal,
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
      {surgeryModal && <USurgeryModal type="add" />}
      {editSurgeryModal && <USurgeryModal type="edit" />}
      <div className="min-h-screen overflow-y-auto bg-gray-100 pt-15 md:pt-27 flex flex-col items-center px-3 pb-10">
        <ProfileCreationBar
          totalStages={stages.length}
          stages={stages}
          currStage={stage}
        />
        <div className="w-full flex justify-center">
          {stageComponent(stage)}
        </div>
      </div>
    </>
  );
}

export default UProfileCreationLayout;
