import { useRef, useState } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import LoadingCircle from "../common/LoadingCircle";
import { saveHospitalProfileStage2 } from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import type { RootState } from "../../state/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setAddress,
  setEmail,
  setPhone,
  setWebsite,
} from "../../state/hospital/hProfileCreationSlice";

interface HProfileCreationStage2Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage2({ changeStage }: HProfileCreationStage2Props) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const contactEmail = useSelector(
    (state: RootState) => state.hProfileCreation.email
  );
  const phone = useSelector((state: RootState) => state.hProfileCreation.phone);
  const website = useSelector(
    (state: RootState) => state.hProfileCreation.website
  );
  const address = useSelector(
    (state: RootState) => state.hProfileCreation.address
  );
  const location = useSelector(
    (state: RootState) => state.hProfileCreation.location
  );
  const phoneErrorRef = useRef<HTMLDivElement | null>(null);
  const emailErrorRef = useRef<HTMLDivElement | null>(null);
  const websiteErrorRef = useRef<HTMLDivElement | null>(null);
  const addressErrorRef = useRef<HTMLDivElement | null>(null);
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneRegex = /^[0-9]{10,11}$/;
  const websiteRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    msg: string
  ) => {
    if (ref.current) ref.current.innerHTML = msg;
  };

  const clearErrors = () => {
    [phoneErrorRef, emailErrorRef, websiteErrorRef, addressErrorRef].forEach(
      (r) => r.current && (r.current.innerHTML = "")
    );
  };

  function handleBackClick() {
    changeStage((prev) => prev - 1);
  }

  async function handleNextClick() {
    clearErrors();
    let valid = true;
    if (!phone || phone.trim() === "") {
      valid = false;
      showError(phoneErrorRef, "Enter phone number.");
    } else if (!phoneRegex.test(phone)) {
      valid = false;
      showError(phoneErrorRef, "Enter a valid phone number.");
    }
    if (!contactEmail || contactEmail.trim() === "") {
      valid = false;
      showError(emailErrorRef, "Enter contact email.");
    } else if (!emailRegex.test(contactEmail)) {
      valid = false;
      showError(emailErrorRef, "Enter a valid email address.");
    }
    if (website && website.trim() !== "" && !websiteRegex.test(website)) {
      valid = false;
      showError(
        websiteErrorRef,
        "Enter a valid website URL (https://example.com)."
      );
    }
    if (!address || address.trim() === "") {
      valid = false;
      showError(addressErrorRef, "Enter the hospital address.");
    } else if (address.trim().length < 10) {
      valid = false;
      showError(addressErrorRef, "Address must be at least 10 characters.");
    }
    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    setLoading(true);
    const stage2Data = {
      hospitalId: userInfo.id,
      email: contactEmail,
      phone,
      website,
      address,
      location,
    };

    try {
      const data = await saveHospitalProfileStage2(stage2Data);
      setLoading(false);
      if (data.success) {
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
      <div className="flex flex-col">
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-7 pb-3">
          <div>
            <ProfileCreationInput
              title="Phone"
              type="number"
              placeholder="Enter phone number"
              value={phone}
              changeState={function (phone) {
                dispatch(setPhone(phone as string));
              }}
            />
            <div className="error-container" ref={phoneErrorRef}></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Contact Email"
              placeholder="Enter contact email"
              value={contactEmail}
              changeState={function (email) {
                dispatch(setEmail(email as string));
              }}
            />
            <div className="error-container" ref={emailErrorRef}></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Website"
              placeholder="Enter website link"
              value={website}
              changeState={function (link) {
                dispatch(setWebsite(link as string));
              }}
            />
            <div className="error-container" ref={websiteErrorRef}></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* <div className="flex flex-col gap-1 w-full">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Location
            </p>
            <div className="bg-white w-full h-full"></div>
          </div> */}

          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Address
            </p>
            <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
              <textarea
                className="p-2 peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] h-[50px] bg-white min-h-30"
                placeholder="Enter Complete Address"
                value={address}
                onChange={(e) => dispatch(setAddress(e.target.value))}
              ></textarea>
            </div>
            <div className="error-container" ref={addressErrorRef}></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-[50px]"
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-[50px]"
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

export default HProfileCreationStage2;
