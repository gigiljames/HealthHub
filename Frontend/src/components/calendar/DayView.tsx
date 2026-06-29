import type { CalendarEvent } from "./Calendar";

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
}

function DayView({ date, events }: DayViewProps) {
  const formattedEvents = [];
  const hourHeight = 80;
  const currDate = new Date();
  const currTime = Math.ceil(
    (currDate.getHours() * 60 + currDate.getMinutes()) * (hourHeight / 60)
  );
  for (const event of events) {
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);
    if (eventStartDate.toLocaleDateString() === date.toLocaleDateString()) {
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
      formattedEvents.push(formattedEvent);
    }
  }

  console.log(formattedEvents);

  return (
    <>
      <div>
        <div className="border-2 border-green-300 rounded-xl text-[14px] relative">
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

          {formattedEvents.map((event, index) => (
            <div
              className={`ml-[55px] mr-[5px] w-[calc(100%-60px)] rounded-md bg-green-300 z-50 absolute border-1 border-green-400`}
              style={{ top: `${event.top}px`, height: `${event.height}px` }}
              key={index}
            >
              <div className=" rounded-sm px-1 mb-1">{event.title}</div>
            </div>
          ))}
        </div>
        <div></div>
      </div>
    </>
  );
}

export default DayView;
