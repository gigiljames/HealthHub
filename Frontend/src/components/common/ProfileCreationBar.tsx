interface ProfileCreationBarProps {
  totalStages: number;
  stages: string[];
  currStage: number;
}

function ProfileCreationBar({
  totalStages,
  stages,
  currStage,
}: ProfileCreationBarProps) {
  return (
    <div className="w-full flex flex-col gap-2 mb-10 max-w-5xl">
      <div className="flex justify-between">
        <p className="text-lg lg:text-xl font-semibold">
          {stages[currStage - 1]}
        </p>
        <p className="text-sm lg:text-base text-gray-500">
          Step {currStage} of {totalStages}
          {" • "}
          <span className="font-semibold text-lg">
            {currStage === 1
              ? 5
              : Math.floor(((currStage - 1) / totalStages) * 100)}
            %
          </span>
        </p>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-lightGreen rounded-full transition-all duration-200"
          style={{
            width: `${currStage === 1 ? 5 : Math.floor(((currStage - 1) / totalStages) * 100)}%`,
          }}
        ></div>
      </div>
    </div>
  );
}

export default ProfileCreationBar;
