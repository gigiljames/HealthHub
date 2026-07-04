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
    (state: RootState) => state.uProfileCreation.maritalStatus,
  );
  const gender = useSelector(
    (state: RootState) => state.uProfileCreation.gender,
  );
  const dob = useSelector((state: RootState) => state.uProfileCreation.dob);
  const bloodGroup = useSelector(
    (state: RootState) => state.uProfileCreation.bloodGroup,
  );
  const allergies = useSelector(
    (state: RootState) => state.uProfileCreation.allergies,
  );
  const occupation = useSelector(
    (state: RootState) => state.uProfileCreation.occupation,
  );

  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const maritalStatusErrorRef = useRef<HTMLDivElement | null>(null);
  const genderErrorRef = useRef<HTMLDivElement | null>(null);
  const dobErrorRef = useRef<HTMLDivElement | null>(null);
  const bloodGroupErrorRef = useRef<HTMLDivElement | null>(null);
  const occupationErrorRef = useRef<HTMLDivElement | null>(null);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      nameErrorRef,
      maritalStatusErrorRef,
      genderErrorRef,
      dobErrorRef,
      bloodGroupErrorRef,
      occupationErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  useEffect(() => {
    dispatch(setName(userInfo.name));
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProfileStage1();
        const profileData = data.data;
        console.log(data);
        if (Object.keys(profileData).length > 0) {
          if (profileData.maritalStatus) dispatch(setMaritalStatus(profileData.maritalStatus));
          if (profileData.gender) dispatch(setGender(profileData.gender));
          if (profileData.bloodGroup) dispatch(setBloodGroup(profileData.bloodGroup));
          if (profileData.dob) {
            const date = new Date(profileData.dob);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            dispatch(setDob(`${year}-${month}-${day}`));
          }
          if (profileData.allergies) dispatch(setAllergies(profileData.allergies));
          if (profileData.occupation) dispatch(setOccupation(profileData.occupation));
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "An error occured while fetching data.",
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
    removeErrors();
    let valid = true;

    if (!name || name.trim() === "") {
      valid = false;
      showError(nameErrorRef, "Please enter your name.");
    } else if (!/^[A-Za-z\s]{2,50}$/.test(name)) {
      valid = false;
      showError(nameErrorRef, "Enter a valid name (2-50 characters).");
    }

    if (!maritalStatus) {
      valid = false;
      showError(maritalStatusErrorRef, "Select marital status.");
    }

    if (!gender) {
      valid = false;
      showError(genderErrorRef, "Select your gender.");
    }

    if (!dob) {
      valid = false;
      showError(dobErrorRef, "Select your date of birth.");
    } else {
      const birthDate = new Date(dob);
      const today = new Date();
      if (birthDate > today) {
        valid = false;
        showError(dobErrorRef, "Date of birth cannot be in the future.");
      }
    }

    if (!bloodGroup) {
      valid = false;
      showError(bloodGroupErrorRef, "Select your blood group.");
    }

    if (!occupation || occupation.trim() === "") {
      valid = false;
      showError(occupationErrorRef, "Enter your occupation.");
    }

    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    setLoading(true);
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
        (error as Error)?.message || "An error occured while saving profile.",
      );
    }
  }
  return (
    <div className="p-6 bg-white border-1 flex flex-col gap-4 border-gray-200 rounded-2xl w-full max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Basic Information</h1>
        <p className="text-gray-500 text-sm lg:text-base">
          Let's start with some personal details to set up your profile.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              value={name}
              onChange={(e) => dispatch(setName(e.target.value))}
            />
            <div className="text-red-500 text-sm" ref={nameErrorRef}></div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Registered email</label>
            <input
              type="text"
              disabled
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md bg-gray-50 text-gray-500"
              value={userInfo.email}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Marital status</label>
            <select
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              value={maritalStatus}
              onChange={(e) => dispatch(setMaritalStatus(e.target.value))}
            >
              <option value="">Select marital status</option>
              {maritalStatusOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div
              className="text-red-500 text-sm"
              ref={maritalStatusErrorRef}
            ></div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Gender</label>
            <select
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              value={gender}
              onChange={(e) => dispatch(setGender(e.target.value))}
            >
              <option value="">Select your gender</option>
              {genderOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="text-red-500 text-sm" ref={genderErrorRef}></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Date of birth</label>
            <input
              type="date"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              value={dob}
              onChange={(e) => dispatch(setDob(e.target.value))}
            />
            <div className="text-red-500 text-sm" ref={dobErrorRef}></div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Blood group</label>
            <select
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              value={bloodGroup}
              onChange={(e) => dispatch(setBloodGroup(e.target.value))}
            >
              <option value="">Select blood group</option>
              {bloodGroupOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div
              className="text-red-500 text-sm"
              ref={bloodGroupErrorRef}
            ></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full items-start">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Occupation</label>
            <input
              type="text"
              placeholder="Enter your occupation"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              value={occupation}
              onChange={(e) => dispatch(setOccupation(e.target.value))}
            />
            <div
              className="text-red-500 text-sm"
              ref={occupationErrorRef}
            ></div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-medium">Allergies</label>
            <div className="flex flex-col relative w-full mb-1.5 justify-center">
              <input
                className="no-spinners border-1 border-gray-300 p-2 pr-18 rounded-md w-full h-[50px]"
                ref={allergyRef}
                placeholder="Enter allergy"
              />
              <button
                className="absolute right-3 font-semibold text-lightGreen cursor-pointer px-2"
                onClick={handleAddAllergy}
              >
                ADD
              </button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {allergies.map((val, index) => (
                  <div
                    className="bg-lightGreen/10 text-darkGreen border-1 border-lightGreen/30 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                    key={index}
                  >
                    <span className="font-medium break-all">{val}</span>
                    <button
                      className="hover:bg-lightGreen/20 rounded-full p-1 transition-colors"
                      onClick={() => dispatch(removeAllergy(index))}
                    >
                      {getIcon("close", "14px", "currentColor")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-gray-200 mt-2"></div>
      <div className="flex justify-end items-center mt-2">
        <button
          className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-14 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen flex items-center gap-2 h-[50px]"
          onClick={handleNextClick}
          disabled={loading}
        >
          {loading && <LoadingCircle />}
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}

export default UProfileCreationStage1;
