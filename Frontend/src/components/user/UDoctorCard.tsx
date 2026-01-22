import getIcon from "../../helpers/getIcon";

interface DoctorCardType {
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

function UDoctorCard({ doctor }: UDoctorCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 border-1 border-inputBorder p-3 rounded-xl">
      <div className="flex items-center gap-2 w-full">
        <img
          src={doctor.profileImageUrl}
          alt={doctor.name}
          className="rounded-md w-[100px] h-[100px] object-cover"
        />
        <div>
          <p className="font-semibold text-[16px]/[18px]">{doctor.name}</p>
          <p className="text-sm">{doctor.specialization}</p>
          <p className="text-xs text-gray-400">{doctor.location}</p>
        </div>
      </div>
      <div className="flex gap-2 items-center w-full">
        <div className="flex flex-col gap-1 mr-2 w-full">
          <p className="text-[11px]">Consultation Modes</p>
          <div className="flex gap-2">
            {doctor.consultationModes.map((mode) => (
              <div className="p-1.5 bg-green-100 rounded-sm text-darkGreen">
                {getIcon(mode, "16px")}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <p className="text-[11px]">Next available slot</p>
          <div className="flex gap-2">
            <div className="p-1 text-[12px] bg-green-100 rounded-sm text-darkGreen">
              {doctor.nextAvailableDate}
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
        <button className="bg-darkGreen/80 hover:bg-darkGreen transition-colors duration-200 text-white px-2 h-full max-h-[35px] py-1 rounded-md shadow-md">
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default UDoctorCard;
