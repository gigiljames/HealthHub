import { motion } from "framer-motion";
import UGuestNavbar from "../../components/user/UGuestNavbar";
import AuthLoginForm from "../../components/common/AuthLoginForm";

function ULoginPage() {
  document.title = "HealthHub Login";
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
      <UGuestNavbar />
      <div className="flex flex-row justify-center items-center pt-[70px] min-h-screen w-full pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] p-6 sm:p-8 md:p-10 bg-white dark:bg-gray-900 border-1 border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl mx-4 my-8"
        >
          <AuthLoginForm role="user" />
        </motion.div>
      </div>
    </div>
  );
}

export default ULoginPage;
