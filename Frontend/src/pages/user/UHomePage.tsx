import axios from "../../api/axios";
import UNavbar from "../../components/user/UNavbar";

function UHomePage() {
  document.title = "HealthHub Home";
  return (
    <>
      <UNavbar />
      <div>User Home Page</div>
      <button
        onClick={async () => {
          const response = await axios.get("/users");
          console.log(response);
        }}
      >
        Get
      </button>
    </>
  );
}

export default UHomePage;
