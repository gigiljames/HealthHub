import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { login } from "../../api/auth/authService";
import { roles } from "../../constants/roles";
import { useDispatch } from "react-redux";
import { addToken } from "../../state/auth/tokenSlice";
import { useNavigate } from "react-router";

function ALoginPage() {
  document.title = "HealthHub Admin Login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailErrorRef = useRef<HTMLDivElement>(null);
  const passwordErrorRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  function removeErrors() {
    if (emailErrorRef.current) emailErrorRef.current.innerHTML = "";
    if (passwordErrorRef.current) passwordErrorRef.current.innerHTML = "";
  }
  function showError(
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) {
    if (ref.current) ref.current.innerHTML = message;
  }
  async function handleAdminLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    removeErrors();
    setLoading(true);
    let valid = true;
    if (!email) {
      valid = false;
      showError(emailErrorRef, "Enter your email.");
    } else if (!emailRegex.test(email)) {
      valid = false;
      showError(emailErrorRef, "Enter a valid email.");
    }
    if (!password) {
      valid = false;
      showError(passwordErrorRef, "Enter your password");
    }
    if (valid) {
      try {
        const data = await login(email, password, roles.ADMIN);
        if (data.success) {
          toast.success(data?.message || "Logged in successfully.");
          dispatch(
            addToken({ token: data.accessToken, role: data.userInfo?.role })
          );
          navigate("/admin/home");
        } else {
          toast.error(data?.message || "An error occured while loggin in.");
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "An error occured while loggin in."
        );
      }
      // save token
    }
    setLoading(false);
  }
  return (
    <>
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-darkGreen">
        <div className="bg-white p-10 rounded-lg ">
          <div className="flex flex-col justify-center items-center ">
            <img
              src="/Logo_with_text_black.png"
              alt="HealthHub Logo"
              className="mb-4 h-[60px]"
            />
            <h1 className="mb-5 lg:mb-7 text-3xl md:text-3xl font-bold">
              Admin Login
            </h1>
            <form
              className="flex flex-col  w-[250px] lg:w-[280px]"
              onSubmit={(e) => handleAdminLogin(e)}
            >
              <div className="flex flex-col relative w-full mb-1.5">
                <input
                  className="border-1 border-inputBorder p-3 rounded-xl peer w-full bg-white h-[50px]"
                  type="text"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                />
                <span className="absolute left-2.5 top-3.5 px-1 text-inputPlaceholder peer-focus:-translate-y-5.5 -translate-y-5.5 peer-placeholder-shown:-translate-y-0 bg-white transition-tranform duration-100 ease-out md:peer-placeholder-shown:text-[16px] md:peer-focus:text-sm peer-focus:text-[12px] peer-placeholder-shown:text-sm align-top text-sm rounded-md">
                  Email
                </span>
              </div>
              <div className="error-container" ref={emailErrorRef}></div>
              <div className="flex flex-col relative w-full mb-1.5">
                <input
                  className="border-1 border-inputBorder p-3 rounded-xl peer w-full bg-white h-[50px]"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                />
                <span className="absolute left-2.5 top-3.5 px-1 text-inputPlaceholder peer-focus:-translate-y-5.5 -translate-y-5.5 peer-placeholder-shown:-translate-y-0 bg-white transition-tranform duration-100 ease-out md:peer-placeholder-shown:text-[16px] md:peer-focus:text-sm peer-focus:text-[12px] peer-placeholder-shown:text-sm align-top text-sm rounded-md">
                  Password
                </span>
              </div>
              <div className="error-container" ref={passwordErrorRef}></div>
              <button className="w-full font-medium p-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer hover:text-white h-[50px] text-sm md:text-[16px]">
                {loading ? (
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-5 h-5 mr-2 text-white animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    ></path>
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ALoginPage;
