import { useEffect, useRef, useState } from "react";
import {
  getDoctorProfileStage1,
  getSpecializationList,
  saveDoctorProfileStage1,
} from "../../../api/doctor/dProfileCreationService";
import { useDispatch, useSelector } from "react-redux";
import {
  setAbout,
  setAddress,
  setDob,
  setGender,
  setPhone,
  setSpecialization,
} from "../../../state/doctor/dProfileCreationSlice";
import toast from "react-hot-toast";
import type { RootState } from "../../../state/store";
import LoadingCircle from "../../common/LoadingCircle";
import { setOnboardingStep } from "../../../state/auth/userInfoSlice";

interface DOnboardingStep3Props {
  setStep: (step: number) => void;
}

function DOnboardingStep3({ setStep }: DOnboardingStep3Props) {
  const { dob, gender, phone, address, specialization, about } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dobErrorRef = useRef<HTMLDivElement | null>(null);
  const genderErrorRef = useRef<HTMLDivElement | null>(null);
  const phoneErrorRef = useRef<HTMLDivElement | null>(null);
  const addressErrorRef = useRef<HTMLDivElement | null>(null);
  const specializationErrorRef = useRef<HTMLDivElement | null>(null);
  const aboutErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getSpecializationList().then((response) => {
      if (response?.success) {
        setSpecializationList(response.specializations);
      }
    });
    getDoctorProfileStage1()
      .then((response) => {
        if (response?.success && response.data) {
          const data = response.data;
          if (data.dob) {
            const date = new Date(data.dob);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            dispatch(setDob(`${year}-${month}-${day}`));
          }
          if (data.gender) dispatch(setGender(data.gender));
          if (data.phone) dispatch(setPhone(data.phone));
          if (data.address) dispatch(setAddress(data.address));
          if (data.specialization)
            dispatch(setSpecialization(data.specialization));
          if (data.about) dispatch(setAbout(data.about));
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to fetch data");
      });
  }, []);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      dobErrorRef,
      genderErrorRef,
      phoneErrorRef,
      addressErrorRef,
      specializationErrorRef,
      aboutErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  const handleSave = async () => {
    removeErrors();
    let valid = true;

    if (!dob) {
      valid = false;
      showError(dobErrorRef, "Enter your date of birth.");
    }

    if (!gender || gender === "none") {
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

    const payload = {
      userId: userInfo.id,
      dob,
      gender,
      phone,
      address,
      specialization,
      about,
    };

    setLoading(true);
    try {
      const data = await saveDoctorProfileStage1(payload);
      if (data?.success) {
        toast.success("Onboarding step 3 completed successfully.");
        dispatch(setOnboardingStep(3));
        setStep(4);
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 bg-white border-1 flex flex-col gap-4 border-gray-200 rounded-2xl max-w-3xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            Tell patients a bit about yourself
          </h1>
          <p className="text-gray-500 text-sm lg:text-base">
            This information helps patients understand your expertise and find
            the right care.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="specialization" className="font-medium">
              Specialization
            </label>
            <select
              name="specialization"
              id="specialization"
              className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
              onChange={(e) => dispatch(setSpecialization(e.target.value))}
              value={specialization}
            >
              <option value="">Select Specialization</option>
              {specializationList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <div
              className="text-red-500 text-sm"
              ref={specializationErrorRef}
            ></div>
          </div>
          <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="gender" className="font-medium">
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
                onChange={(e) => dispatch(setGender(e.target.value))}
                value={gender}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="text-red-500 text-sm" ref={genderErrorRef}></div>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="dob" className="font-medium">
                Date of birth
              </label>
              <input
                type="date"
                id="dob"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
                onChange={(e) => dispatch(setDob(e.target.value))}
                value={dob}
              />
              <div className="text-red-500 text-sm" ref={dobErrorRef}></div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="gender" className="font-medium">
                Phone number
              </label>
              <input
                type="number"
                id="gender"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md no-spinners"
                onChange={(e) => dispatch(setPhone(e.target.value))}
                value={phone}
              />
              <div className="text-red-500 text-sm" ref={phoneErrorRef}></div>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="address" className="font-medium">
                Address
              </label>
              <input
                type="text"
                id="address"
                className="h-[50px] p-2 border-1 border-gray-300 rounded-md"
                onChange={(e) => dispatch(setAddress(e.target.value))}
                value={address}
              />
              <div className="text-red-500 text-sm" ref={addressErrorRef}></div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="about" className="font-medium">
              About Me
            </label>
            <textarea
              name=""
              id="about"
              className="min-h-[150px] border-1 border-gray-300 rounded-md p-2"
              onChange={(e) => dispatch(setAbout(e.target.value))}
              value={about}
            ></textarea>
            <div className="text-red-500 text-sm" ref={aboutErrorRef}></div>
            <p className="text-gray-500 text-sm lg:text-base mb-1">
              Briefly describe your medical background, specializations and
              philosophy of care.
            </p>
          </div>
        </div>
        <div className="h-[1px] bg-gray-200"></div>
        <div className="flex justify-between items-center mt-2">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={() => setStep(2)}
          >
            Back
          </p>

          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen flex items-center gap-2"
            onClick={() => handleSave()}
            disabled={loading}
          >
            {loading && <LoadingCircle />}
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep3;
