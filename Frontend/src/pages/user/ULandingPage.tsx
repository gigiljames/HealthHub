import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, type Variants } from "framer-motion";
import getIcon from "../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { toggleTheme } from "../../state/theme/themeSlice";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const ULandingPage = () => {
  document.title = "HealthHub - Your Health, Centralized";
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans overflow-x-hidden transition-colors duration-300">
      <nav
        className={`fixed top-0 z-50 w-full h-[70px] flex items-center justify-between px-5 lg:px-20 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          {isDarkMode ? (
            <img
              src="/Logo_with_text.png"
              alt="HealthHub"
              className="h-[40px] md:h-[50px] object-contain"
            />
          ) : (
            <img
              src="/Logo_with_text_black.png"
              alt="HealthHub"
              className="h-[40px] md:h-[50px] object-contain"
            />
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-500 dark:text-gray-400 font-medium">
          <Link
            to="/doctor"
            className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            For Doctors
          </Link>
          <Link
            to="/hospital"
            className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            For Hospitals
          </Link>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-yellow-500 dark:text-gray-300 text-xl"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? getIcon("moon") : getIcon("sun")}
          </button>

          <Link
            to="/auth"
            className="px-6 py-2 rounded-full border-2 border-lightGreen dark:border-emerald-500 text-darkGreen dark:text-emerald-400 hover:bg-lightGreen dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white transition-all duration-300 font-bold"
          >
            Login / Signup
          </Link>
        </div>

        <div className="md:hidden text-darkGreen dark:text-emerald-400 cursor-pointer flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="text-yellow-500 dark:text-gray-300 text-xl"
          >
            {isDarkMode ? getIcon("moon") : getIcon("sun")}
          </button>
          {getIcon("burger-menu", "30px", "currentColor")}
        </div>
      </nav>

      <section className="relative w-full px-5 lg:px-20 pt-24 lg:pt-32 pb-16 lg:pb-24 bg-cardGreen/30 dark:bg-gray-900/50 overflow-hidden transition-colors duration-300 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col gap-6"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-extrabold text-darkGreen dark:text-emerald-400 leading-tight"
            >
              Your Health, <br />
              <span className="text-normalGreen dark:text-emerald-200">
                Centralized.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-lg"
            >
              Book appointments, consult online, and manage all your medical
              records in one secure, accessible place.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row gap-4 lg:items-center transform transition-transform"
            >
              <div className="flex-1 flex items-center gap-3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-600 px-2 pb-2 lg:pb-0">
                {getIcon(
                  "search-solid",
                  undefined,
                  undefined,
                  "text-gray-400 dark:text-gray-500"
                )}
                <input
                  type="text"
                  placeholder="Doctors, clinics, etc."
                  className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-600 px-2 pb-2 lg:pb-0">
                {getIcon(
                  "stethoscope",
                  undefined,
                  undefined,
                  "text-gray-400 dark:text-gray-500"
                )}
                <select className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent cursor-pointer [&>option]:text-black">
                  <option value="">Specialization</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="general">General Physician</option>
                </select>
              </div>
              {/* <div className="flex-1 flex items-center gap-3 px-2 pb-2 lg:pb-0">
                {getIcon(
                  "map-marker",
                  undefined,
                  undefined,
                  "text-gray-400 dark:text-gray-500"
                )}
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div> */}
              <button className="bg-darkGreen dark:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-normalGreen dark:hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                Search
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex gap-4 mt-4">
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                Trusted by 10,000+ patients
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:flex justify-center"
          >
            <div className="relative w-[400px] h-[400px]">
              <div className="absolute inset-0 bg-lightGreen dark:bg-emerald-900 rounded-full opacity-20 dark:opacity-30 blur-3xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white to-cardGreen dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-green-100 dark:bg-emerald-900/50 p-3 rounded-full text-darkGreen dark:text-emerald-400">
                    {getIcon("user-md", "24")}
                  </div>
                  <div className="text-xs font-bold text-gray-400 dark:text-gray-500">
                    Upcoming
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="bg-darkGreen dark:bg-emerald-600 text-white p-4 rounded-xl text-center font-bold text-sm">
                  Appointment Confirmed
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-12 -right-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-500 dark:text-blue-400">
                  {getIcon("video")}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Video Consult
                  </p>
                  <p className="font-bold text-darkGreen dark:text-emerald-400">
                    10:00 AM
                  </p>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                className="absolute -bottom-8 -left-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700"
              >
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-500 dark:text-red-400">
                  {getIcon("check-circle")}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lab Report
                  </p>
                  <p className="font-bold text-darkGreen dark:text-emerald-400">
                    Ready
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-darkGreen dark:text-emerald-400">
              Find the Right Care
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Discover specialized doctors and book easily.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "search-solid",
                title: "Search",
                desc: "Browse by specialization, location, or hospital.",
              },
              {
                icon: "check-circle",
                title: "View Availability",
                desc: "See real-time slots for online or in-clinic visits.",
              },
              {
                icon: "event-note",
                title: "Instant Booking",
                desc: "Book instantly and manage rescheduling hassle-free.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-cardGreen dark:bg-gray-900 border border-transparent hover:border-lightGreen dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-darkGreen dark:text-emerald-400 text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {getIcon(item.icon)}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1 rounded-full bg-lightBlue/30 dark:bg-blue-900/30 text-darkGreen dark:text-emerald-400 font-bold text-sm mb-4">
              FLEXIBLE CONSULTATIONS
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
              Care on your terms.
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm text-blue-500 dark:text-blue-400 h-fit">
                  {getIcon("video", "20")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Online Video Consultation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Connect securely from home. Perfect for follow-ups and minor
                    ailments. Prescriptions are auto-saved.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm text-green-500 dark:text-emerald-400 h-fit">
                  {getIcon("local-hospital", "20")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    In-Person Hospital Visits
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Book physical slots to skip the waiting line. Your
                    consultation notes are digitized instantly.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-darkGreen dark:border-emerald-500 shadow-sm">
              <p className="text-darkGreen dark:text-emerald-400 font-medium italic">
                "Every consultation becomes part of your unified medical
                history."
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
          >
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl h-[300px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 dark:from-gray-700 dark:to-gray-800"></div>
              <div className="text-slate-300 dark:text-slate-600 text-9xl relative z-10">
                {getIcon("user-md")}
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 rounded-xl shadow-lg z-20 flex justify-between items-center border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
                    Next Appointment
                  </p>
                  <p className="font-bold text-darkGreen dark:text-emerald-400">
                    Dr. Sarah Jenkins
                  </p>
                </div>
                <span className="bg-green-100 dark:bg-emerald-900/50 text-green-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                  Confirmed
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-darkGreen dark:bg-gray-900 text-white overflow-hidden relative transition-colors duration-300">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold dark:text-white">
            One Health ID, All Records
          </h2>
          <p className="text-green-100 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Stop carrying heavy files. Access your prescriptions, lab reports,
            and scans instantly.
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 grid md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10 dark:border-gray-700"
          >
            {getIcon(
              "file-medical",
              undefined,
              undefined,
              "text-4xl text-lightGreen dark:text-emerald-400 mb-4"
            )}
            <h3 className="text-xl font-bold mb-2">Prescriptions</h3>
            <p className="text-sm text-green-100 dark:text-gray-400">
              Digital prescriptions from every doctor visit, organized
              chronologically.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10 dark:border-gray-700"
          >
            {getIcon(
              "generate-report",
              undefined,
              undefined,
              "text-4xl text-lightGreen dark:text-emerald-400 mb-4"
            )}
            <h3 className="text-xl font-bold mb-2">Lab Reports</h3>
            <p className="text-sm text-green-100 dark:text-gray-400">
              Direct integration with labs. View trends and track vitals over
              time.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg p-6 rounded-2xl border border-white/10 dark:border-gray-700"
          >
            {getIcon(
              "local-hospital",
              undefined,
              undefined,
              "text-4xl text-lightGreen dark:text-emerald-400 mb-4"
            )}
            <h3 className="text-xl font-bold mb-2">Hospital History</h3>
            <p className="text-sm text-green-100 dark:text-gray-400">
              Consultation summaries and discharge papers accessible anywhere.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-gray-800/60 px-6 py-2 rounded-full text-sm font-medium">
            {getIcon(
              "check-circle",
              undefined,
              undefined,
              "text-lightGreen dark:text-emerald-400"
            )}{" "}
            No more repeated tests. seamless interoperability.
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center">
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
              Stay on top of your treatment.
            </h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                  {getIcon("pills", "20")}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    Medication Reminders
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Timely alerts so you never miss a dose.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  {getIcon("calendar", "20")}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    Follow-up Tracking
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Automated scheduling for review consultations.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="bg-cardGreen dark:bg-gray-800/50 p-8 rounded-3xl relative overflow-hidden">
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-yellow-400 dark:border-yellow-500 flex justify-between items-center opacity-100 scale-100">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    Take Amoxicillin (500mg)
                  </span>
                  <span className="text-xs text-gray-400">09:00 AM</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-transparent flex justify-between items-center opacity-60">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    Dr. Smith Follow-up
                  </span>
                  <span className="text-xs text-gray-400">Tomorrow</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-transparent flex justify-between items-center opacity-40">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    Lab Test Due
                  </span>
                  <span className="text-xs text-gray-400">Fri</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-5 lg:px-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-darkGreen/10 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-darkGreen dark:text-emerald-400 mx-auto mb-6">
            {getIcon("shield", "30")}
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-4">
            Your Data, Your Consent
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            HealthHub is built on a foundation of privacy. Your records are
            encrypted and accessed only when
            <span className="font-bold text-darkGreen dark:text-emerald-400">
              {" "}
              you
            </span>{" "}
            grant explicit permission. Revoke access anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              {getIcon(
                "check-circle",
                undefined,
                undefined,
                "text-darkGreen dark:text-emerald-400"
              )}{" "}
              End-to-End Encryption
            </span>
            <span className="flex items-center gap-2">
              {getIcon(
                "check-circle",
                undefined,
                undefined,
                "text-darkGreen dark:text-emerald-400"
              )}{" "}
              Consent-Based Sharing
            </span>
            <span className="flex items-center gap-2">
              {getIcon(
                "check-circle",
                undefined,
                undefined,
                "text-darkGreen dark:text-emerald-400"
              )}{" "}
              Government Compliant
            </span>
          </div>
        </div>
      </section>

      <section className="py-24 px-5 lg:px-20 bg-white dark:bg-gray-950 text-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-gradient-to-br from-lightGreen/20 to-cardGreen dark:from-gray-800 dark:to-gray-900 p-10 lg:p-16 rounded-[3rem]"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
            Ready to take control?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
            Join thousands of patients experiencing the future of healthcare
            today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/auth"
              className="bg-darkGreen dark:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-normalGreen dark:hover:bg-emerald-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Create Patient Account
            </Link>
            <button className="bg-white dark:bg-transparent text-darkGreen dark:text-emerald-400 border-2 border-darkGreen dark:border-emerald-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Book First Appointment
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="py-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 text-center text-gray-400 dark:text-gray-600 text-sm transition-colors duration-300">
        <p>© {new Date().getFullYear()} HealthHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ULandingPage;
