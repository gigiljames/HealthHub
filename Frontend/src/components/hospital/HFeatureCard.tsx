import { IoClose } from "react-icons/io5";

interface HFeatureCardProps {
  title: string | "No entry";
}

function HFeatureCard({ title }: HFeatureCardProps) {
  return (
    <>
      <div className="flex justify-between bg-pastelBlue px-4 py-3 rounded-md w-full">
        <div>
          <p className="font-bold">{title}</p>
        </div>
        <div className="flex justify-center items-center hover:rotate-90 hover:scale-110 active:scale-75 transition-all duration-300 cursor-pointer">
          <IoClose size={"20px"} />
        </div>
      </div>
    </>
  );
}

export default HFeatureCard;
