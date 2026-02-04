import { useEffect, useState } from "react";
import getIcon from "../../helpers/getIcon";
import {
  getFullCalendarSlots,
  getSlots,
} from "../../api/doctor/dSlotManagementService";
import { days } from "../../constants/dateAndTime";

function UDoctorCalendar({
  isOpen,
  onClose,
  doctorId,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
}) {
  const [slots, setSlots] = useState(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
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
    getFullCalendarSlots({
      doctorId,
      startDate: startDate.toISOString().split("T")[0],
      days: 7,
    }).then((res) => {
      console.log(res);
      setSlots(res.data);
    });
  }, [page]);

  return (
    <>
      {isOpen && (
        <div className="inset-0 h-screen w-screen fixed z-999 bg-black/50 flex items-center justify-center">
          <div className=" h-[400px] bg-white rounded-lg p-4 relative flex flex-col gap-2">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 rounded-md hover:bg-gray-100 p-1"
            >
              {getIcon("close", "24px", "black")}
            </button>
            <h1 className="text-lg font-semibold">Availability</h1>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)}>
                {getIcon("left", "24px", "black")}
              </button>
              {dateList.map((date) => (
                <button
                  className={`flex flex-col w-[60px] items-center justify-center p-2 rounded-md ${selectedDate === date.toISOString() ? "bg-darkGreen text-white" : "bg-gray-100"}`}
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date.toISOString())}
                >
                  <p>{days[date.getDay()]}</p>
                  <p>{date.getDate()}</p>
                </button>
              ))}
              <button onClick={() => setPage(page + 1)}>
                {getIcon("right", "24px", "black")}
              </button>
            </div>
            <div></div>
          </div>
        </div>
      )}
    </>
  );
}

export default UDoctorCalendar;
