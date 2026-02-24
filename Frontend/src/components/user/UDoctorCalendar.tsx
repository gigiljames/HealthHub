import { useEffect, useState } from "react";
import getIcon from "../../helpers/getIcon";
import {
  getFullCalendarSlots,
  getSlots,
} from "../../api/doctor/dSlotManagementService";
import { days } from "../../constants/dateAndTime";
import type { RootState } from "../../state/store";
import { useSelector } from "react-redux";
import type { PracticeLocation } from "../../types/practiceLocation";

function UDoctorCalendar({
  isOpen,
  onClose,
  doctorId,
  practiceLocations,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  practiceLocations: PracticeLocation[];
}) {
  // Interfaces matching the response structure
  interface SlotDTO {
    id?: string;
    title: string;
    start: string;
    end: string;
    mode: "online" | "in-person";
    practiceLocationId: string;
    isBooked: boolean;
  }

  interface GroupedSlotsByDateAndLocationDTO {
    [date: string]: {
      [practiceLocationId: string]: SlotDTO[];
    };
  }

  const [slots, setSlots] = useState<GroupedSlotsByDateAndLocationDTO | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [dateList, setDateList] = useState<Date[]>([]);

  useEffect(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (page - 1) * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    setDateList(dates);
    // Set selected date to the first day of the week if not set or out of range
    const firstDateStr = dates[0].toISOString().split("T")[0];
    if (!selectedDate || !isWithinDays(dates[0], new Date(selectedDate), 7)) {
      setSelectedDate(firstDateStr);
    }

    getFullCalendarSlots({
      doctorId,
      startDate: startDate.toISOString().split("T")[0],
      days: 7,
    }).then((res) => {
      console.log(res);
      if (res?.success) {
        setSlots(res.data);
      }
    });
  }, [page, doctorId]); // Added doctorId specific dependency

  function isWithinDays(date1: Date, date2: Date, days: number) {
    const start = new Date(date1);
    const end = new Date(date1);
    end.setDate(start.getDate() + days);
    return date2 >= start && date2 <= end;
  }

  const getDayString = (date: Date) => date.toISOString().split("T")[0];

  return (
    <>
      {isOpen && (
        <div className="inset-0 h-screen w-screen fixed z-[999] bg-black/50 flex items-center justify-center">
          <div className="w-[600px] min-h-[500px] max-h-[80vh] overflow-y-auto bg-white rounded-lg p-6 relative flex flex-col gap-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-md hover:bg-gray-100 p-1 transition-colors"
            >
              {getIcon("close", "24px", "black")}
            </button>
            <h1 className="text-xl font-bold text-gray-800">Availability</h1>

            {/* Date Navigation */}
            <div className="flex items-center gap-2 w-full justify-between bg-gray-50 p-2 rounded-xl">
              <button
                onClick={() => setPage(page - 1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {getIcon("left", "24px", "black")}
              </button>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {dateList.map((date) => {
                  const dateStr = getDayString(date);
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      className={`flex flex-col min-w-[60px] items-center justify-center p-2 rounded-xl transition-all ${
                        isSelected
                          ? "bg-darkGreen text-white shadow-md scale-105"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-100"
                      }`}
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <p className="text-xs font-medium uppercase opacity-80">
                        {days[date.getDay()].slice(0, 3)}
                      </p>
                      <p className="text-lg font-bold">{date.getDate()}</p>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {getIcon("right", "24px", "black")}
              </button>
            </div>

            {/* Slots Display */}
            <div className="flex-1 flex flex-col gap-4">
              {selectedDate && slots && slots[selectedDate] ? (
                Object.keys(slots[selectedDate]).length > 0 ? (
                  Object.entries(slots[selectedDate]).map(
                    ([locId, locSlots]) => (
                      <div
                        key={locId}
                        className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
                      >
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                          {getIcon("location", "18px", "gray")}
                          Location ID:{" "}
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1 py-0.5 rounded">
                            {practiceLocations.find((loc) => loc._id === locId)
                              ?.name || locId}
                          </span>
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {locSlots.map((slot) => {
                            const startTime = new Date(
                              slot.start,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            return (
                              <div
                                key={slot.id || `${slot.start}-${slot.end}`}
                                className={`
                                   px-3 py-2 rounded-lg text-sm font-medium border text-center transition-colors
                                   ${
                                     slot.isBooked
                                       ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed decoration-slice"
                                       : "bg-green-50 text-darkGreen border-green-200 hover:bg-green-100 cursor-pointer"
                                   }
                                 `}
                                title={slot.isBooked ? "Booked" : "Available"}
                              >
                                {startTime}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-500 gap-2 h-full">
                    {getIcon("calendar", "40px", "lightgray")}
                    <p>No slots available for this date.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500 gap-2 h-full">
                  {getIcon("calendar", "40px", "lightgray")}
                  <p>No slots available for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UDoctorCalendar;
