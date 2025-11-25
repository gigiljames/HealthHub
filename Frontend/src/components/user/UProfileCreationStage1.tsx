import ProfileCreationInput from "../common/ProfileCreationInput";
import {
  maritalStatusOptions,
  genderOptions,
  bloodGroupOptions,
} from "../../constants/inputOptions";
import { useEffect, useRef, useState } from "react";
import LoadingCircle from "../common/LoadingCircle";
import getIcon from "../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  addAllergy,
  removeAllergy,
  setAllergies,
  setBloodGroup,
  setDob,
  setGender,
  setMaritalStatus,
  setName,
  setOccupation,
} from "../../state/user/uProfileCreationSlice";
import {
  getUserProfileStage1,
  saveUserProfileStage1,
} from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";

interface UProfileCreationStage1Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function UProfileCreationStage1({ changeStage }: UProfileCreationStage1Props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const name = useSelector((state: RootState) => state.uProfileCreation.name);
  const maritalStatus = useSelector(
    (state: RootState) => state.uProfileCreation.maritalStatus
  );
  const gender = useSelector(
    (state: RootState) => state.uProfileCreation.gender
  );
  const dob = useSelector((state: RootState) => state.uProfileCreation.dob);
  const bloodGroup = useSelector(
    (state: RootState) => state.uProfileCreation.bloodGroup
  );
  const allergies = useSelector(
    (state: RootState) => state.uProfileCreation.allergies
  );
  const occupation = useSelector(
    (state: RootState) => state.uProfileCreation.occupation
  );

  useEffect(() => {
    dispatch(setName(userInfo.name));
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProfileStage1();
        const profileData = data.data;
        console.log(data);
        if (Object.keys(profileData).length > 0) {
          dispatch(setMaritalStatus(profileData.maritalStatus));
          dispatch(setGender(profileData.gender));
          dispatch(setDob(profileData.dob));
          dispatch(setAllergies(profileData.allergies));
          dispatch(setOccupation(profileData.occupation));
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "An error occured while fetching data."
        );
      }
    }
    fetchData();
  }, [dispatch]);

  const [loading, setLoading] = useState(false);
  const allergyRef = useRef<HTMLInputElement>(null);
  function handleAddAllergy() {
    if (allergyRef.current) {
      const allergy = allergyRef.current.value;
      if (allergy) {
        dispatch(addAllergy(allergy));
      }
      allergyRef.current.value = "";
    }
  }

  async function handleNextClick() {
    const stage1Data = {
      userId: userInfo.id,
      name,
      maritalStatus,
      gender,
      dob,
      bloodGroup,
      allergies,
      occupation,
    };
    // console.log(stage1Data);
    //validation here
    setLoading(true);
    // api service call here
    try {
      const data = await saveUserProfileStage1(stage1Data);
      setLoading(false);
      if (data.success) {
        toast.success(data?.message || "Saved successfully.");
      } else {
        throw new Error("An error occured while saving profile.");
      }
      changeStage((prev) => {
        return prev + 1;
      });
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while saving profile."
      );
    }
  }
  return (
    <>
      <div className="  mt-5 overflow-auto h-full">
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pb-3">
          <ProfileCreationInput
            title="Name"
            placeholder="Enter your name"
            type="text"
            value={name}
            changeState={function (name) {
              dispatch(setName(name as string));
            }}
          />
          <ProfileCreationInput
            title="Registered email"
            disabled={true}
            value={userInfo.email}
            type="text"
          />
          <ProfileCreationInput
            title="Marital status"
            select={true}
            options={maritalStatusOptions}
            placeholder="Select marital status"
            value={maritalStatus}
            changeState={function (maritalStatus) {
              dispatch(setMaritalStatus(maritalStatus as string));
            }}
          />
          <ProfileCreationInput
            title="Gender"
            select={true}
            options={genderOptions}
            placeholder="Select your gender"
            value={gender}
            changeState={function (gender) {
              dispatch(setGender(gender as string));
            }}
          />
          <ProfileCreationInput
            title="Date of birth"
            type="date"
            value={dob}
            changeState={function (date) {
              dispatch(setDob(date as string));
            }}
          />
          <ProfileCreationInput
            title="Blood group"
            select={true}
            options={bloodGroupOptions}
            value={bloodGroup}
            changeState={function (bloodGroup) {
              dispatch(setBloodGroup(bloodGroup as string));
            }}
          />
          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Allergies
            </p>
            <div className="flex flex-col relative w-full mb-1.5 items-center justify-center">
              <input
                className="no-spinners border-1 border-inputBorder p-3 pr-18 rounded-lg peer text-sm md:text-[16px] w-full md:min-w-[200px] lg:min-w-[400px] bg-white   h-[50px]"
                ref={allergyRef}
                placeholder="Enter allergy"
              />
              <button
                className="absolute right-5 font-semibold text-blue-400 cursor-pointer"
                onClick={handleAddAllergy}
              >
                ADD
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {allergies.map((val, index) => {
                return (
                  <div
                    className="bg-blue-300 p-1 pl-2 rounded-md flex justify-between items-center"
                    key={index}
                  >
                    <span className="font-medium break-all">{val}</span>
                    <span
                      className="p-0.5 hover:bg-white hover:scale-105 active:scale-95 rounded-sm h-fit"
                      onClick={() => dispatch(removeAllergy(index))}
                    >
                      {getIcon("close", "20px", "black")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <ProfileCreationInput
            title="Occupation"
            placeholder="Enter your occupation"
            value={occupation}
            changeState={function (bloodGroup) {
              dispatch(setOccupation(bloodGroup as string));
            }}
          />
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]"
          onClick={handleNextClick}
        >
          {loading ? (
            <>
              <LoadingCircle />
              Loading...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
}

export default UProfileCreationStage1;
