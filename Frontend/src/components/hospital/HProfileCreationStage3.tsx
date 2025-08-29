import React from "react";
import HFeatureCard from "./HFeatureCard";
import { MdAddBox } from "react-icons/md";

function HProfileCreationStage3() {
  return (
    <>
      <div className="bg-darkGreen rounded-lg mt-5 p-3">
        <p className="font-bold text-white mb-1.5">Add Features</p>
        <div className="flex flex-col md:flex-row gap-3 mb-2.5">
          <input
            type="text"
            placeholder="Enter feature"
            className="border-1 border-inputBorder p-3 rounded-lg peer md:min-w-[200px] lg:min-w-[300px] bg-white h-[45px]"
          />

          <button className="rounded-lg px-6 bg-lightBlue flex justify-center items-center gap-2 h-[45px] hover:-translate-y-0.5 transition-all duration-200">
            <span className="font-bold">Add</span>
            <span>
              <MdAddBox size={"25px"} />
            </span>
          </button>
        </div>
        <div className="bg-white rounded-lg p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-2">
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
        </div>
      </div>
    </>
  );
}

export default HProfileCreationStage3;
