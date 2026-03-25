import {
  FaCalendarAlt,
  FaSearch,
  FaMapMarkerAlt,
  FaStethoscope,
  FaVideo,
  FaUserMd,
  FaFileMedical,
  FaPills,
  FaShieldAlt,
  FaCheckCircle,
  FaSun,
  FaMoon,
  FaUser,
  FaWallet,
  FaHospitalAlt,
  FaLaptopMedical,
  FaClipboardList,
  FaHandshake,
  FaLock,
  FaIdCard,
  FaBuilding,
  FaSitemap,
  FaUserPlus,
  FaToggleOn,
  FaChartLine,
  FaStar,
  FaMoneyBillWave,
  FaUniversity,
  FaGraduationCap,
  FaEye,
  FaEyeSlash,
  FaClock,
} from "react-icons/fa";
import {
  IoCall,
  IoChatbubble,
  IoClose,
  IoPower,
  IoSearchOutline,
} from "react-icons/io5";
import {
  MdEdit,
  MdEventNote,
  MdSort,
  MdAddBox,
  MdLocalHospital,
  MdLogout,
  MdAddLocationAlt,
  MdCancel,
  MdDashboard,
  MdInbox,
  MdNotifications,
  MdSettings,
  MdHelp,
  MdPalette,
} from "react-icons/md";
import {
  RiDeleteBinFill,
  RiHospitalFill,
  RiHourglassFill,
} from "react-icons/ri";
import { RxComponentPlaceholder, RxHamburgerMenu } from "react-icons/rx";
import {
  FaLocationDot,
  FaRightToBracket,
  FaUserDoctor,
  FaCircleUser,
  FaAngleLeft,
  FaAngleRight,
  FaCircleInfo,
  FaMoneyBillTransfer,
} from "react-icons/fa6";
import {
  BsExclamationCircleFill,
  BsFileEarmarkBarGraphFill,
} from "react-icons/bs";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { PiCertificateFill, PiListStarFill } from "react-icons/pi";
import { HiRefresh } from "react-icons/hi";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoIosArrowDown } from "react-icons/io";
import { TbMoneybag } from "react-icons/tb";
// import { BiSolidEditAlt } from "react-icons/bi";

const getIcon = (
  icon: string,
  size?: string,
  color?: string,
  className?: string,
) => {
  const props = { size, color, className };

  switch (icon) {
    case "add-location":
      return <MdAddLocationAlt {...props} />;
    case "calendar":
      return <FaCalendarAlt {...props} />;
    case "location":
      return <FaLocationDot {...props} />;
    case "trash":
      return <RiDeleteBinFill {...props} />;
    case "close":
      return <IoClose {...props} />;
    case "call":
      return <IoCall {...props} />;
    case "clock":
      return <FaClock {...props} />;
    case "audio":
      return <IoCall {...props} />;
    case "cancel":
      return <MdCancel {...props} />;
    case "clinic":
      return <RiHospitalFill {...props} />;
    case "in_person":
      return <RiHospitalFill {...props} />;
    case "chat":
      return <IoChatbubble {...props} />;
    case "certificate":
      return <PiCertificateFill {...props} />;
    case "edit":
      return <MdEdit {...props} />;
    case "exclamation-circle":
      return <BsExclamationCircleFill {...props} />;
    case "graduation-cap":
      return <FaGraduationCap {...props} />;
    case "hour-glass":
      return <RiHourglassFill {...props} />;
    case "info":
      return <FaCircleInfo {...props} />;
    case "burger-menu":
      return <RxHamburgerMenu {...props} />;
    case "user-management":
      return <FaUser {...props} />;
    case "doctor-management":
      return <FaUserDoctor {...props} />;
    case "hospital-management":
      return <FaHospitalAlt {...props} />;
    case "appointment-management":
      return <MdEventNote {...props} />;
    case "specialization-management":
      return <PiListStarFill {...props} />;
    case "open-sidebar":
      return <FaRightToBracket {...props} />;
    case "generate-report":
      return <BsFileEarmarkBarGraphFill {...props} />;
    case "verification":
      return <AiFillSafetyCertificate {...props} />;
    case "on-off":
      return <IoPower {...props} />;
    case "profile":
      return <FaCircleUser {...props} />;
    case "sort":
      return <MdSort {...props} />;
    case "search":
      return <IoSearchOutline {...props} />;
    case "refresh":
      return <HiRefresh {...props} />;
    case "left":
      return <FaAngleLeft {...props} />;
    case "right":
      return <FaAngleRight {...props} />;
    case "add":
      return <MdAddBox {...props} />;
    case "search-solid":
      return <FaSearch {...props} />;
    case "map-marker":
      return <FaMapMarkerAlt {...props} />;
    case "stethoscope":
      return <FaStethoscope {...props} />;
    case "video":
      return <FaVideo {...props} />;
    case "user-md":
      return <FaUserMd {...props} />;
    case "file-medical":
      return <FaFileMedical {...props} />;
    case "pills":
      return <FaPills {...props} />;
    case "shield":
      return <FaShieldAlt {...props} />;
    case "check-circle":
      return <FaCheckCircle {...props} />;
    case "sun":
      return <FaSun {...props} />;
    case "moon":
      return <FaMoon {...props} />;
    case "local-hospital":
      return <MdLocalHospital {...props} />;
    case "hospital":
      return <RiHospitalFill {...props} />;
    case "logout":
      return <MdLogout {...props} />;
    case "event-note":
      return <MdEventNote {...props} />;
    case "laptop-medical":
      return <FaLaptopMedical {...props} />;
    case "clipboard-list":
      return <FaClipboardList {...props} />;
    case "handshake":
      return <FaHandshake {...props} />;
    case "lock":
      return <FaLock {...props} />;
    case "id-card":
      return <FaIdCard {...props} />;
    case "building":
      return <FaBuilding {...props} />;
    case "sitemap":
      return <FaSitemap {...props} />;
    case "user-plus":
      return <FaUserPlus {...props} />;
    case "toggle-on":
      return <FaToggleOn {...props} />;
    case "transaction":
      return <FaMoneyBillTransfer {...props} />;
    case "chart-line":
      return <FaChartLine {...props} />;
    case "star":
      return <FaStar {...props} />;
    case "money-bill-wave":
      return <FaMoneyBillWave {...props} />;
    case "chevron-down-solid":
      return <TiArrowSortedDown {...props} />;
    case "chevron-down-outline":
      return <IoIosArrowDown {...props} />;
    case "payout":
      return <TbMoneybag {...props} />;
    case "tick":
      return <FaCheckCircle {...props} />;
    case "university":
      return <FaUniversity {...props} />;
    case "eye":
      return <FaEye {...props} />;
    case "eye-off":
      return <FaEyeSlash {...props} />;
    case "user":
      return <FaUser {...props} />;
    case "wallet":
      return <FaWallet {...props} />;
    case "dashboard":
      return <MdDashboard {...props} />;
    case "inbox":
      return <MdInbox {...props} />;
    case "notifications":
      return <MdNotifications {...props} />;
    case "settings":
      return <MdSettings {...props} />;
    case "help":
      return <MdHelp {...props} />;
    case "themes":
      return <MdPalette {...props} />;
    default:
      return <RxComponentPlaceholder {...props} />;
  }
};

export default getIcon;
