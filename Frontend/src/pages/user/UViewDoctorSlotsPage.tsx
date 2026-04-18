import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import UNavbar from "../../components/user/UNavbar";
import UGuestNavbar from "../../components/user/UGuestNavbar";
import DNavbar from "../../components/doctor/DNavbar";
import { getPublicDoctorProfile } from "../../api/doctor/doctorService";
import type { GetDoctorPublicProfileDTO } from "./UViewDoctorPage";
import DraggableMarkerMap from "../../components/common/DraggableMarkerMap";
import { days, months } from "../../constants/dateAndTime";
import getIcon from "../../helpers/getIcon";
import { PracticeLocationType } from "../../enums/practiceLocationType";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../../components/common/Avatar";

function UViewDoctorSlotsPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.token.token);
  const role = useSelector((state: RootState) => state.token.role);

  const [doctor, setDoctor] = useState<GetDoctorPublicProfileDTO>();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  useEffect(() => {
    if (doctorId) {
      getPublicDoctorProfile(doctorId).then((res) => {
        setDoctor(res.doctor);
        if (res.doctor?.practiceLocations?.length > 0) {
          setOpenAccordions([res.doctor.practiceLocations[0]._id]);
        }
      });
    }
  }, [doctorId]);

  const dateBrowser = useMemo(() => {
    const dates = [];
    const today = new Date();
    const maxDaysStr = import.meta.env.VITE_MAX_SLOT_DAYS;
    const maxDays = maxDaysStr ? parseInt(maxDaysStr, 10) : 14;

    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const d = date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const kolkataDate = new Date(d);
      const yyyy = kolkataDate.getFullYear();
      const mm = String(kolkataDate.getMonth() + 1).padStart(2, "0");
      const dd = String(kolkataDate.getDate()).padStart(2, "0");
      const dateString = `${yyyy}-${mm}-${dd}`;
      dates.push({
        dateObj: date,
        dateString,
        dayName: days[date.getDay()].substring(0, 3),
        dayNumber: date.getDate(),
        monthName: months[date.getMonth()].substring(0, 3),
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (!selectedDate && dateBrowser.length > 0) {
      setSelectedDate(dateBrowser[0].dateString);
    }
  }, [dateBrowser, selectedDate]);

  const toggleAccordion = (id: string) => {
    if (openAccordions.includes(id)) {
      setOpenAccordions(openAccordions.filter((a) => a !== id));
    } else {
      setOpenAccordions([...openAccordions, id]);
    }
  };

  const isSlotAvailable = (slot: any) => {
    return (
      (slot.status === "AVAILABLE" || slot.status === "LOCKED") &&
      (!slot.lockedUntil || new Date(slot.lockedUntil) <= new Date())
    );
  };

  return (
    <div className="w-full h-screen overflow-y-auto bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
      {token && role === "user" ? (
        <UNavbar />
      ) : token && role === "doctor" ? (
        <DNavbar />
      ) : (
        <UGuestNavbar />
      )}

      <div className="w-full max-w-6xl mx-auto pt-[80px] py-8 flex flex-col gap-6">
        {/* Header - Doctor Details */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative">
          <div className="px-6 py-4 relative flex justify-between items-center">
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                <Avatar
                  src={doctor?.profileImageUrl}
                  alt={doctor?.name}
                  className="w-full h-full object-cover rounded-full bg-slate-100"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{doctor?.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {doctor?.specialization}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/doctors/${doctorId}`)}
              className="text-sm font-medium text-darkGreen underline hover:text-green-800 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>

        {/* Calendar / Slots Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Available Slots</h2>

          {/* Horizontal Date Browser */}
          <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {dateBrowser.map((d, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDate(d.dateString)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl cursor-pointer transition-all border ${selectedDate === d.dateString ? "bg-darkGreen text-white border-darkGreen shadow-md scale-105" : "bg-gray-50 border-gray-200 hover:border-darkGreen hover:bg-green-50/30"}`}
                >
                  <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                    {d.monthName}
                  </span>
                  <span className="text-xl font-bold my-0.5">
                    {d.dayNumber}
                  </span>
                  <span className="text-xs font-semibold">{d.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Locations Accordion */}
          <div className="flex flex-col gap-4 mb-20">
            {(() => {
              const locationsWithSlots =
                doctor?.practiceLocations?.filter((location) => {
                  const locId = location._id || "";
                  const dateSlots =
                    doctor.slots &&
                    doctor.slots[locId] &&
                    doctor.slots[locId][selectedDate]
                      ? doctor.slots[locId][selectedDate]
                      : [];
                  return dateSlots.length > 0;
                }) || [];

              if (locationsWithSlots.length === 0) {
                return (
                  <div className="p-12 mt-4 text-center bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
                    <div className="text-gray-300 dark:text-gray-700 mb-3">
                      {getIcon("calendar", "48px")}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      No slots available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      There are no consultation slots scheduled across any
                      practice locations for this date.
                    </p>
                  </div>
                );
              }

              return locationsWithSlots.map((location) => {
                const locId = location._id || "";
                const isOpen = openAccordions.includes(locId);
                const dateSlots =
                  doctor?.slots &&
                  doctor.slots[locId] &&
                  doctor.slots[locId][selectedDate]
                    ? doctor.slots[locId][selectedDate]
                    : [];
                const onlineSlots = dateSlots.filter(
                  (s: any) => s.mode === "online",
                );
                const inPersonSlots = dateSlots.filter(
                  (s: any) => s.mode === "in-person",
                );

                let mapCoords: number[] | null = null;
                if (location.location?.coordinates) {
                  mapCoords = location.location.coordinates;
                }

                return (
                  <div
                    key={location._id}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <div
                      className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => toggleAccordion(locId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-darkGreen rounded-lg">
                          {location.type === PracticeLocationType.ONLINE
                            ? getIcon("video", "20px")
                            : getIcon("location", "20px")}
                        </div>
                        <div className="max-w-[80%]">
                          <h3 className="font-semibold text-lg">
                            {location.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {location.location?.address
                              ? `${location.location.address} • `
                              : ""}{" "}
                            Fee: ₹{location.consultationFee}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {isOpen
                          ? getIcon("chevronUp", "24px")
                          : getIcon("chevronDown", "24px")}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6">
                            {/* Slots Section */}
                            <div className="flex-1 flex flex-col gap-6">
                              {/* In-Person Slots */}
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-darkGreen font-semibold">
                                  {getIcon("user", "18px")}
                                  <h4>In-Person Consultation</h4>
                                </div>
                                {inPersonSlots.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {inPersonSlots.map((slot: any) => {
                                      const available = isSlotAvailable(slot);
                                      return (
                                        <div
                                          key={slot._id}
                                          onClick={() => {
                                            if (available)
                                              setSelectedSlot(slot._id);
                                          }}
                                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            !available
                                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                              : selectedSlot === slot._id
                                                ? "bg-darkGreen border-darkGreen text-white shadow-md"
                                                : "bg-white border-gray-300 text-gray-700 cursor-pointer hover:border-darkGreen hover:text-darkGreen"
                                          }`}
                                        >
                                          {new Date(
                                            slot.start,
                                          ).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "numeric",
                                          })}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">
                                    No in-person slots available on this date.
                                  </p>
                                )}
                              </div>

                              {/* Online Slots */}
                              {location.consultationModes?.some((m: string) =>
                                ["AUDIO", "VIDEO", "CHAT"].includes(m),
                              ) && (
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center gap-2 text-darkGreen font-semibold">
                                    {getIcon("video", "18px")}
                                    <h4>Online Consultation</h4>
                                  </div>
                                  {onlineSlots.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {onlineSlots.map((slot: any) => {
                                        const available = isSlotAvailable(slot);
                                        return (
                                          <div
                                            key={slot._id}
                                            onClick={() => {
                                              if (available)
                                                setSelectedSlot(slot._id);
                                            }}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                              !available
                                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                                : selectedSlot === slot._id
                                                  ? "bg-darkGreen border-darkGreen text-white shadow-md"
                                                  : "bg-white border-gray-300 text-gray-700 cursor-pointer hover:border-darkGreen hover:text-darkGreen"
                                            }`}
                                          >
                                            {new Date(
                                              slot.start,
                                            ).toLocaleTimeString("en-US", {
                                              hour: "numeric",
                                              minute: "numeric",
                                            })}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">
                                      No online slots available on this date.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Map Section */}
                            <div className="w-full md:w-1/3 min-h-[250px] bg-slate-100 rounded-xl overflow-hidden border border-gray-200 relative">
                              {!mapCoords ||
                              (mapCoords[0] === -91 && mapCoords[1] === 91) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                  {getIcon("map", "40px")}
                                  <p className="mt-2 text-sm font-medium">
                                    Map location not available for online-only
                                    practices
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <DraggableMarkerMap
                                    initialLatLong={{
                                      lng: mapCoords[0],
                                      lat: mapCoords[1],
                                    }}
                                    height="100%"
                                  />
                                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 text-xs">
                                    <p className="font-semibold text-gray-700">
                                      ADDRESS
                                    </p>
                                    <p className="text-gray-600 truncate">
                                      {location.location?.address}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              });
            })()}

            {doctor?.practiceLocations?.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
                No practice locations found for this doctor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar for Booking */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-between items-center">
        <div>
          {selectedSlot ? (
            <p className="text-sm font-medium text-gray-600">
              Slot selected. Click to proceed with booking.
            </p>
          ) : (
            <p className="text-sm font-medium text-amber-600">
              Please select an available slot to continue.
            </p>
          )}
        </div>
        <button
          disabled={!selectedSlot}
          onClick={() => navigate(`/doctors/${doctorId}/book/${selectedSlot}`)}
          className="bg-darkGreen text-white px-8 py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-800 transition-colors shadow-sm"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default UViewDoctorSlotsPage;
