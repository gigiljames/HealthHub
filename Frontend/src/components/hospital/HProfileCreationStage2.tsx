import { useState } from "react";
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
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    const stage2Data = {
      hospitalId: userInfo.id,
      email: contactEmail,
      phone,
      website,
      address,
      location,
    };
    //validation here
    setLoading(true);
    try {
      const data = await saveHospitalProfileStage2(stage2Data);
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
      <div className="flex flex-col">
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-7 pb-3">
          <ProfileCreationInput
            title="Phone"
            type="number"
            placeholder="Enter phone number"
            value={phone}
            changeState={function (phone) {
              dispatch(setPhone(phone as string));
            }}
          />
          <ProfileCreationInput
            title="Contact Email"
            placeholder="Enter contact email"
            value={contactEmail}
            changeState={function (email) {
              dispatch(setEmail(email as string));
            }}
          />
          <ProfileCreationInput
            title="Website"
            placeholder="Enter website link"
            value={website}
            changeState={function (link) {
              dispatch(setWebsite(link as string));
            }}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-1 w-full">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Location
            </p>
            <div className="bg-white w-full h-full"></div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Address
            </p>
            <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
              <textarea
                className="p-2  peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] h-[50px] bg-white min-h-30"
                placeholder="Enter Complete Address"
                value={address}
                onChange={(e) => dispatch(setAddress(e.target.value))}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]"
          onClick={handleBackClick}
        >
          Back
        </button>
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

export default HProfileCreationStage2;
