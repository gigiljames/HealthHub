import { useEffect, useState } from "react";
import ASidebar from "../../components/admin/ASidebar";
import getIcon from "../../helpers/getIcon";

function ADashboard() {
  document.title = "Admin Dashboard";
  const [userCount, setUserCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [hospitalCount, setHospitalCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // api call to get stats data here
    const stats = {
      userCount: 0,
      doctorCount: 0,
      hospitalCount: 0,
      appointmentCount: 0,
      totalRevenue: 0,
    };
    setUserCount(stats.userCount);
    setDoctorCount(stats.doctorCount);
    setHospitalCount(stats.hospitalCount);
    setAppointmentCount(stats.appointmentCount);
    setTotalRevenue(stats.totalRevenue);
  }, []);
  return (
    <>
      <div className="flex w-full">
        <ASidebar page="" />
        <div className="p-2 flex-1">
          <div className="flex flex-col bg-darkGreen p-3 rounded-xl gap-2">
            <div className="flex justify-between">
              <h3 className="font-bold text-white flex items-center">Stats</h3>
              <div>
                <button className="flex gap-1 bg-green-300 px-2 py-1 rounded-md font-semibold hover:bg-green-400 active:bg-green-600 transition-all duration-200">
                  <span>Refresh now</span>
                  {getIcon("refresh", "24px", "black")}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-lightGreen rounded-lg p-3 min-w-[150px]">
                <p className="text-center text-sm font-medium mb-1">
                  Total Users
                </p>
                <p className="text-center text-3xl font-bold">{userCount}</p>
              </div>
              <div className="bg-lightGreen rounded-lg p-3 min-w-[150px]">
                <p className="text-center text-sm font-medium mb-1">
                  Total Doctors
                </p>
                <p className="text-center text-3xl font-bold">{doctorCount}</p>
              </div>
              <div className="bg-lightGreen rounded-lg p-3 min-w-[150px]">
                <p className="text-center text-sm font-medium mb-1">
                  Total Hospitals
                </p>
                <p className="text-center text-3xl font-bold">
                  {hospitalCount}
                </p>
              </div>
              <div className="bg-lightGreen rounded-lg p-3 min-w-[150px]">
                <p className="text-center text-sm font-medium mb-1">
                  Total Appointments
                </p>
                <p className="text-center text-3xl font-bold">
                  {appointmentCount}
                </p>
              </div>
              <div className="bg-lightGreen rounded-lg p-3 min-w-[150px]">
                <p className="text-center text-sm font-medium mb-1">
                  Total Revenue
                </p>
                <p className="text-center text-3xl font-bold">{totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ADashboard;
