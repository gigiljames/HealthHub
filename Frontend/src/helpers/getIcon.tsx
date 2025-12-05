import { FaCalendarAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
// import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import { RxComponentPlaceholder } from "react-icons/rx";
import { FaLocationDot } from "react-icons/fa6";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaUser } from "react-icons/fa";
import { FaRightToBracket } from "react-icons/fa6";
import { FaUserDoctor } from "react-icons/fa6";
import { FaHospitalAlt } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { PiListStarFill } from "react-icons/pi";
import { IoPower } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { MdSort } from "react-icons/md";
// import { IoSearch } from "react-icons/io5";
import { HiRefresh } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { TiArrowSortedDown } from "react-icons/ti";
import { BiSolidEditAlt } from "react-icons/bi";

const getIcon = (icon: string, size: string, color: string) => {
  switch (icon) {
    case "calendar":
      return <FaCalendarAlt size={size} color={color} />;
    case "location":
      return <FaLocationDot />;
    case "trash":
      return <RiDeleteBinFill size={size} color={color} />;
    case "close":
      return <IoClose size={size} color={color} />;
    case "edit":
      return <BiSolidEditAlt size={size} color={color} />;
    case "burger-menu":
      return <RxHamburgerMenu size={size} color={color} />;
    case "user-management":
      return <FaUser size={size} color={color} />;
    case "doctor-management":
      return <FaUserDoctor size={size} color={color} />;
    case "hospital-management":
      return <FaHospitalAlt size={size} color={color} />;
    case "appointment-management":
      return <MdEventNote size={size} color={color} />;
    case "specialization-management":
      return <PiListStarFill size={size} color={color} />;
    case "open-sidebar":
      return <FaRightToBracket size={size} color={color} />;
    case "generate-report":
      return <BsFileEarmarkBarGraphFill size={size} color={color} />;
    case "verification":
      return <AiFillSafetyCertificate size={size} color={color} />;
    case "on-off":
      return <IoPower size={size} color={color} />;
    case "profile":
      return <FaCircleUser size={size} color={color} />;
    case "sort":
      return <MdSort size={size} color={color} />;
    case "search":
      return <IoSearchOutline size={size} color={color} />;
    case "refresh":
      return <HiRefresh size={size} color={color} />;
    case "left":
      return <FaAngleLeft size={size} color={color} />;
    case "right":
      return <FaAngleRight size={size} color={color} />;
    case "add":
      return <MdAddBox size={size} color={color} />;
    case "arrow-down":
      return <TiArrowSortedDown size={size} color={color} />;
    default:
      return <RxComponentPlaceholder />;
  }
};

export default getIcon;
