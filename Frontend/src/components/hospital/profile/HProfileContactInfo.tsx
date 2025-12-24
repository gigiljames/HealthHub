import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import { getHospitalProfileStage2 } from "../../../api/hospital/hProfileCreationService";
import {
  setPhone,
  setEmail,
  setWebsite,
  setAddress,
  setLocation,
} from "../../../state/hospital/hProfileCreationSlice";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import HContactInfoEditModal from "./HContactInfoEditModal";

function HProfileContactInfo() {
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { phone, email, website, address } = useSelector(
    (state: RootState) => state.hProfileCreation
  );

  useEffect(() => {
    if (!phone || !email || !address) {
      getHospitalProfileStage2()
        .then((response) => {
          if (response?.success && response.data) {
            const data = response.data;
            if (data.phone) dispatch(setPhone(data.phone));
            if (data.email) dispatch(setEmail(data.email));
            if (data.website) dispatch(setWebsite(data.website));
            if (data.address) dispatch(setAddress(data.address));
            if (data.location) dispatch(setLocation(data.location));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load contact information.");
        });
    }
  }, [dispatch, phone, email, address]);

  return (
    <div className="flex flex-col gap-4">
      {isEditModalOpen && (
        <HContactInfoEditModal closeModal={() => setIsEditModalOpen(false)} />
      )}

      <div className="space-y-4 bg-white p-12 pt-8 rounded-2xl border-1 border-gray-200">
        <div className="flex gap-3 items-center justify-between">
          <span className="uppercase font-semibold text-lg">
            Contact Information
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
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-lg font-medium text-gray-800">
                {phone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Contact Email</p>
              <p className="text-lg font-medium text-gray-800">
                {email || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm font-medium text-gray-500">Website</p>
              <p className="text-lg font-medium text-gray-800">
                {website || "-"}
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

export default HProfileContactInfo;
