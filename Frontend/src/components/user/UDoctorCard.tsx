import { useNavigate } from "react-router";
import { Star } from "lucide-react";
import getIcon from "../../helpers/getIcon";
import Avatar from "../common/Avatar";
import dayjs from "dayjs";

interface DoctorCardType {
  _id: string;
  name: string;
  specialization: string;
  consultationFee: number;
  location: string;
  consultationModes: string[];
  rating: number;
  nextAvailableDate: string;
  languages: string[];
  profileImageUrl: string;
}

interface UDoctorCardProps {
  doctor: DoctorCardType;
}

function formatNextAvailable(isoString: string): string {
  if (!isoString) return "No available slots";
  
  const slotDate = dayjs(isoString);
  
  const getKolkataDateString = (dateObj: Date | dayjs.Dayjs) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dateObj instanceof Date ? dateObj : dateObj.toDate());
  };

  const slotDayStr = getKolkataDateString(slotDate);
  const todayDayStr = getKolkataDateString(new Date());
  const tomorrowDayStr = getKolkataDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const timeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(slotDate.toDate());

  let dayLabel = "";
  if (slotDayStr === todayDayStr) {
    dayLabel = "Today";
  } else if (slotDayStr === tomorrowDayStr) {
    dayLabel = "Tomorrow";
  } else {
    dayLabel = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
    }).format(slotDate.toDate());
  }

  return `${dayLabel}, ${timeStr}`;
}

function UDoctorCard({ doctor }: UDoctorCardProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-2 border-1 border-inputBorder p-3 rounded-xl bg-white">
      <div className="flex items-center gap-2 w-full">
        <Avatar
          src={doctor.profileImageUrl}
          alt={doctor.name}
          className="rounded-md min-w-[100px] h-[100px] object-cover"
        />
        <div>
          <p className="font-semibold text-[16px]/[18px]">{doctor.name}</p>
          <p className="text-sm">{doctor.specialization}</p>
          {doctor.rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-amber-600">
                {doctor.rating}% Patient Experience
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{doctor.location}</p>
        </div>
      </div>
      <div className="flex gap-2 items-center w-full">
        <div className="flex flex-col gap-1 mr-2 w-full">
          <p className="text-[11px]">Consultation Modes</p>
          <div className="flex gap-2">
            {doctor.consultationModes &&
              doctor.consultationModes.map((mode) => (
                <div className="p-1.5 bg-green-100 rounded-sm text-darkGreen">
                  {getIcon(`${mode.toLowerCase()}`, "16px")}
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <p className="text-[11px]">Next available slot</p>
          <div className="flex gap-2">
            <div
              className={`p-1 text-[12px] rounded-sm ${!doctor.nextAvailableDate ? "bg-red-100 text-red-400" : "bg-green-100 text-darkGreen"}`}
            >
              {formatNextAvailable(doctor.nextAvailableDate)}
            </div>
          </div>
        </div>
      </div>
      <hr className="border-t-[1px] border-inputBorder w-full" />
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-1">
          <p className="text-[11px]">Consultation Fee</p>
          <p className="text-sm font-semibold">₹{doctor.consultationFee}</p>
        </div>
        <button
          className="bg-darkGreen/80 hover:bg-darkGreen transition-colors duration-200 text-white px-2 h-full max-h-[35px] py-1 rounded-md shadow-md flex items-center justify-center"
          onClick={() => navigate(`/doctors/${doctor._id}`)}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default UDoctorCard;
