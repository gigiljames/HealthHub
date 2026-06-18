import { useState } from "react";
import toast from "react-hot-toast";
import { login } from "../../api/auth/authService";
import { roles } from "../../constants/roles";
import { useDispatch } from "react-redux";
import { addToken } from "../../state/auth/tokenSlice";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

function ALoginPage() {
  document.title = "HealthHub Admin Login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleAdminLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setLoading(true);

    let valid = true;
    if (!email) {
      valid = false;
      setEmailError("Enter your email.");
    } else if (!emailRegex.test(email)) {
      valid = false;
      setEmailError("Enter a valid email address.");
    }

    if (!password) {
      valid = false;
      setPasswordError("Enter your password.");
    }

    if (valid) {
      try {
        const data = await login(email, password, roles.ADMIN);
        if (data.success) {
          toast.success(data?.message || "Logged in successfully.");
          dispatch(
            addToken({ token: data.accessToken, role: data.userInfo?.role }),
          );
          navigate("/admin/home");
        } else {
          toast.error(data?.message || "An error occurred while logging in.");
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "An error occurred while logging in.",
        );
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 px-4 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl p-8 sm:p-10 text-center space-y-6"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center">
            <img
              src="/Logo_with_text_black.png"
              alt="HealthHub Logo"
              className="h-13 dark:invert"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Admin Login
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-455 font-medium">
              Enter credentials to access administrative dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          {/* Email Input */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email
            </label>
            <div className="relative w-full">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                className={`border rounded-xl pl-10 pr-3 py-3 w-full bg-slate-50 dark:bg-slate-800/50 text-sm md:text-base text-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-900 ${emailError
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                  }`}
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="Enter your email"
              />
            </div>
            {emailError && (
              <span className="text-red-500 text-xs font-semibold pl-1 mt-0.5">
                {emailError}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative w-full">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                className={`border rounded-xl pl-10 pr-10 py-3 w-full bg-slate-50 dark:bg-slate-800/50 text-sm md:text-base text-slate-955 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-900 ${passwordError
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                  }`}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordError && (
              <span className="text-red-500 text-xs font-semibold pl-1 mt-0.5">
                {passwordError}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3.5 mt-2 text-white rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900  active:scale-[0.99] transition-all duration-150 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-default"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              "Sign In to Admin"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ALoginPage;
