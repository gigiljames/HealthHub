import AuthForm from "../../components/common/AuthForm";

function HospitalAuthPage() {
  document.title = "Hospital Authentication";
  return (
    <>
      <AuthForm
        role="hospital"
        loginMessage="Welcome back. Let’s manage your hospital the smart way."
        signUpMessage="You’re just 3 steps away from smarter hospital management and effortless patient care."
      />
    </>
  );
}

export default HospitalAuthPage;
