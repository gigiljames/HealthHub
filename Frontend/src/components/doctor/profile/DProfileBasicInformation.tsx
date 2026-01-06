import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import {
  getDoctorProfileStage1,
  getSpecializationList,
} from "../../../api/doctor/dProfileCreationService";
import {
  setName,
  setDob,
  setGender,
  setPhone,
  setAddress,
  setSpecialization,
} from "../../../state/doctor/dProfileCreationSlice";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import DBasicInfoEditModal from "./DBasicInfoEditModal";

function DProfileBasicInformation() {
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [specializationName, setSpecializationName] = useState("");

  const { name, dob, gender, phone, address, specialization } = useSelector(
    (state: RootState) => state.dProfileCreation
  );
  const email = useSelector((state: RootState) => state.userInfo.email);

  useEffect(() => {
    if (!name || !dob || !gender || !phone || !address || !specialization) {
      getDoctorProfileStage1()
        .then((response) => {
          if (response?.success && response.data) {
            const data = response.data;
            if (data.name) dispatch(setName(data.name));
            if (data.dob) dispatch(setDob(data.dob));
            if (data.gender) dispatch(setGender(data.gender));
            if (data.phone) dispatch(setPhone(data.phone));
            if (data.address) dispatch(setAddress(data.address));
            if (data.specialization)
              dispatch(setSpecialization(data.specialization));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load profile data.");
        });
    }
  }, [dispatch, name, dob, gender, phone, address, specialization]);

  useEffect(() => {
    if (specialization) {
      getSpecializationList().then((res) => {
        if (res?.success) {
          const spec = res.data.find((s: any) => s.id === specialization);
          if (spec) setSpecializationName(spec.name);
        }
      });
    }
  }, [specialization]);

  return (
    <div className="flex flex-col gap-4">
      {isEditModalOpen && (
        <DBasicInfoEditModal closeModal={() => setIsEditModalOpen(false)} />
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

        {/* <div className="w-full flex justify-start p-7 pl-8">
          <img
            className="size-40 bg-gray-100 rounded-full object-cover"
            src="https://avatar.iran.liara.run/public/job/doctor/male"
            alt="Doctor Profile"
          />
        </div> */}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
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
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-lg font-medium text-gray-800 capitalize">
                {gender || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-lg font-medium text-gray-800">
                {dob ? new Date(dob).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-lg font-medium text-gray-800">
                {phone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Specialization
              </p>
              <p className="text-lg font-medium text-gray-800 capitalize">
                {specializationName || "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-lg font-medium text-gray-800">
              {address || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DProfileBasicInformation;
