import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect } from "react";
import UProfileBasicInformation from "../../components/user/UProfileBasicInformation";
import UProfileContactInfo from "../../components/user/UProfileContactInfo";
import UProfileSurgery from "../../components/user/UProfileSurgery";
import UProfileIllness from "../../components/user/UProfileIllness";
import { getFullUserProfile } from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import {
  setName,
  setAllergies,
  setBloodGroup,
  setDob,
  setGender,
  setMaritalStatus,
  setOccupation,
  setAddress,
  setHeight,
  setPhoneNumber,
  setWeight,
  setBronchialAsthma,
  setEpilepsy,
  setTb,
  setSurgeries,
} from "../../state/user/uProfileCreationSlice";

function UProfilePage() {
  const dispatch = useDispatch();
  const name = useSelector((state: RootState) => state.userInfo.name);

  useEffect(() => {
    getFullUserProfile()
      .then((response) => {
        if (response?.data) {
          const data = response.data;
          dispatch(setName(data.name));
          dispatch(setAllergies(data.allergies));
          dispatch(setBloodGroup(data.bloodGroup));
          dispatch(setDob(data.dob));
          dispatch(setGender(data.gender));
          dispatch(setMaritalStatus(data.maritalStatus));
          dispatch(setOccupation(data.occupation));
          dispatch(setAddress(data.address));
          dispatch(setHeight(data.height));
          dispatch(setPhoneNumber(data.phoneNumber));
          dispatch(setWeight(data.weight));
          dispatch(setBronchialAsthma(data.bronchialAsthma));
          dispatch(setEpilepsy(data.epilepsy));
          dispatch(setTb(data.tb));
          dispatch(setSurgeries(data.surgeries));
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch user profile data.");
      });
  }, [dispatch]);

  if (name) {
    document.title = name + " | HealthHub";
  } else {
    document.title = "Profile";
  }

  return (
    <>
      <div className="bg-[#F5F7FA] dark:bg-gray-950 min-h-screen pt-[70px] transition-colors duration-300">
        <div className="flex justify-center w-full">
          <div className="w-full md:w-[80%] max-w-7xl py-0 md:py-6 px-4 md:px-0">
            <div className="mb-8 pl-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                My Health Profile
              </h1>
              <p className="text-lg mb-6 text-gray-500 dark:text-gray-100">
                Keep your personal and medical information up to date for better
                care
              </p>
            </div>

            <div className="flex flex-col w-full gap-6 pb-10">
              <UProfileBasicInformation />
              <UProfileContactInfo />
              <UProfileIllness />
              <UProfileSurgery />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UProfilePage;
