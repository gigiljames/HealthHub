import { useDispatch, useSelector } from "react-redux";
import {
  setSurgeries,
  type Surgery,
} from "../../state/user/uProfileCreationSlice";
import type { RootState } from "../../state/store";
import { useEffect } from "react";
import { getUserProfileStage4 } from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import USurgeryEditModal from "./USurgeryEditModal";

function UProfileSurgery() {
  const data: Surgery[] = [
    {
      year: "2022",
      surgeryName: "Appendectomy",
      reason: "Acute appendicitis",
      surgeryType: "major",
      doctor: "Dr. Smith",
      hospital: "City General Hospital",
    },
    {
      year: "2021",
      surgeryName: "Tonsillectomy",
      reason: "Recurrent tonsillitis",
      surgeryType: "minor",
      doctor: "Dr. Johnson",
      hospital: "Westside Medical",
    },
    {
      year: "2020",
      surgeryName: "Knee Arthroscopy",
      reason: "Torn meniscus",
      surgeryType: "major",
      doctor: "Dr. Lee",
      hospital: "Ortho Specialists",
    },
  ];
  const dispatch = useDispatch();
  const surgeries = useSelector(
    (state: RootState) => state.uProfileCreation.pastSurgeries
  );
  const { editSurgeryModal, toggleEditSurgeryModal } =
    useUserProfileCreationStore();

  useEffect(() => {
    if (surgeries.length === 0) {
      getUserProfileStage4()
        .then((response) => {
          const data: Surgery[] = response.data?.surgeries;
          dispatch(setSurgeries(data));
        })
        .catch((err) => {
          console.log(err);
          toast.error("An error occured while fetching data.");
        });
    }
  }, []);

  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No past surgeries recorded
      </div>
    );
  }

  return (
    <>
      {editSurgeryModal && <USurgeryEditModal />}
      <div className="space-y-4 bg-white p-12 pt-8 rounded-2xl border-1 border-gray-200">
        <div className="flex gap-3 items-center justify-between">
          <span className="uppercase font-semibold">Past Surgeries</span>
          <span
            onClick={toggleEditSurgeryModal}
            className=" font-medium text-darkGreen hover:text-green-600 hover:bg-green-200 transition-all duration-200 active:scale-85 cursor-pointer bg-green-200/70 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {getIcon("edit", "20px", "green-200")}
            Edit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surgery
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surgeries &&
                surgeries.map((surgery, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {surgery.year}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {surgery.surgeryName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {surgery.reason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      surgery.surgeryType === "major"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                      >
                        {surgery.surgeryType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {surgery.doctor}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {surgery.hospital}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UProfileSurgery;
