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
  FaStickyNote,
  FaLink,
} from "react-icons/fa";
import {
  IoBody,
  IoCall,
  IoChatbubble,
  IoClose,
  IoFileTray,
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
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
} from "react-icons/fa6";
import {
  BsExclamationCircleFill,
  BsFileEarmarkBarGraphFill,
  BsFillFileBarGraphFill,
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
    case "add":
      return <MdAddBox {...props} />;
    case "add-location":
      return <MdAddLocationAlt {...props} />;
    case "appointment-management":
      return <MdEventNote {...props} />;
    case "audio":
      return <IoCall {...props} />;
    case "bar-graph":
      return <BsFillFileBarGraphFill {...props} />
    case "body":
      return <IoBody {...props} />;
    case "building":
      return <FaBuilding {...props} />;
    case "burger-menu":
      return <RxHamburgerMenu {...props} />;
    case "calendar":
      return <FaCalendarAlt {...props} />;
    case "call":
      return <IoCall {...props} />;
    case "cancel":
      return <MdCancel {...props} />;
    case "certificate":
      return <PiCertificateFill {...props} />;
    case "chart-line":
      return <FaChartLine {...props} />;
    case "chat":
      return <IoChatbubble {...props} />;
    case "check-circle":
      return <FaCheckCircle {...props} />;
    case "chevron-down-outline":
      return <IoIosArrowDown {...props} />;
    case "chevron-down-solid":
      return <TiArrowSortedDown {...props} />;
    case "clipboard-list":
      return <FaClipboardList {...props} />;
    case "clinic":
      return <RiHospitalFill {...props} />;
    case "clock":
      return <FaClock {...props} />;
    case "close":
      return <IoClose {...props} />;
    case "dashboard":
      return <MdDashboard {...props} />;
    case "doctor-management":
      return <FaUserDoctor {...props} />;
    case "edit":
      return <MdEdit {...props} />;
    case "empty-tray":
      return <IoFileTray {...props} />
    case "event-note":
      return <MdEventNote {...props} />;
    case "exclamation-circle":
      return <BsExclamationCircleFill {...props} />;
    case "eye":
      return <FaEye {...props} />;
    case "eye-off":
      return <FaEyeSlash {...props} />;
    case "facebook":
      return <FaFacebook {...props} />;
    case "file-medical":
      return <FaFileMedical {...props} />;
    case "generate-report":
      return <BsFileEarmarkBarGraphFill {...props} />;
    case "graduation-cap":
      return <FaGraduationCap {...props} />;
    case "handshake":
      return <FaHandshake {...props} />;
    case "help":
      return <MdHelp {...props} />;
    case "hospital":
      return <RiHospitalFill {...props} />;
    case "hospital-management":
      return <FaHospitalAlt {...props} />;
    case "hour-glass":
      return <RiHourglassFill {...props} />;
    case "id-card":
      return <FaIdCard {...props} />;
    case "in_person":
      return <RiHospitalFill {...props} />;
    case "inbox":
      return <MdInbox {...props} />;
    case "info":
      return <FaCircleInfo {...props} />;
    case "instagram":
      return <FaInstagram {...props} />;
    case "laptop-medical":
      return <FaLaptopMedical {...props} />;
    case "left":
      return <FaAngleLeft {...props} />;
    case "linked":
      return <FaLink {...props} />
    case "linkedin":
      return <FaLinkedin {...props} />;
    case "local-hospital":
      return <MdLocalHospital {...props} />;
    case "location":
      return <FaLocationDot {...props} />;
    case "lock":
      return <FaLock {...props} />;
    case "logout":
      return <MdLogout {...props} />;
    case "map-marker":
      return <FaMapMarkerAlt {...props} />;
    case "money-bill-wave":
      return <FaMoneyBillWave {...props} />;
    case "moon":
      return <FaMoon {...props} />;
    case "notifications":
      return <MdNotifications {...props} />;
    case "on-off":
      return <IoPower {...props} />;
    case "open-sidebar":
      return <FaRightToBracket {...props} />;
    case "payout":
      return <TbMoneybag {...props} />;
    case "pills":
      return <FaPills {...props} />;
    case "profile":
      return <FaCircleUser {...props} />;
    case "refresh":
      return <HiRefresh {...props} />;
    case "right":
      return <FaAngleRight {...props} />;
    case "search":
      return <IoSearchOutline {...props} />;
    case "search-solid":
      return <FaSearch {...props} />;
    case "settings":
      return <MdSettings {...props} />;
    case "shield":
      return <FaShieldAlt {...props} />;
    case "sitemap":
      return <FaSitemap {...props} />;
    case "sort":
      return <MdSort {...props} />;
    case "specialization-management":
      return <PiListStarFill {...props} />;
    case "star":
      return <FaStar {...props} />;
    case "stethoscope":
      return <FaStethoscope {...props} />;
    case "sticky-note":
      return <FaStickyNote {...props} />;
    case "sun":
      return <FaSun {...props} />;
    case "themes":
      return <MdPalette {...props} />;
    case "tick":
      return <FaCheckCircle {...props} />;
    case "toggle-on":
      return <FaToggleOn {...props} />;
    case "transaction":
      return <FaMoneyBillTransfer {...props} />;
    case "trash":
      return <RiDeleteBinFill {...props} />;
    case "university":
      return <FaUniversity {...props} />;
    case "user":
      return <FaUser {...props} />;
    case "user-management":
      return <FaUser {...props} />;
    case "user-md":
      return <FaUserMd {...props} />;
    case "user-plus":
      return <FaUserPlus {...props} />;
    case "verification":
      return <AiFillSafetyCertificate {...props} />;
    case "video":
      return <FaVideo {...props} />;
    case "wallet":
      return <FaWallet {...props} />;
    case "x-twitter":
      return <FaXTwitter {...props} />;
    default:
      return <RxComponentPlaceholder {...props} />;
  }
};

export default getIcon;
