import AuthForm from "../../components/common/AuthForm";

// import toast, { Toaster } from "react-hot-toast";

function DoctorAuthPage() {
  document.title = "Doctor Authentication";
  return (
    <>
      <AuthForm
        role="doctor"
        loginMessage="Welcome back, Doctor. Let’s make healthcare smarter."
        signUpMessage="You’re just 3 steps away from joining India’s next-gen health network."
      />
    </>
  );
}

export default DoctorAuthPage;
