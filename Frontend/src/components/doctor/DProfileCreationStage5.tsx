import ProfileCreationUpload from "../common/ProfileCreationUpload";

function DProfileCreationStage5() {
  return (
    <>
      <div className="flex flex-col md:flex-row w-full gap-3 mt-6 mb-3">
        <ProfileCreationUpload title="Upload your medical license" />
        <ProfileCreationUpload title="Upload your latest degree certificate" />
      </div>
    </>
  );
}

export default DProfileCreationStage5;
