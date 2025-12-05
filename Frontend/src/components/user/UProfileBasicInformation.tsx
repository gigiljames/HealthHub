import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect } from "react";
import { getUserProfileStage1 } from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import {
  setAllergies,
  setBloodGroup,
  setDob,
  setGender,
  setMaritalStatus,
  setOccupation,
} from "../../state/user/uProfileCreationSlice";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import UBasicInfoModal from "./UBasicInfoModal";

interface basicInfo {
  name: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  maritalStatus: string;
  allergies: string[];
  occupation: string;
}

function UProfileBasicInformation() {
  const { editBasicInfoModal, toggleEditBasicInfoModal } =
    useUserProfileCreationStore();
  const dispatch = useDispatch();
  const name = useSelector((state: RootState) => state.uProfileCreation.name);
  const email = useSelector((state: RootState) => state.userInfo.email);
  const gender = useSelector(
    (state: RootState) => state.uProfileCreation.gender
  );
  const dob = useSelector((state: RootState) => state.uProfileCreation.dob);
  const bloodGroup = useSelector(
    (state: RootState) => state.uProfileCreation.bloodGroup
  );
  const maritalStatus = useSelector(
    (state: RootState) => state.uProfileCreation.maritalStatus
  );
  const allergies = useSelector(
    (state: RootState) => state.uProfileCreation.allergies
  );
  const occupation = useSelector(
    (state: RootState) => state.uProfileCreation.occupation
  );

  useEffect(() => {
    if (
      !name ||
      !gender ||
      !dob ||
      !bloodGroup ||
      !maritalStatus ||
      !occupation
    ) {
      getUserProfileStage1()
        .then((response) => {
          const data: basicInfo = response.data;
          dispatch(setAllergies(data.allergies));
          dispatch(setBloodGroup(data.bloodGroup));
          dispatch(setDob(data.dob));
          dispatch(setGender(data.gender));
          dispatch(setMaritalStatus(data.maritalStatus));
          dispatch(setOccupation(data.occupation));
        })
        .catch((err) => {
          console.log(err);
          toast.error("An error occured while fetching data.");
        });
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Edit Modal */}
      {editBasicInfoModal && <UBasicInfoModal />}
      <div className="space-y-4 bg-white p-12 pt-8 rounded-2xl border-1 border-gray-200">
        <div className="flex gap-3 items-center justify-between">
          <span className="uppercase font-semibold">Basic Information</span>
          <span
            onClick={toggleEditBasicInfoModal}
            className="font-medium text-darkGreen hover:text-green-600 hover:bg-green-200 transition-all duration-200 active:scale-85 cursor-pointer bg-green-200/70 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {getIcon("edit", "20px", "green-200")}
            Edit
          </span>
        </div>
        <div className="w-full flex justify-start p-7 pl-8">
          <img
            className="size-40 bg-gray-100 rounded-full"
            src="https://avatar.iran.liara.run/public"
            alt="Profile image"
          />
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2">
            <div>
              <p className="text-[14px] font-normal text-gray-500">Name</p>
              <p className="text-lg">{name}</p>
            </div>
            <div>
              <p className="text-[14px] text-gray-500">Registered email</p>
              <p className="text-lg">{email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div>
              <p className="text-[14px] text-gray-500">Gender</p>
              <p className="text-lg capitalize">{gender}</p>
            </div>
            <div>
              <p className="text-[14px] text-gray-500">Date of birth</p>
              <p className="text-lg">{dob}</p>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div>
              <p className="text-[14px] text-gray-500">Blood group</p>
              <p className="text-lg">{bloodGroup}</p>
            </div>
            <div>
              <p className="text-[14px] text-gray-500">Marital status</p>
              <p className="text-lg capitalize">{maritalStatus}</p>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div>
              <p className="text-[14px] text-gray-500">Allergies</p>
              <p className="text-lg">
                {allergies.length === 0 ? "None" : allergies.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-[14px] text-gray-500">Occupation</p>
              <p className="text-lg capitalize">{occupation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UProfileBasicInformation;
