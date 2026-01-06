import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { getUserProfileStage2 } from "../../api/user/uProfileCreationService";
import {
  setAddress,
  setHeight,
  setPhoneNumber,
  setWeight,
} from "../../state/user/uProfileCreationSlice";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import UContactInfoModal from "./UContactInfoModal";

function UProfileContactInfo() {
  const { toggleEditContactInfoModal, editContactInfoModal } =
    useUserProfileCreationStore();
  const dispatch = useDispatch();
  const address = useSelector(
    (state: RootState) => state.uProfileCreation.address
  );
  const phone = useSelector(
    (state: RootState) => state.uProfileCreation.phoneNumber
  );
  const height = useSelector(
    (state: RootState) => state.uProfileCreation.height
  );
  const weight = useSelector(
    (state: RootState) => state.uProfileCreation.weight
  );

  useEffect(() => {
    if (!address || !phone || !height || !weight) {
      getUserProfileStage2()
        .then((response) => {
          const data = response.data;
          dispatch(setAddress(data.address));
          dispatch(setPhoneNumber(data.phoneNumber));
          dispatch(setHeight(data.height));
          dispatch(setWeight(data.weight));
        })
        .catch((err) => {
          console.log(err);
          toast.error("An error occured while fetching data.");
        });
    }
  }, []);

  return (
    <div className="space-y-4 bg-white p-12 pt-8 rounded-2xl border-1 border-gray-200">
      {editContactInfoModal && <UContactInfoModal />}
      <div className="flex gap-3 items-center justify-between">
        <span className="uppercase font-semibold">
          Contact Information & Body Metrics
        </span>
        <span className=" font-medium text-darkGreen hover:text-green-600 hover:bg-green-200 transition-all duration-200 active:scale-85 cursor-pointer bg-green-200/70 px-4 py-2 rounded-lg flex items-center gap-2" onClick={toggleEditContactInfoModal}>
          {getIcon("edit", "20px", "green-200")}
          Edit
        </span>
      </div>
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="font-semibold text-black/70 uppercase text-[14px]">
            Contact Information
          </p>
          <div className="grid grid-cols-2">
            <div>
              <p className="text-[14px] font-normal text-gray-500">Address</p>
              <p className="text-lg">{address}</p>
            </div>
            <div>
              <p className="text-[14px] text-gray-500">Phone</p>
              <p className="text-lg">{phone}</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-black/70 uppercase text-[14px]">
            Body Metrics
          </p>
          <div className="grid grid-cols-2">
            <div>
              <p className="text-[14px] font-normal text-gray-500">Height</p>
              <p className="text-lg">{height} cm</p>
            </div>
            <div>
              <p className="text-[14px] text-gray-500">Weight</p>
              <p className="text-lg">{weight} kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UProfileContactInfo;
