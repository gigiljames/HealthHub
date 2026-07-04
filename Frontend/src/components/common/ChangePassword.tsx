import React, { useState } from "react";
import getIcon from "../../helpers/getIcon";
import { changePassword } from "../../api/auth/authService";
import toast from "react-hot-toast";
import LoadingCircle from "./LoadingCircle";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      hasError = true;
    }
    if (!newPassword) {
      setNewPasswordError("New password is required");
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      hasError = true;
    }

    if (hasError) return;

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("New password and confirm password do not match");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setNewPasswordError(
        "Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
      );
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (res?.success) {
      toast.success(res.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res?.message || "Failed to change password");
    }
  };

  const renderInput = (
    label: string,
    value: string,
    setValue: (val: string) => void,
    showPassword: boolean,
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>,
    error: string,
    setError: React.Dispatch<React.SetStateAction<string>>,
  ) => (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="**********************"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-gray-900 dark:text-white outline-none transition-all duration-200 pr-10 focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-transparent"
              : "border-gray-200 dark:border-gray-700 focus:ring-darkGreen focus:border-transparent"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none flex items-center justify-center h-full cursor-pointer"
        >
          {showPassword ? getIcon("eye", "18px") : getIcon("eye-off", "18px")}
        </button>
      </div>
      {error && (
        <span className="text-red-500 text-xs lg:text-sm font-semibold">
          {error}
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        Change Password
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xl">
        Update your security credentials to keep your account safe.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className=" w-full max-w-xl flex flex-col gap-4">
          <div className="">
            {renderInput(
              "Current Password",
              currentPassword,
              setCurrentPassword,
              showCurrentPassword,
              setShowCurrentPassword,
              currentPasswordError,
              setCurrentPasswordError,
            )}
          </div>
          <div className="">
            {renderInput(
              "New Password",
              newPassword,
              setNewPassword,
              showNewPassword,
              setShowNewPassword,
              newPasswordError,
              setNewPasswordError,
            )}
          </div>
          <div className="">
            {renderInput(
              "Confirm new Password",
              confirmPassword,
              setConfirmPassword,
              showConfirmPassword,
              setShowConfirmPassword,
              confirmPasswordError,
              setConfirmPasswordError,
            )}
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen font-medium border-1 border-lightGreen text-white rounded-lg disabled:opacity-50 flex items-center justify-center min-w-[140px] cursor-pointer"
          >
            {loading ? <LoadingCircle /> : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
