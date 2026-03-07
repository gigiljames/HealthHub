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
    <div className="flex flex-col relative w-full mb-4">
      <input
        className={`border-1 p-3 rounded-xl peer w-full bg-white h-[50px] pr-10 focus:outline-none ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-green-500"
        }`}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError("");
        }}
        placeholder=""
      />
      <span
        className={`absolute left-2.5 top-3.5 px-1 peer-focus:-translate-y-6 -translate-y-6 peer-placeholder-shown:-translate-y-0 bg-white transition-transform duration-100 ease-out md:peer-placeholder-shown:text-[16px] md:peer-focus:text-sm peer-focus:text-[12px] peer-placeholder-shown:text-sm align-top text-sm rounded-md pointer-events-none ${
          error ? "text-red-500" : "text-gray-500"
        }`}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        {showPassword
          ? getIcon("eye", "1.25rem")
          : getIcon("eye-off", "1.25rem")}
      </button>
      {error && <span className="text-red-500 text-xs mt-1 ml-1">{error}</span>}
    </div>
  );

  return (
    <div className="w-full bg-white border-1 border-gray-200 p-6 rounded-2xl flex flex-col gap-4">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 max-w-md w-full"
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
          "Confirm New Password",
          confirmPassword,
          setConfirmPassword,
          showConfirmPassword,
          setShowConfirmPassword,
          confirmPasswordError,
          setConfirmPasswordError,
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-darkGreen/80 text-white font-medium py-3 rounded-xl hover:bg-darkGreen/90 active:bg-darkGreen transition-colors disabled:opacity-50"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
