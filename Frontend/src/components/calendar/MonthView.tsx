import type { CalendarEvent } from "./Calendar";

interface MonthViewProps {
  date: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: Record<string, CalendarEvent[]>;
}

function MonthView({
  date,
  selectedDate,
  setSelectedDate,
  events,
}: MonthViewProps) {
  const currDate = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days: (Date | null)[][] = [[], [], [], [], [], [], []];
  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(year, month, i);
    const weekDay = day.getDay();
    if (i === 1) {
      for (let j = 0; j < weekDay; j++) {
        days[j].push(null);
      }
    }
    days[weekDay].push(day);
    if (i === daysInMonth) {
      for (let j = weekDay + 1; j < 7; j++) {
        days[j].push(null);
      }
    }
  }

  function handleClickDate(day: Date | null) {
    if (day) setSelectedDate(day);
  }

  return (
    <>
      <div className="grid grid-cols-7 gap-2 py-1 font-semibold text-[14px] text-black/40">
        {dayNames.map((dayName, index) => (
          <div key={index} className="pl-0.5">
            {dayName}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {days.map((week, index) => (
          <div key={index} className="flex flex-col gap-2">
            {week.map((day, index) => (
              <div
                key={index}
                className={`h-[80px] max-w-[150px] ${day?.toLocaleDateString() === selectedDate.toLocaleDateString() ? "border-green-500 border-2" : "border-green-300 border-1"} rounded-lg p-1.5  ${day?.toLocaleDateString() === currDate.toLocaleDateString() ? "bg-white" : "bg-gradient-to-t from-white to-green-100 to-25%"} cursor-pointer overflow-hidden relative`}
                onClick={() => handleClickDate(day)}
              >
                <div
                  className={`text-[14px] ${day?.toLocaleDateString() === currDate.toLocaleDateString() ? " font-bold" : ""}`}
                >
                  {day?.getDate()}
                </div>
                <div>
                  {day &&
                    events[day.toLocaleDateString()] &&
                    events[day.toLocaleDateString()].map((slot, index) => {
                      return (
                        <div
                          className="text-[13px] bg-gradient-to-t from-green-200 to-green-300 to-50% rounded-sm px-1 mb-1 "
                          key={index}
                        >
                          {slot.title}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default MonthView;
