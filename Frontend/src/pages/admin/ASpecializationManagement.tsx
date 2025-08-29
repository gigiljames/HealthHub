import React from "react";
import ASidebar from "../../components/admin/ASidebar";
import getIcon from "../../helpers/getIcon";

function ASpecializationManagement() {
  const specializations = [{ name: "", iconUrl: "" }];
  return (
    <>
      <div className="flex w-full">
        <ASidebar page="specialization-management" />
        <div className="flex-1">
          <div className="flex flex-col gap-2 p-2 h-screen">
            <div className="bg-darkGreen flex flex-col gap-3 w-full rounded-xl pt-2 pb-3 px-3">
              <div className="font-bold text-white">Add Specialization</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="p-2 bg-white rounded-md lg:w-80"
                  placeholder="Enter name of specialization"
                />
                <input type="file" />
                <button>Add</button>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-3 bg-darkGreen rounded-xl  pt-2 pb-3 px-3">
              <div className="font-bold text-white">Specializations</div>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="p-2 bg-white rounded-md lg:w-80"
                    placeholder="Search specializations"
                  />
                  <button className="flex gap-2 font-medium p-2 bg-black rounded-md">
                    {getIcon("search", "25px", "#363636")}
                  </button>
                </div>
                <button className="flex gap-2 font-medium mr-1 py-2 px-4 bg-lightGreen rounded-md ">
                  Sort
                  {getIcon("sort", "25px", "black")}
                </button>
              </div>
              <div className="flex-1 bg-white rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ASpecializationManagement;
