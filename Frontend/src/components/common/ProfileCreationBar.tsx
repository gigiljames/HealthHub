import { useEffect, useRef, useState } from "react";
import { TiTick } from "react-icons/ti";

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
  const stepRefs = useRef<HTMLDivElement[]>([]);
  const [margins, setMargins] = useState({
    marginLeft: 0,
    marginRight: 0,
  });
  useEffect(() => {
    const mLeft = stepRefs.current[0].offsetWidth / 2;
    const mRight = stepRefs.current[totalStages - 1].offsetWidth / 2;
    setMargins({
      marginLeft: mLeft,
      marginRight: mRight,
    });
  }, [totalStages, stepRefs]);

  return (
    <div className=" bg-white flex px-3 md:px-7 py-6 rounded-lg ">
      <div className="relative flex justify-between w-full overflow-auto gap-2">
        {stages.map((stage, index) => {
          return (
            <div
              className="flex flex-col items-center gap-1 z-2 max-w-[150px]"
              ref={(el) => {
                if (el) stepRefs.current[index] = el;
              }}
              key={index}
            >
              <div
                className={`flex justify-center items-center size-6 rounded-full p-2 border-2  ${
                  index > currStage - 1
                    ? "border-inputBorder"
                    : "border-blue-400"
                }  ${index < currStage - 1 ? "bg-blue-400" : "bg-white"}  `}
              >
                <span className="size-4">
                  {index < currStage - 1 ? <TiTick color="white" /> : ""}
                </span>
              </div>
              <div className="text-center text-[10px] md:text-sm font-medium">
                {stage}
              </div>
            </div>
          );
        })}
        <div
          className={` h-1.5 bg-inputBg absolute top-[9px] `}
          style={{
            width: `calc(100% - ${margins.marginLeft + margins.marginRight}px)`,
            marginLeft: `${margins.marginLeft}px`,
          }}
        >
          <div
            className={`h-1.5 bg-blue-400`}
            style={{ width: `calc(${(currStage / totalStages) * 100}%)` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCreationBar;
