import React, { useState } from "react";
import getIcon from "../../helpers/getIcon";
import { changePassword } from "../../api/auth/authService";
import toast from "react-hot-toast";

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
    <div className="flex flex-col relative w-full mb-3">
      <input
        className={`border p-2.5 rounded-xl peer w-full bg-white dark:bg-slate-800 h-[42px] pr-10 focus:outline-none text-sm dark:text-white ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-200 dark:border-slate-700 focus:border-darkGreen dark:focus:border-emerald-500"
        }`}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError("");
        }}
        placeholder=" "
      />
      <span
        className={`absolute left-2.5 top-2.5 px-1 peer-focus:-translate-y-5.5 -translate-y-5.5 peer-placeholder-shown:-translate-y-0 bg-white dark:bg-slate-800 transition-transform duration-100 ease-out text-[11px] font-bold uppercase tracking-wider pointer-events-none ${
          error
            ? "text-red-500"
            : "text-slate-400 peer-focus:text-darkGreen dark:peer-focus:text-emerald-500"
        }`}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
      >
        {showPassword ? getIcon("eye", "16px") : getIcon("eye-off", "16px")}
      </button>
      {error && (
        <span className="text-red-500 text-[10px] font-bold mt-1 ml-1">
          {error}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 p-5 rounded-xl flex flex-col gap-4">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        {getIcon("lock", "16px")}
        Update Security Credentials
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-1 max-w-md w-full"
      >
        {renderInput(
          "Current Password",
          currentPassword,
          setCurrentPassword,
          showCurrentPassword,
          setShowCurrentPassword,
          currentPasswordError,
          setCurrentPasswordError,
        )}
        <div className="flex flex-col md:flex-row gap-3">
          {renderInput(
            "New Password",
            newPassword,
            setNewPassword,
            showNewPassword,
            setShowNewPassword,
            newPasswordError,
            setNewPasswordError,
          )}
          {renderInput(
            "Confirm Password",
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            setShowConfirmPassword,
            confirmPasswordError,
            setConfirmPasswordError,
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 bg-darkGreen dark:bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 text-xs shadow-md shadow-darkGreen/10"
        >
          {loading ? "Processing..." : "Securely Update Password"}
        </button>
      </form>
    </div>
  );
}
