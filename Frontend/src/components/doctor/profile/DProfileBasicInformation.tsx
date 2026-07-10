import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import type { RootState } from "../../../state/store";
import getIcon from "../../../helpers/getIcon";
import DBasicInfoEditModal from "./DBasicInfoEditModal";
import { useState } from "react";

function DProfileBasicInformation() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { name, dob, gender, phone, address, specialization, about, medicalRegistrationNumber } =
    useSelector((state: RootState) => state.dProfileCreation);
  const email = useSelector((state: RootState) => state.userInfo.email);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm p-6"
    >
      {isEditModalOpen && (
        <DBasicInfoEditModal closeModal={() => setIsEditModalOpen(false)} />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {/* <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {getIcon("person", "16px")}
            </span> */}
            Basic Information
          </h2>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-lightGreen/10 hover:bg-lightGreen/20 text-darkGreen dark:text-lightGreen rounded-lg font-bold transition-all active:scale-95 border border-lightGreen/20 text-xs"
          >
            {getIcon("edit", "14px")}
            Edit Profile
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Full Name
              </p>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {name || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Email Address
              </p>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200 truncate">
                {email || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Contact Number
              </p>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {phone || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Gender
              </p>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200 capitalize">
                {gender || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Date of Birth
              </p>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {dob ? new Date(dob).toLocaleDateString() : "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Specialization
              </p>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-md capitalize">
                  {specialization || "General"}
                </span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Medical Registration Number
              </p>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {medicalRegistrationNumber || "Not provided"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              About / Professional Bio
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-gray-50 dark:bg-slate-800/40 p-3 rounded-lg border border-gray-100 dark:border-slate-800/50">
              {about ||
                "No professional bio added yet. Tell patients about your expertise and care philosophy."}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Office Address
            </p>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-lg border border-gray-100 dark:border-slate-800/50">
              <div className="flex gap-2 text-slate-700 dark:text-slate-200">
                <div className="mt-0.5 text-darkGreen dark:text-lightGreen">
                  {getIcon("location", "16px")}
                </div>
                <p className="text-sm font-medium leading-normal">
                  {address || "Office address not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DProfileBasicInformation;
