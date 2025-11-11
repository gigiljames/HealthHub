import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { saveHospitalProfileStage5 } from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import LoadingCircle from "../common/LoadingCircle";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setAcceptedTerms,
  setSubmissionDate,
} from "../../state/hospital/hProfileCreationSlice";
import { setIsNewUser } from "../../state/auth/userInfoSlice";
import { useNavigate } from "react-router";

interface HProfileCreationStage5Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage5({ changeStage }: HProfileCreationStage5Props) {
  const acceptedTerms = useSelector(
    (state: RootState) => state.hProfileCreation.acceptedTerms
  );
  const submissionDate = useSelector(
    (state: RootState) => state.hProfileCreation.submissionDate
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  useEffect(() => {
    if (acceptedTerms) {
      dispatch(setSubmissionDate(new Date().toISOString()));
    }
  }, [acceptedTerms, dispatch]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
    setIsScrolledToEnd(isAtBottom);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAcceptedTerms(e.target.checked));
  };
  const [loading, setLoading] = useState(false);
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    const stage3Data = {
      hospitalId: userInfo.id,
      acceptedTerms,
      submissionDate,
    };
    // console.log(stage1Data);
    //validation here
    setLoading(true);
    // api service call here
    try {
      const data = await saveHospitalProfileStage5(stage3Data);
      setLoading(false);
      if (data.success) {
        toast.success(data?.message || "Saved successfully.");
      } else {
        throw new Error("An error occured while saving profile.");
      }
      dispatch(setIsNewUser(false));
      navigate("/hospital/home");
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while saving profile."
      );
    }
  }
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto bg-white rounded-lg p-6 space-y-6 my-3 text-[14px]"
      >
        <div
          onScroll={handleScroll}
          className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4 text-gray-700 leading-relaxed"
        >
          <h3 className="font-semibold mb-2">Declaration</h3>
          <p className="mb-4">
            I hereby declare that all the information, documents, and
            certificates provided are true and correct to the best of my
            knowledge. I understand that providing any false or misleading
            information may result in suspension or permanent removal of my
            hospital from the HealthHub platform.
          </p>

          <h3 className="font-semibold mb-2">Terms & Conditions</h3>
          <p className="mb-2">
            1. HealthHub reserves the right to verify all certificates and
            information submitted by the hospital.
          </p>
          <p className="mb-2">
            2. The hospital must ensure patient data privacy and comply with all
            applicable healthcare laws.
          </p>
          <p className="mb-2">
            3. HealthHub will not be liable for any incorrect data provided by
            the hospital.
          </p>
          <p className="mb-2">
            4. By completing this registration, the hospital agrees to the
            HealthHub terms of service and privacy policy.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptedTerms}
            onChange={handleCheckboxChange}
            disabled={!isScrolledToEnd && !acceptedTerms}
            className="w-5 h-5 text-lightGreen border-gray-300 rounded focus:ring-lightGreen disabled:opacity-50"
          />
          <label
            htmlFor="acceptTerms"
            className={`text-sm ${
              !isScrolledToEnd ? "text-gray-400" : "text-gray-800"
            }`}
          >
            I have read and agree to the above Declaration & Terms of Service.
          </label>
        </div>
      </motion.div>

      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]"
          onClick={handleBackClick}
        >
          Back
        </button>
        <motion.button
          disabled={!acceptedTerms}
          className={`flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl ${
            acceptedTerms ? "bg-darkGreen" : "bg-gray-400 cursor-not-allowed"
          } hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleNextClick}
        >
          {loading ? (
            <>
              <LoadingCircle />
              Loading...
            </>
          ) : (
            "Get Started"
          )}
        </motion.button>
      </div>
    </>
  );
}

export default HProfileCreationStage5;
