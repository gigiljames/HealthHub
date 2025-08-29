import HDepartmentCard from "./HDepartmentCard";
import { MdAddBox } from "react-icons/md";

function HProfileCreationStage2() {
  return (
    <>
      <div className="bg-darkGreen rounded-lg mt-5 p-3">
        <p className="font-bold text-white mb-1.5">Add Departments</p>
        <div className="flex flex-col md:flex-row gap-3 mb-2.5">
          <input
            type="text"
            placeholder="Enter name of department"
            className="border-1 border-inputBorder p-3 rounded-lg peer md:min-w-[200px] lg:min-w-[300px] bg-white h-[45px]"
          />
          <div className="flex gap-3">
            <div className="flex justify-between border-1 border-inputBorder p-2 rounded-lg peer md:min-w-[200px] lg:min-w-[300px] bg-white h-[45px]">
              <label
                htmlFor="icon-input"
                className="bg-gray-200 text-[#999999] flex px-3 items-center rounded-sm text-sm font-medium hover:-translate-y-0.5 transition-all duration-200"
              >
                Click to choose icon
              </label>
              <input
                type="file"
                id="icon-input"
                className="max-w-[200px] hidden"
              />
              <span className="h-full w-7 bg-inputBorder rounded-sm text-center">
                i
              </span>
            </div>
            <button className="rounded-lg px-6 bg-lightBlue flex justify-center items-center gap-2 hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-bold ">Add</span>
              <span>
                <MdAddBox size={"25px"} />
              </span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-2">
          <HDepartmentCard title="Neurology" iconUrl="" />
          <HDepartmentCard title="Neurology" iconUrl="" />
          <HDepartmentCard title="Neurology" iconUrl="" />
          <HDepartmentCard title="Neurology" iconUrl="" />
          <HDepartmentCard title="Neurology" iconUrl="" />
          <HDepartmentCard title="Neurology" iconUrl="" />
          <HDepartmentCard title="Neurology" iconUrl="" />
          <HDepartmentCard title="Neurology" iconUrl="" />
        </div>
      </div>
    </>
  );
}

export default HProfileCreationStage2;
