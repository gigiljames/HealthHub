import type { CalendarEvent } from "./Calendar";

interface WeekViewProps {
  date: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: CalendarEvent[];
}

function WeekView({
  date,
  selectedDate,
  setSelectedDate,
  events,
}: WeekViewProps) {
  let days: Record<string, { title: string; top: number; height: number }[]> =
    {};
  for (let i = 0; i < 7; i++) {
    days[
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() + i
      ).toLocaleDateString()
    ] = [];
  }
  const hourHeight = 80;
  const currDate = new Date();
  const currTime = Math.ceil(
    (currDate.getHours() * 60 + currDate.getMinutes()) * (hourHeight / 60)
  );
  for (let event of events) {
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);
    if (eventStartDate.toLocaleDateString() in days) {
      const eventStartTimeInMinutes = Math.ceil(
        (eventStartDate.getHours() * 60 + eventStartDate.getMinutes()) *
          (hourHeight / 60)
      );
      const eventEndTimeInMinutes = Math.ceil(
        (eventEndDate.getHours() * 60 + eventEndDate.getMinutes()) *
          (hourHeight / 60)
      );
      const formattedEvent = {
        title: event.title,
        top: eventStartTimeInMinutes,
        height: eventEndTimeInMinutes - eventStartTimeInMinutes,
      };
      days[eventStartDate.toLocaleDateString()].push(formattedEvent);
    }
  }

  const dates = Object.keys(days);
  const formattedEvents = Object.values(days);

  console.log(dates);

  return (
    <>
      <div>
        <div className="border-2 border-b-0 border-green-300 sticky top-0 z-60 bg-green-300 py-2">
          <div className="grid grid-cols-7 pl-[50px]">
            {dates.map((date) => (
              <div key={date} className="flex justify-center items-center">
                {date}
              </div>
            ))}
          </div>
        </div>
        <div className="border-2 border-green-300 text-[14px] relative">
          <div
            className=" mr-[5px] w-full h-[2px] bg-red-300 z-50 absolute"
            style={{ top: `${currTime}px` }}
          ></div>
          {Array.from({ length: 24 }, (_, index) => index).map((hour) => (
            <div
              className={` border-green-300 ${hour !== 23 ? "border-b-2" : ""} bg-gradient-to-t from-green-50 via-green-100 via-25% to-transparent to-90%`}
              key={hour}
              style={{ height: `${hourHeight}px` }}
            >
              <div className="flex items-start w-[50px] h-full border-r-2 border-green-300">
                <p className="pl-1 pt-1">
                  {hour.toString().padStart(2, "0")}:00
                </p>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-7 pl-[50px] z-50 absolute top-0 w-full h-full">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`${index !== 6 ? "border-r-2 border-green-300" : ""} relative`}
              >
                {formattedEvents[index].map((event, index) => (
                  <div
                    className={`rounded-md bg-green-300 z-50 absolute border-1 border-green-400 w-full text-[12px]`}
                    style={{
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                    }}
                    key={index}
                  >
                    <p className=" rounded-sm px-1 mb-1 text-ellipsis overflow-hidden">
                      {event.title}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
}
export default WeekView;
