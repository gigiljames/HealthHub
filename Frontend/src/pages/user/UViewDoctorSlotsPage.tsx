import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import UNavbar from "../../components/user/UNavbar";
import UGuestNavbar from "../../components/user/UGuestNavbar";
import DNavbar from "../../components/doctor/DNavbar";
import { getPublicDoctorProfile } from "../../api/doctor/doctorService";
import { getFullCalendarSlots } from "../../api/doctor/dSlotManagementService";
import type { GetDoctorPublicProfileDTO } from "./UViewDoctorPage";
import DraggableMarkerMap from "../../components/common/DraggableMarkerMap";
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
      getPublicDoctorProfile(doctorId)
        .then((res) => {
          if (!res?.doctor) {
            navigate("/404");
            return;
          }
          setDoctor(res.doctor);
          if (res.doctor.practiceLocations?.length > 0) {
            setOpenAccordions([res.doctor.practiceLocations[0]._id]);
          }

          const maxDaysStr = import.meta.env.VITE_MAX_SLOT_DAYS;
          const maxDays = maxDaysStr ? parseInt(maxDaysStr, 10) : 30;
          getFullCalendarSlots({
            doctorId,
            startDate: new Date().toLocaleDateString("en-CA", {
              timeZone: "Asia/Kolkata",
            }),
            days: maxDays,
          }).then((slotsRes) => {
            if (slotsRes?.success && slotsRes.data) {
              setDoctor((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  slots: slotsRes.data,
                };
              });
            }
          });
        })
        .catch((err: any) => {
          if (err.response?.status === 403) {
            navigate("/403");
          } else {
            navigate("/404");
          }
        });
    }
  }, [doctorId, navigate]);

  const dateBrowser = useMemo(() => {
    const dates = [];
    const maxDaysStr = import.meta.env.VITE_MAX_SLOT_DAYS;
    const maxDays = maxDaysStr ? parseInt(maxDaysStr, 10) : 30;
    const now = new Date();

    for (let i = 0; i < maxDays; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);

      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const dateString = formatter.format(date);

      const partsFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const parts = partsFormatter.formatToParts(date);
      const dayName = parts.find((p) => p.type === "weekday")?.value || "";
      const dayNumber = parseInt(
        parts.find((p) => p.type === "day")?.value || "1",
        10,
      );
      const monthName = parts.find((p) => p.type === "month")?.value || "";

      dates.push({
        dateObj: date,
        dateString,
        dayName,
        dayNumber,
        monthName,
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

      <div className="w-full max-w-6xl mx-auto pt-[70px] md:pt-[90px] py-4 sm:py-8 px-0 sm:px-4 md:px-6 flex flex-col gap-4 sm:gap-6">
        {/* Header - Doctor Details */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-none sm:rounded-xl border-y sm:border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative">
          <div className="px-4 py-3 sm:px-6 sm:py-5 relative flex flex-row gap-3 justify-between items-center">
            <div className="flex flex-row gap-3 sm:gap-6 items-center text-left">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white dark:bg-gray-900 rounded-full p-0.5 border border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
                <Avatar
                  src={doctor?.profileImageUrl}
                  alt={doctor?.name}
                  className="w-full h-full object-cover rounded-full bg-slate-100 dark:bg-gray-800"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{doctor?.name}</h1>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium truncate mt-0.5">
                  {doctor?.specialization}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/doctors/${doctorId}`)}
              className="text-xs sm:text-sm font-semibold text-darkGreen dark:text-emerald-400 underline hover:text-green-800 dark:hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              Back to Profile
            </button>
          </div>
        </div>

        {/* Calendar / Slots Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg sm:text-xl font-bold ml-4 sm:ml-0 text-gray-900 dark:text-gray-100">Available Slots</h2>

          {/* Horizontal Date Browser */}
          <div className="w-full bg-white dark:bg-gray-900 rounded-none sm:rounded-xl border-y sm:border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {dateBrowser.map((d, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDate(d.dateString)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-18 sm:w-16 sm:h-20 rounded-xl cursor-pointer transition-all border ${selectedDate === d.dateString ? "bg-darkGreen text-white border-darkGreen shadow-md scale-105" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-305 hover:border-darkGreen hover:bg-green-50/30"}`}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-85">
                    {d.monthName}
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold my-0.5">
                    {d.dayNumber}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold">{d.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Locations Accordion */}
          <div className="flex flex-col gap-4 mb-24">
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
                  <div className="p-8 sm:p-12 mt-4 text-center bg-white dark:bg-gray-900 rounded-none sm:rounded-xl border-y sm:border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
                    <div className="text-gray-305 dark:text-gray-600 mb-3">
                      {getIcon("calendar", "48px")}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      No slots available
                    </h3>
                    <p className="text-sm text-gray-555 dark:text-gray-400 mt-1.5 max-w-md">
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
                    className="bg-white dark:bg-gray-900 rounded-none sm:rounded-xl border-y sm:border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                  >
                    <div
                      className="p-3.5 sm:p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => toggleAccordion(locId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-emerald-950/30 text-darkGreen dark:text-emerald-400 rounded-lg flex-shrink-0">
                          {location.type === PracticeLocationType.ONLINE
                            ? getIcon("video", "20px")
                            : getIcon("location", "20px")}
                        </div>
                        <div className="max-w-[75%] sm:max-w-[80%]">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                            {location.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
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
                          <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-5 sm:gap-6">
                            {/* Slots Section */}
                            <div className="flex-1 flex flex-col gap-6">
                              {/* In-Person Slots */}
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-darkGreen dark:text-emerald-400 font-bold text-sm sm:text-base">
                                  {getIcon("user", "18px")}
                                  <h4>In-Person Consultation</h4>
                                </div>
                                {inPersonSlots.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {inPersonSlots.map((slot: any) => {
                                      const available = isSlotAvailable(slot);
                                      return (
                                        <div
                                          key={slot.id}
                                          onClick={() => {
                                            if (available)
                                              setSelectedSlot(slot.id!);
                                          }}
                                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all ${!available
                                            ? "bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                                            : selectedSlot === slot.id
                                              ? "bg-darkGreen border-darkGreen text-white shadow-md"
                                              : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-305 cursor-pointer hover:border-darkGreen hover:text-darkGreen"
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
                                  <p className="text-xs sm:text-sm text-gray-500 italic">
                                    No in-person slots available on this date.
                                  </p>
                                )}
                              </div>

                              {/* Online Slots */}
                              {location.consultationModes?.some((m: string) =>
                                ["AUDIO", "VIDEO", "CHAT"].includes(m),
                              ) && (
                                  <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-darkGreen dark:text-emerald-400 font-bold text-sm sm:text-base">
                                      {getIcon("video", "18px")}
                                      <h4>Online Consultation</h4>
                                    </div>
                                    {onlineSlots.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {onlineSlots.map((slot: any) => {
                                          const available = isSlotAvailable(slot);
                                          return (
                                            <div
                                              key={slot.id}
                                              onClick={() => {
                                                if (available)
                                                  setSelectedSlot(slot.id!);
                                              }}
                                              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all ${!available
                                                ? "bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                                                : selectedSlot === slot.id
                                                  ? "bg-darkGreen border-darkGreen text-white shadow-md"
                                                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-305 cursor-pointer hover:border-darkGreen hover:text-darkGreen"
                                                }`}
                                            >
                                              {new Date(
                                                slot.start,
                                              ).toLocaleTimeString("en-US", {
                                                hour: "numeric",
                                                minute: "numeric",
                                                second: undefined,
                                              })}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-xs sm:text-sm text-gray-500 italic">
                                        No online slots available on this date.
                                      </p>
                                    )}
                                  </div>
                                )}
                            </div>

                            {/* Map Section */}
                            <div className="w-full md:w-1/3 h-[200px] sm:h-[250px] bg-slate-100 dark:bg-gray-855 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative flex-shrink-0">
                              {!mapCoords ||
                                (mapCoords[0] === -91 && mapCoords[1] === 91) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 text-center bg-gray-50 dark:bg-gray-900/50">
                                  {getIcon("map", "40px")}
                                  <p className="mt-2 text-xs font-semibold leading-relaxed">
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
                                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 text-[10px] sm:text-xs">
                                    <p className="font-bold text-gray-750 dark:text-gray-300">
                                      ADDRESS
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 truncate">
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
              <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-none sm:rounded-xl border-y sm:border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-455 font-medium">
                No practice locations found for this doctor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar for Booking */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3.5 px-4 sm:px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex flex-row items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {selectedSlot ? (
            <p className="text-xs sm:text-sm font-semibold truncate text-gray-600 dark:text-gray-400">
              Slot selected. Click to proceed.
            </p>
          ) : (
            <p className="text-xs sm:text-sm font-semibold truncate text-amber-600 dark:text-amber-400">
              Please select an available slot.
            </p>
          )}
        </div>
        <button
          disabled={!selectedSlot}
          onClick={() => navigate(`/doctors/${doctorId}/book/${selectedSlot}`)}
          className="bg-darkGreen text-white px-5 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default UViewDoctorSlotsPage;
