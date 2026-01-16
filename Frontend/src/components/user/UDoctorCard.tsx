interface DoctorCardType {
  name: string;
  specialization: string;
  consultationFee: number;
  location: string;
  consultationModes: string[];
}

interface UDoctorCardProps {
  doctor: DoctorCardType;
}

function UDoctorCard({ doctor }: UDoctorCardProps) {
  return <div>UDoctorCard</div>;
}

export default UDoctorCard;
