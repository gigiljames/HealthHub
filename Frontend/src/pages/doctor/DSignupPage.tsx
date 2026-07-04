import { useState } from "react";
import { motion } from "framer-motion";
import DGuestNavbar from "../../components/doctor/DGuestNavbar";
import AuthSignupForm from "../../components/common/AuthSignupForm";
import AuthOTP from "../../components/common/AuthOTP";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import toast from "react-hot-toast";
import { resendOtp, verifyOtp } from "../../api/auth/authService";
import { resetSignupState } from "../../state/auth/signupSlice";
import { useNavigate } from "react-router";

function DSignupPage() {
  document.title = "HealthHub Doctor Signup";
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  
  const password = useSelector((state: RootState) => state.signup.password);
  const name = useSelector((state: RootState) => state.signup.name);
  const email = useSelector((state: RootState) => state.signup.email);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleOtp(otp: string) {
    const data = await verifyOtp(name, email, password, "doctor", otp);
    if (data.success) {
       toast.success(data.message);
       setShowOtpModal(false);
       dispatch(resetSignupState());
       navigate("/doctor/login");
    } else {
       toast.error(data.message);
    }
  }

  async function handleResendOtp() {
    const data = await resendOtp(name, email, "doctor");
    if (data.success) {
      toast.success(data.message ?? "OTP resent successfully");
    } else {
      toast.error(data.message ?? "An error occured while resending OTP");
    }
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
      <DGuestNavbar />
      {showOtpModal && (
        <AuthOTP
          length={6}
          message="An OTP has been sent to your registered email address. Enter the OTP here."
          callback={handleOtp}
          bg={true}
          resendOtpCallback={handleResendOtp}
        />
      )}
      <div className="flex flex-row justify-center items-center pt-[70px] min-h-screen w-full pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] p-6 sm:p-8 md:p-10 bg-white dark:bg-gray-900 border-1 border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl mx-4 my-8"
        >
          <AuthSignupForm role="doctor" setShowOtpModal={setShowOtpModal} />
        </motion.div>
      </div>
    </div>
  );
}

export default DSignupPage;
