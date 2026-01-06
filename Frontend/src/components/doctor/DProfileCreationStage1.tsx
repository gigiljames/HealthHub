import React, { useEffect, useState, useRef } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import LoadingCircle from "../common/LoadingCircle";
import toast from "react-hot-toast";
import {
  getSpecializationList,
  saveDoctorProfileStage1,
  getDoctorProfileStage1,
} from "../../api/doctor/dProfileCreationService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setName,
  setDob,
  setGender,
  setPhone,
  setAddress,
  setSpecialization,
} from "../../state/doctor/dProfileCreationSlice";

interface DProfileCreationStage1Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage1({ changeStage }: DProfileCreationStage1Props) {
  const [loading, setLoading] = useState(false);
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const dispatch = useDispatch();

  const userInfo = useSelector((state: RootState) => state.userInfo);
  const { name, dob, gender, phone, address, specialization } = useSelector(
    (state: RootState) => state.dProfileCreation
  );

  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const dobErrorRef = useRef<HTMLDivElement | null>(null);
  const genderErrorRef = useRef<HTMLDivElement | null>(null);
  const phoneErrorRef = useRef<HTMLDivElement | null>(null);
  const addressErrorRef = useRef<HTMLDivElement | null>(null);
  const specializationErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getSpecializationList().then((response) => {
      if (response?.success) {
        setSpecializationList(response.data);
      }
    });

    getDoctorProfileStage1().then((response) => {
      if (response?.success && response.data) {
        const data = response.data;
        if (data.name) dispatch(setName(data.name));
        else dispatch(setName(userInfo.name));
        if (data.dob) dispatch(setDob(data.dob));
        if (data.gender) dispatch(setGender(data.gender));
        if (data.phone) dispatch(setPhone(data.phone));
        if (data.address) dispatch(setAddress(data.address));
        if (data.specialization)
          dispatch(setSpecialization(data.specialization));
      } else {
        dispatch(setName(userInfo.name));
      }
    });
  }, [dispatch, userInfo.name]);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      nameErrorRef,
      dobErrorRef,
      genderErrorRef,
      phoneErrorRef,
      addressErrorRef,
      specializationErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  async function handleNextClick() {
    // changeStage((prev) => prev + 1);
    removeErrors();
    let valid = true;

    if (!name || name.trim() === "") {
      valid = false;
      showError(nameErrorRef, "Enter your name.");
    }

    if (!dob) {
      valid = false;
      showError(dobErrorRef, "Enter your date of birth.");
    }

    if (!gender) {
      valid = false;
      showError(genderErrorRef, "Select your gender.");
    }

    if (!phone || phone.trim() === "") {
      valid = false;
      showError(phoneErrorRef, "Enter your phone number.");
    } else if (!/^\d{10}$/.test(phone)) {
      valid = false;
      showError(phoneErrorRef, "Enter a valid 10-digit phone number.");
    }

    if (!address || address.trim() === "") {
      valid = false;
      showError(addressErrorRef, "Enter your address.");
    }

    if (!specialization) {
      valid = false;
      showError(specializationErrorRef, "Select your specialization.");
    }

    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    const stage1Data = {
      userId: userInfo.id,
      name,
      dob,
      gender,
      phone,
      address,
      specialization,
    };

    setLoading(true);
    try {
      const data = await saveDoctorProfileStage1(stage1Data);
      setLoading(false);
      if (data?.success) {
        toast.success(data?.message || "Saved successfully.");
        changeStage((prev) => prev + 1);
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile."
      );
    }
  }

  return (
    <>
      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-7 pb-3 ">
        <div>
          <ProfileCreationInput
            title="Name"
            placeholder="Enter your name"
            value={name}
            changeState={(val) => dispatch(setName(val as string))}
          />
          <div className="error-container" ref={nameErrorRef}></div>
        </div>

        <ProfileCreationInput
          title="Registered email"
          disabled={true}
          value={userInfo.email || "example@gmail.com"}
        />

        <div className="flex flex-col gap-1">
          <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
            Specialization
          </p>
          <div
            className={`border-1 border-inputBorder px-3  rounded-lg peer md:min-w-[200px] lg:min-w-[400px] bg-white h-[50px]`}
          >
            <select
              className="w-full h-full capitalize text-sm md:text-[16px] outline-none bg-transparent"
              value={specialization}
              onChange={(e) => dispatch(setSpecialization(e.target.value))}
            >
              <option value="">Select Specialization</option>
              {specializationList.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>
          <div className="error-container" ref={specializationErrorRef}></div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Gender
            </p>
            <div
              className={`border-1 border-inputBorder px-3 rounded-lg peer md:min-w-[200px] lg:min-w-[400px] bg-white h-[50px]`}
            >
              <select
                className="w-full h-full capitalize text-sm md:text-[16px] outline-none bg-transparent"
                value={gender}
                onChange={(e) => dispatch(setGender(e.target.value))}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="error-container" ref={genderErrorRef}></div>
        </div>

        <div>
          <ProfileCreationInput
            title="Date of birth"
            type="date"
            value={dob}
            changeState={(val) => dispatch(setDob(val as string))}
          />
          <div className="error-container" ref={dobErrorRef}></div>
        </div>

        <div>
          <ProfileCreationInput
            title="Phone number"
            value={phone}
            type="number"
            placeholder="Enter your phone number"
            changeState={(val) => dispatch(setPhone(val as string))}
          />
          <div className="error-container" ref={phoneErrorRef}></div>
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Address
            </p>
            <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
              <textarea
                className="p-2 peer text-sm md:text-[16px] w-full bg-white min-h-[80px] outline-none resize-none"
                onChange={(e) => dispatch(setAddress(e.target.value))}
                value={address}
                placeholder="Enter your address"
              ></textarea>
            </div>
            <div className="error-container" ref={addressErrorRef}></div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className={`flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
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

export default DProfileCreationStage1;
