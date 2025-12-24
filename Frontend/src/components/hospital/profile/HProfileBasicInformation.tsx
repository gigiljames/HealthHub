import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import { getHospitalProfileStage1 } from "../../../api/hospital/hProfileCreationService";
import {
  setName,
  setType,
  setEstablishedYear,
  setAbout,
} from "../../../state/hospital/hProfileCreationSlice";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import HBasicInfoEditModal from "./HBasicInfoEditModal";

function HProfileBasicInformation() {
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { name, type, establishedYear, about } = useSelector(
    (state: RootState) => state.hProfileCreation
  );
  const email = useSelector((state: RootState) => state.userInfo.email);

  useEffect(() => {
    if (!name || !type || !establishedYear || !about) {
      getHospitalProfileStage1()
        .then((response) => {
          if (response?.success && response.data) {
            const data = response.data;
            if (data.name) dispatch(setName(data.name));
            if (data.type) dispatch(setType(data.type));
            if (data.establishedYear)
              dispatch(setEstablishedYear(data.establishedYear));
            if (data.about) dispatch(setAbout(data.about));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load profile data.");
        });
    }
  }, [dispatch, name, type, establishedYear, about]);

  return (
    <div className="flex flex-col gap-4">
      {isEditModalOpen && (
        <HBasicInfoEditModal closeModal={() => setIsEditModalOpen(false)} />
      )}

      <div className="space-y-4 bg-white p-12 pt-8 rounded-2xl border-1 border-gray-200">
        <div className="flex gap-3 items-center justify-between">
          <span className="uppercase font-semibold text-lg">
            Basic Information
          </span>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="font-medium text-darkGreen hover:text-green-600 hover:bg-green-200 transition-all duration-200 active:scale-95 cursor-pointer bg-green-200/70 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {getIcon("edit", "20px", "green-200")}
            Edit
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm font-medium text-gray-500">Hospital Name</p>
              <p className="text-lg font-medium text-gray-800">{name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Registered Email
              </p>
              <p className="text-lg font-medium text-gray-800">
                {email || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="text-lg font-medium text-gray-800 capitalize">
                {type || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Established Year
              </p>
              <p className="text-lg font-medium text-gray-800">
                {establishedYear || "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">About</p>
            <p className="text-lg font-medium text-gray-800">{about || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HProfileBasicInformation;
