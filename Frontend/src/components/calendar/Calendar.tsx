import { useEffect, useState } from "react";
import CalendarHeader from "./CalendarHeader";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";

interface CalendarProps {
  // height: string;
  events: CalendarEvent[];
}

export interface CalendarEvent {
  start: string;
  end: string;
  title: string;
}

const Calendar = ({ events }: CalendarProps) => {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  function getFormattedEvents() {
    const formattedEvents: Record<string, CalendarEvent[]> = {};
    for (let event of events) {
      const startDate = new Date(event.start).toLocaleDateString();
      if (formattedEvents[startDate]) {
        formattedEvents[startDate].push(event);
      } else {
        formattedEvents[startDate] = [event];
      }
    }
    return formattedEvents;
  }

  const handlePrev = () => {
    if (view === "month") {
      setDate(
        new Date(date.getFullYear(), date.getMonth() - 1, date.getDate())
      );
    }
    if (view === "week") {
      setDate(
        new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7)
      );
    }
    if (view === "day") {
      setDate(
        new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
      );
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setDate(
        new Date(date.getFullYear(), date.getMonth() + 1, date.getDate())
      );
    }
    if (view === "week") {
      setDate(
        new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
      );
    }
    if (view === "day") {
      setDate(
        new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      );
    }
  };

  const handleToday = () => {
    setDate(new Date());
  };

  return (
    <div
      // style={{ height }}
      className="bg-green-200 rounded-xl p-6 overflow-y-auto lg:min-w-[750px] md:min-w-[500px]"
    >
      <CalendarHeader
        handlePrev={handlePrev}
        handleNext={handleNext}
        handleToday={handleToday}
        view={view}
        setView={setView}
        date={date}
      />
      {view === "month" && (
        <MonthView
          date={date}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          events={getFormattedEvents()}
        />
      )}
      {view === "week" && <WeekView />}
      {view === "day" && <DayView />}
    </div>
  );
};

export default Calendar;
