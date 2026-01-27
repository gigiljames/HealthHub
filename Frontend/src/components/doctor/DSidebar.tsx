import { Link } from "react-router";

function DSidebar() {
  return (
    <>
      <div className="w-[300px] rounded-xl h-full bg-gray-400 border-1 border-slate-200 p-2">
        <div className="w-full h-[70px] bg-white rounded-lg mb-3 flex flex-col gap-1 justify-center items-center">
          <p className="text-sm text-center">
            You have no upcoming apopintments
          </p>
          {/* <p className="text-sm">Your next appointment is in</p>
          <p className="text-lg font-bold">15 minutes</p> */}
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to="/doctor/home"
            className="bg-white flex gap-2 p-2 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/doctor/profile"
            className="bg-white flex gap-2 p-2 rounded-lg"
          >
            Profile
          </Link>
          <Link
            to="/doctor/slots"
            className="bg-white flex gap-2 p-2 rounded-lg"
          >
            Slots
          </Link>
          <Link to="" className="bg-white flex gap-2 p-2 rounded-lg">
            Wallet & Transactions
          </Link>
          <Link to="" className="bg-white flex gap-2 p-2 rounded-lg">
            Practice Settings
          </Link>
          <Link to="" className="bg-white flex gap-2 p-2 rounded-lg">
            Past Consultations
          </Link>
        </div>
      </div>
    </>
  );
}

export default DSidebar;
