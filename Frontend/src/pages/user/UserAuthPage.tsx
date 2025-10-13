import AuthForm from "../../components/common/AuthForm";
import { roles } from "../../constants/roles";

function UserAuthPage() {
  document.title = "HealthHub Login/Signup";
  return (
    <AuthForm
      role={roles.USER}
      loginMessage="Good to see you again! Let’s keep your health on track."
      signUpMessage="Track your medications, get reminders, and consult with ease."
    />
  );
}

export default UserAuthPage;
