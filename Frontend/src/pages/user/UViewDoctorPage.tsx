import UNavbar from "../../components/user/UNavbar";
import UGuestNavbar from "../../components/user/UGuestNavbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect, useState } from "react";
import DraggableMarkerMap from "../../components/common/DraggableMarkerMap";
import { days, months } from "../../constants/dateAndTime";
import { useParams } from "react-router";
import { getPublicDoctorProfile } from "../../api/doctor/doctorService";
import type { Gender } from "../../enums/gender";
import type { DoctorEducation } from "../../types/doctorEducationType";
import type { DoctorExperience } from "../../types/doctorExperienceType";
import type { PopulatedPracticeLocation } from "../../types/populatedPracticeLocation";
import type { Slot } from "../../state/doctor/dSlotSlice";
import type { PracticeType } from "../../enums/practiceType";
import DNavbar from "../../components/doctor/DNavbar";
import { PracticeLocationType } from "../../enums/practiceLocationType";
import UDoctorCalendar from "../../components/user/UDoctorCalendar";

export interface GetDoctorPublicProfileDTO {
  id: string;
  name: string;
  specialization: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  gender: Gender;
  contactEmail: string;
  contactPhone: string;
  languages: string[];
  education: DoctorEducation[];
  experience: DoctorExperience[];
  about: string;
  practiceLocations: PopulatedPracticeLocation[];
  slots: { [practiceLocationId: string]: any };
  practiceType: PracticeType;
}

function UViewDoctorPage() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState<GetDoctorPublicProfileDTO>();
  const token = useSelector((state: RootState) => state.token.token);
  const role = useSelector((state: RootState) => state.token.role);
  const [consultationMode, setConsultationMode] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<number[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewAboutButton, setViewAboutButton] = useState(false);
  const [currSlots, setCurrSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedPracticeLocation, setSelectedPracticeLocation] =
    useState<any>(null);
  const modeNames = {
    AUDIO: "Audio Call",
    CHAT: "Chat",
    VIDEO: "Video Call",
    IN_PERSON: "Clinic Visit",
  };

  useEffect(() => {
    if (doctorId) {
      getPublicDoctorProfile(doctorId).then((res) => {
        console.log(res);
        setDoctor(res.doctor);
        setViewAboutButton(res.doctor.about.length > 100);
      });
    }
  }, []);

  function handleSelectPracticeLocation(id: string) {
    setSelectedDate(null);
    setSelectedSlot("");
    const pLoc = doctor?.practiceLocations.find((loc) => loc._id === id);
    setSelectedPracticeLocation(pLoc);
    if (pLoc && pLoc.type === PracticeLocationType.ONLINE) {
      setMapLocation([-91, 91]);
    } else if (pLoc) {
      setMapLocation(pLoc.location?.coordinates ?? [-91, 91]);
    }
    const slots = doctor?.slots[id];
    setCurrSlots(slots);
  }

  // function handleDateSelect(date: number) {
  //   setSelectedDate(date);
  //   setSlotList(
  //     doctor?.availability.find((item) => item.date === date)?.slots || [],
  //   );
  // }

  return (
    <>
      <div className="w-full h-screen overflow-y-auto bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
        {token && role === "user" ? (
          <UNavbar />
        ) : token && role === "doctor" ? (
          <DNavbar />
        ) : (
          <UGuestNavbar />
        )}
        <UDoctorCalendar
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          doctorId={doctorId!}
          practiceLocations={doctor?.practiceLocations || []}
        />
        <div className="w-full h-full flex flex-col lg:px-30 xl:px-40 2xl:px-[15%] pt-12 lg:pt-18 pb-20">
          {/* Images */}
          <div className="w-full relative h-fit pt-4">
            <img
              className="w-full h-56 object-cover bg-slate-200 rounded-xl"
              src={doctor?.bannerImageUrl}
              alt=""
            />
            <img
              className="w-44 h-44 object-cover bg-slate-300 rounded-full absolute -bottom-12 left-8"
              src={doctor?.profileImageUrl}
              alt=""
            />
          </div>
          {/* Primary Info */}
          <div className="w-full pt-16 p-3 flex gap-3">
            <div className="w-1/2">
              <h1 className="text-2xl font-semibold">{doctor?.name}</h1>
              <p className="text-lg font-medium">{doctor?.specialization}</p>
              {/* <p className="text-md font-medium">{doctor?.location.address}</p> */}
            </div>
            <div className="w-1/2 flex flex-col gap-2 items-end justify-around">
              <div className="flex gap-2 items-center">
                <span className="font-medium">Contact number: </span>
                <span>{doctor?.contactPhone}</span>
              </div>
              {/* <div className="flex gap-2 items-center">
                <span className="font-medium">Languages: </span>
                <div className="">{doctor?.languages.join(", ")}</div>
              </div> */}
            </div>
          </div>
          <div className="w-full flex gap-3 pt-3">
            <div className="w-2/3 flex flex-col gap-3 p-3 pt-0">
              <div className="flex flex-col gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                <h3 className="text-lg font-semibold">About</h3>
                <p
                  className={`text-sm font-medium ${viewAboutButton ? "line-clamp-4" : ""}`}
                >
                  {doctor?.about}
                </p>
                <button
                  className="text-darkGreen/70 hover:text-darkGreen font-medium hover:underline"
                  onClick={() => setViewAboutButton(!viewAboutButton)}
                >
                  {viewAboutButton ? "Show More" : "Show Less"}
                </button>
              </div>
              <div className="flex flex-col w-full gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                <h3 className="text-lg font-semibold">Location on map</h3>
                <div>
                  {mapLocation === null && (
                    <p className="text-sm font-medium text-center border-1 border-inputBorder rounded-lg p-2">
                      Select a practice location to view on map
                    </p>
                  )}
                  {mapLocation &&
                    mapLocation[0] === -91 &&
                    mapLocation[1] === 91 && (
                      <p className="text-sm font-medium text-center border-1 border-inputBorder rounded-lg p-2">
                        No location to display
                      </p>
                    )}
                  {mapLocation &&
                    mapLocation[0] !== -91 &&
                    mapLocation[1] !== 91 && (
                      <DraggableMarkerMap
                        initialLatLong={{
                          lng: mapLocation[0],
                          lat: mapLocation[1],
                        }}
                        height={"400px"}
                      />
                    )}
                </div>
              </div>
              <div className="w-full flex gap-3">
                <div className="flex flex-col w-1/2 gap-2 border-1 border-inputBorder rounded-xl p-3 bg-white dark:bg-gray-900">
                  <h3 className="text-lg font-semibold">Education</h3>
                  {doctor?.education.map((edu, index) => (
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
                  {doctor?.experience.map((exp, index) => (
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
                <h3 className="text-lg font-semibold">Rating & Reviews</h3>
              </div>
            </div>
            {/* Appointment */}
            <div className="w-1/3 border-1 border-inputBorder rounded-xl p-4 bg-white dark:bg-gray-900 flex flex-col gap-4 sticky top-20 h-fit">
              <h2 className="text-xl font-bold">Book An Appointment</h2>
              {doctor?.practiceLocations &&
                doctor.practiceLocations.length > 0 && (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold">Practice location</p>
                      <select
                        name=""
                        id=""
                        className="border-inputBorder border-1 rounded-lg p-2"
                        onChange={(e) =>
                          handleSelectPracticeLocation(e.target.value)
                        }
                      >
                        <option value="">Select Practice Location</option>
                        {doctor.practiceLocations.map((location, index) => (
                          <option key={index} value={location._id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* <div className="grid grid-cols-4 gap-2">
                      {selectedPracticeLocation?.consultationModes.map(
                        (mode: string, index: number) => (
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
                        ),
                      )}
                    </div> */}
                    {selectedPracticeLocation && (
                      <>
                        {currSlots && Object.keys(currSlots).length > 0 ? (
                          <>
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <p className="font-semibold">Availability</p>
                                <p
                                  className="text-xs font-medium underline text-darkGreen/70 hover:text-darkGreen cursor-pointer"
                                  onClick={() => setIsCalendarOpen(true)}
                                >
                                  Full Calendar
                                </p>
                              </div>
                              <div className="grid grid-cols-5 gap-2 mb-1">
                                {currSlots &&
                                  Object.keys(currSlots).map((date, index) => {
                                    const dateObj = new Date(date);
                                    return (
                                      <div
                                        key={index}
                                        className={`  flex flex-col justify-center items-center p-2 rounded-lg ${selectedDate === date ? "text-darkGreen border-darkGreen border-2" : "border-inputBorder border-1"} gap-1 cursor-pointer`}
                                        onClick={() => setSelectedDate(date)}
                                      >
                                        <p className="text-xl font-semibold">
                                          {dateObj.getDate()}
                                        </p>
                                        <p className="text-xs font-medium">
                                          {days[dateObj.getDay()]}
                                        </p>
                                      </div>
                                    );
                                  })}
                              </div>
                              {selectedDate &&
                              currSlots[selectedDate]?.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {currSlots[selectedDate].map(
                                    (slot, index: number) => (
                                      <div
                                        key={index}
                                        className={`  flex flex-col justify-center items-center p-2 rounded-lg ${selectedSlot === slot._id ? "text-darkGreen border-darkGreen border-2" : "border-inputBorder border-1"} gap-1 cursor-pointer`}
                                        onClick={() =>
                                          setSelectedSlot(slot._id)
                                        }
                                      >
                                        <p className="text-sm font-medium">
                                          {new Date(
                                            slot.start,
                                          ).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "numeric",
                                          })}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : selectedDate ? (
                                <div className="flex justify-center items-center p-2 rounded-lg border-1 border-inputBorder">
                                  <p className="text-sm font-medium">
                                    No available slots
                                  </p>
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
                              <p className="font-semibold">
                                Consultation fee -{" "}
                              </p>
                              <div className="text-xl font-semibold">
                                ₹{selectedPracticeLocation?.consultationFee}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-center items-center p-2 rounded-lg border-1 border-inputBorder">
                            <p className="text-sm font-medium">
                              No slots available
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    <button className="w-full bg-darkGreen text-white py-3 rounded-lg font-semibold cursor-pointer">
                      Book Appointment
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UViewDoctorPage;
