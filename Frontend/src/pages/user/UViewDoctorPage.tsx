import UNavbar from "../../components/user/UNavbar";
import UGuestNavbar from "../../components/user/UGuestNavbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import getIcon from "../../helpers/getIcon";
import { useEffect, useState } from "react";
import DraggableMarkerMap from "../../components/common/DraggableMarkerMap";
import { months } from "../../constants/dateAndTime";

function UViewDoctorPage() {
  const doctor = {
    doctorId: "64f0c9a8e4b0a1d234567890",
    name: "Dr. John Doe",
    profileImageUrl: "https://cdn.healthapp.com/doctors/profile/dr-john.jpg",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1580281657527-47f249e8f6a9",
    dob: "1988-06-15T00:00:00.000Z",
    gender: "male",
    phone: "+91-9876543210",
    consultationFee: 900,
    nextAvailableDate: "2026-01-20, 1:00 PM",
    consultationModes: ["call", "chat", "video"],
    languages: [
      "English",
      "Hindi",
      "Punjabi",
      "English",
      "Hindi",
      "Punjabi",
      "English",
    ],
    about:
      "Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare. Experienced general physician with a strong focus on preventive and primary healthcare.",
    education: [
      {
        title: "MBBS",
        institution: "AIIMS Delhi",
        graduationYear: 2012,
        description:
          "Completed undergraduate medical education with clinical training across multiple departments.",
      },
      {
        title: "MD (General Medicine)",
        institution: "CMC Vellore",
        graduationYear: 2016,
        description:
          "Postgraduate specialization in internal medicine with emphasis on chronic disease management.",
      },
    ],

    experience: [
      {
        designation: "Resident Doctor",
        hospital: "Apollo Hospitals",
        description:
          "Worked as a resident physician handling inpatient and outpatient care.",
        location: "Kochi, Kerala",
        present: false,
        startDate: {
          month: 7,
          year: 2016,
        },
        endDate: {
          month: 6,
          year: 2019,
        },
        type: "hospital",
      },
      {
        designation: "Consultant Physician",
        hospital: "Independent Practice",
        description:
          "Providing outpatient consultation and preventive healthcare services.",
        location: "Kochi, Kerala",
        present: true,
        startDate: {
          month: 7,
          year: 2019,
        },
        type: "independent",
      },
    ],

    availability: [
      {
        date: 12,
        day: "Mon",
        isLeave: false,
        slots: [
          {
            slotId: "65abc111e4b0a1d234567001",
            startTime: "2026-01-16T04:30:00.000Z",
          },
          {
            slotId: "65abc222e4b0a1d234567002",
            startTime: "2026-01-16T05:00:00.000Z",
          },
          {
            slotId: "65abc333e4b0a1d234567003",
            startTime: "2026-01-16T05:30:00.000Z",
          },
        ],
      },
      {
        date: 13,
        day: "Tue",
        isLeave: true,
        slots: [],
      },
      {
        date: 14,
        day: "Wed",
        isLeave: false,
        slots: [
          {
            slotId: "65abc444e4b0a1d234567004",
            startTime: "2026-01-18T04:30:00.000Z",
          },
        ],
      },
      {
        date: 15,
        day: "Thu",
        isLeave: false,
        slots: [
          {
            slotId: "65abc444e4b0a1d2345dsfds67004",
            startTime: "2026-01-18T04:30:00.000Z",
          },
        ],
      },
    ],

    location: {
      type: "Point",
      coordinates: [76.2673, 9.9312],
      address: "Apollo Clinic, MG Road, Kochi",
      placeId: "ChIJq9kK3YxZpzsR5X3Y1nG5KX8",
    },
    specialization: "General Medicine",
  };

  const token = useSelector((state: RootState) => state.token.token);
  const role = useSelector((state: RootState) => state.token.role);
  const [consultationMode, setConsultationMode] = useState("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [slotList, setSlotList] = useState<
    { slotId: string; startTime: string }[]
  >([]);
  const [viewAboutButton, setViewAboutButton] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const modeNames = {
    call: "Audio Call",
    chat: "Chat",
    video: "Video Call",
    "in-person": "Clinic Visit",
  };

  useEffect(() => {
    setViewAboutButton(doctor.about.length > 100);
  }, []);

  function handleDateSelect(date: number) {
    setSelectedDate(date);
    setSlotList(
      doctor.availability.find((item) => item.date === date)?.slots || [],
    );
  }

  return (
    <>
      <div className="w-full h-screen overflow-y-auto bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
        {token && role ? <UNavbar /> : <UGuestNavbar />}
        <div className="w-full h-full flex flex-col lg:px-30 xl:px-40 2xl:px-[15%] pt-12 lg:pt-18 pb-20">
          {/* Images */}
          <div className="w-full relative h-fit pt-4">
            <img
              className="w-full h-56 object-cover bg-slate-200 rounded-xl"
              src={doctor.bannerImageUrl}
              alt=""
            />
            <img
              className="w-44 h-44 object-cover bg-slate-300 rounded-full absolute -bottom-12 left-8"
              src={doctor.profileImageUrl}
              alt=""
            />
          </div>
          {/* Primary Info */}
          <div className="w-full pt-16 p-3 flex gap-3">
            <div className="w-1/2">
              <h1 className="text-2xl font-semibold">{doctor.name}</h1>
              <p className="text-lg font-medium">{doctor.specialization}</p>
              <p className="text-md font-medium">{doctor.location.address}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 items-end justify-around">
              <div className="flex gap-2 items-center">
                <span className="font-medium">Contact number: </span>
                <span>{doctor.phone}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-medium">Languages: </span>
                <div className="">{doctor.languages.join(", ")}</div>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-3 pt-3">
            <div className="w-2/3 flex flex-col gap-3 p-3 pt-0">
              <div className="flex flex-col gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                <h3 className="text-lg font-semibold">About</h3>
                <p
                  className={`text-sm font-medium ${viewAboutButton ? "line-clamp-4" : ""}`}
                >
                  {doctor.about}
                </p>
                <button
                  className="text-darkGreen/70 hover:text-darkGreen font-medium hover:underline"
                  onClick={() => setViewAboutButton(!viewAboutButton)}
                >
                  {viewAboutButton ? "Show More" : "Show Less"}
                </button>
              </div>
              <div className="w-full flex gap-3">
                <div className="flex flex-col w-1/2 gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                  <h3 className="text-lg font-semibold">Education</h3>
                  {doctor.education.map((edu, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 p-2 border-1 border-inputBorder rounded-lg"
                    >
                      <p className=" font-semibold">{edu.institution}</p>
                      <p className="text-sm font-medium">{edu.title}</p>
                      <p className="text-sm font-medium text-gray-600">
                        Graduation year - {edu.graduationYear}
                      </p>
                      <p className="text-sm text-gray-500 ">
                        {edu.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col w-1/2 gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                  <h3 className="text-lg font-semibold">Experience</h3>
                  {doctor.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 p-2 border-1 border-inputBorder rounded-lg"
                    >
                      <p className="font-semibold">{exp.designation}</p>
                      <p className="text-sm font-medium">
                        {exp.hospital} • {exp.location}
                      </p>
                      <p className="text-sm font-medium">
                        {months[exp.startDate.month]} {exp.startDate.year} -{" "}
                        {exp.present ? "Present" : months[exp.endDate!.month]}{" "}
                        {exp.endDate?.year}
                      </p>
                      <p className="text-sm text-gray-500">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col w-full gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                <h3 className="text-lg font-semibold">Location on map</h3>
                <div>
                  <DraggableMarkerMap
                    initialLatLong={{
                      lng: doctor.location.coordinates[0],
                      lat: doctor.location.coordinates[1],
                    }}
                    height={"400px"}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                <h3 className="text-lg font-semibold">Rating & Reviews</h3>
              </div>
            </div>
            {/* Appointment */}
            <div className="w-1/3 border-1 border-inputBorder rounded-xl p-4 bg-white dark:bg-gray-900 flex flex-col gap-4 sticky top-20 h-fit">
              <h2 className="text-xl font-bold">Book An Appointment</h2>
              <div className="flex flex-col gap-2">
                <p className="font-semibold">Consultation mode</p>
                <div className="grid grid-cols-4 gap-2">
                  {doctor.consultationModes.map((mode, index) => (
                    <div
                      key={index}
                      className={`flex flex-col justify-center items-center p-2 rounded-lg ${consultationMode === mode ? " border-darkGreen border-3" : "border-inputBorder border-1"} gap-1 cursor-pointer`}
                      onClick={() => setConsultationMode(mode)}
                    >
                      <div className="w-full flex justify-center items-center">
                        {getIcon(mode, "30px", "black")}
                      </div>
                      <p className=" font-medium text-center text-xs">{`${modeNames[mode]}`}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Availability</p>
                  <p className="text-xs font-medium underline text-darkGreen/70 hover:text-darkGreen cursor-pointer">
                    Full Calendar
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-1">
                  {doctor.availability.map((slot, index) => (
                    <div
                      key={index}
                      className={`  flex flex-col justify-center items-center p-2 rounded-lg ${selectedDate === slot.date ? "text-darkGreen border-darkGreen border-2" : "border-inputBorder border-1"} gap-1 cursor-pointer`}
                      onClick={() => handleDateSelect(slot.date)}
                    >
                      <p className="text-sm font-medium">{slot.day}</p>
                      <p className="text-xl font-semibold">{slot.date}</p>
                    </div>
                  ))}
                </div>
                {slotList.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {slotList.map((slot, index) => (
                      <div
                        key={index}
                        className={`  flex flex-col justify-center items-center p-2 rounded-lg ${selectedSlot === slot.slotId ? "text-darkGreen border-darkGreen border-2" : "border-inputBorder border-1"} gap-1 cursor-pointer`}
                        onClick={() => setSelectedSlot(slot.slotId)}
                      >
                        <p className="text-sm font-medium">
                          {new Date(slot.startTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="flex justify-center items-center p-2 rounded-lg border-1 border-inputBorder">
                    <p className="text-sm font-medium">No slots available</p>
                  </div>
                ) : (
                  <div className="flex justify-center items-center p-2 rounded-lg border-1 border-inputBorder">
                    <p className="text-sm font-medium">
                      Choose a date to view slots
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <p className="font-semibold">Consultation fee - </p>
                <div className="text-xl font-semibold">
                  ₹{doctor.consultationFee}
                </div>
              </div>
              <button className="w-full bg-darkGreen text-white py-3 rounded-lg font-semibold cursor-pointer">
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UViewDoctorPage;
