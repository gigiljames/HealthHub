interface CalendarHeaderProps {
  handlePrev: () => void;
  handleToday: () => void;
  handleNext: () => void;
  view: string;
  setView: (view: string) => void;
  date: Date;
}
import { motion } from "framer-motion";
import getIcon from "../../helpers/getIcon";

const CalendarHeader = ({
  handlePrev,
  handleToday,
  handleNext,
  view,
  setView,
  date,
}: CalendarHeaderProps) => {
  function HeaderFormattedDate(date: Date) {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between w-full relative h-fit lg:h-[50px]">
      <div className="lg:absolute top-0 left-0 flex justify-between w-full">
        <div className="w-[210px] relative h-[35px] flex items-center text-[14px] font-semibold ">
          <motion.div
            className="h-full w-[70px] bg-green-300 rounded-md absolute "
            animate={{
              left: view === "month" ? 0 : view === "week" ? "70px" : "140px",
            }}
          ></motion.div>
          <motion.button
            onClick={() => setView("month")}
            className={`w-[70px] h-[35px] z-10 hover:text-white transition-colors duration-200 ${view === "month" ? "text-white" : ""}`}
          >
            Month
          </motion.button>
          <motion.button
            onClick={() => setView("week")}
            className={`w-[70px] h-[35px] z-10 hover:text-white transition-colors duration-200 ${view === "week" ? "text-white" : ""}`}
          >
            Week
          </motion.button>
          <button
            onClick={() => setView("day")}
            className={`w-[70px] h-[35px] z-10 hover:text-white transition-colors duration-200 ${view === "day" ? "text-white" : ""}`}
          >
            Day
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* <button onClick={handleToday} className="h-[40px]">
          Today
        </button> */}
          <button className="h-[40px] bg-green-400 p-2 rounded-md text-gray-50 font-semibold">
            Create Slot
          </button>
        </div>
      </div>
      <div className="lg:absolute top-0 right-0 w-full flex justify-center lg:min-w-[500px]">
        <div className="flex items-center gap-2 z-20">
          <button
            onClick={handlePrev}
            className=" hover:bg-green-300 p-2 rounded-full"
          >
            {getIcon("left")}
          </button>
          <div className="font-bold w-[175px] text-center">
            {HeaderFormattedDate(date)}
          </div>
          <button
            onClick={handleNext}
            className=" hover:bg-green-300 p-2 rounded-full"
          >
            {getIcon("right")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
