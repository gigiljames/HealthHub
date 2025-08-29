import AuthForm from "../../components/common/AuthForm";

function UserAuthPage() {
  return (
    <AuthForm
      role="user"
      loginMessage="Good to see you again! Let’s keep your health on track."
      signUpMessage="Track your medications, get reminders, and consult with ease."
    />
  );
}

export default UserAuthPage;
