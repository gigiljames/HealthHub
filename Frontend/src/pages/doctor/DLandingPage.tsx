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

const DLandingPage = () => {
  document.title = "HealthHub for Doctors - Smarter Practice";
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
            to="/hospital"
            className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors"
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
            to="/doctor/auth"
            className="px-6 py-2 rounded-full bg-darkGreen dark:bg-emerald-600 text-white hover:bg-normalGreen dark:hover:bg-emerald-500 transition-all duration-300 font-bold shadow-md"
          >
            Doctor Login
          </Link>
        </div>
      </nav>

      <section className="relative w-full px-5 lg:px-20 pt-24 lg:pt-40 pb-20 lg:pb-32 bg-gradient-to-br from-cardGreen to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden text-center lg:text-left transition-colors duration-300 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-block px-4 py-1 rounded-full bg-lightBlue/30 dark:bg-blue-900/30 text-darkGreen dark:text-emerald-400 font-bold text-sm tracking-wide"
            >
              FOR MODERN PRACTICES
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-extrabold text-darkGreen dark:text-emerald-400 leading-tight"
            >
              Smarter Appointments, <br />
              <span className="text-normalGreen dark:text-emerald-200">
                Safer Consultations.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0"
            >
              Manage your schedule effortlessly and access complete patient
              history before you prescribe. Reduce errors, save time, and focus
              on care.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <Link
                to="/doctor/auth"
                className="px-8 py-4 rounded-xl bg-darkGreen dark:bg-emerald-600 text-white font-bold text-lg hover:bg-normalGreen dark:hover:bg-emerald-500 transition-all shadow-lg hover:-translate-y-1"
              >
                Join as Doctor
              </Link>
              <button className="px-8 py-4 rounded-xl border-2 border-darkGreen dark:border-emerald-500 text-darkGreen dark:text-emerald-400 font-bold text-lg hover:bg-green-50 dark:hover:bg-gray-800 transition-all">
                See How It Works
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative  bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-darkGreen dark:text-emerald-400">
                    {getIcon("user-md", "24")}
                  </div>
                  <div>
                    <div className="h-2 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-2 w-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="bg-lightGreen/20 dark:bg-emerald-900/30 text-darkGreen dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                  Online
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                      {getIcon("calendar", "16")}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-2 w-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-100 dark:border-gray-500 rounded text-xs text-gray-400 dark:text-gray-300">
                      Upcoming
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-12 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700"
            >
              <div className="bg-green-100 dark:bg-emerald-900/30 p-2 rounded-full text-green-600 dark:text-emerald-400">
                {getIcon("check-circle")}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Consultation
                </p>
                <p className="font-bold text-darkGreen dark:text-emerald-400">
                  Completed
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400">
              Smart Appointment Management
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              No more double bookings or scheduling chaos. Customize your
              availability and let patients book efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "calendar",
                title: "Flexible Slots",
                desc: "Set defining working hours and break times.",
              },
              {
                icon: "location",
                title: "Hybrid Practice",
                desc: "Manage both In-Clinic and Online slots.",
              },
              {
                icon: "refresh",
                title: "Rescheduling",
                desc: "Automated alerts for changes or cancellations.",
              },
              {
                icon: "event-note",
                title: "Centralized View",
                desc: "Day, Week, and Month views at a glance.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-cardGreen dark:bg-gray-900 rounded-2xl border border-transparent hover:border-lightGreen dark:hover:border-emerald-600 transition-all group"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-darkGreen dark:text-emerald-400 text-xl mb-4 group-hover:scale-110 transition-transform">
                  {getIcon(item.icon)}
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
            <div className="mb-6">
              {getIcon(
                "laptop-medical",
                "48",
                undefined,
                "text-lightGreen dark:text-emerald-400 mb-4"
              )}
              <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400">
                Integrated Consultation Workflow
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 text-darkGreen dark:text-emerald-400">
                  {getIcon("check-circle")}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Start consultations directly from the appointment dashboard.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 text-darkGreen dark:text-emerald-400">
                  {getIcon("check-circle")}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Add clinical notes, diagnosis, and prescriptions in one
                  screen.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 text-darkGreen dark:text-emerald-400">
                  {getIcon("check-circle")}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Auto-save records to the patient's history immediately.
                </p>
              </div>
            </div>
            <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-darkGreen dark:border-emerald-500 shadow-sm">
              <p className="text-darkGreen dark:text-emerald-400 font-bold text-lg">
                "No context switching. One seamless workflow."
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 pb-2">
                <span>Patient: John Doe</span>
                <span>ID: #8392</span>
              </div>
              <div className="h-32 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Clinical Notes Area
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 dark:text-blue-400 text-sm font-bold">
                  Add Rx
                </div>
                <div className="h-10 bg-green-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-green-500 dark:text-emerald-400 text-sm font-bold">
                  Request Lab
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-darkGreen dark:bg-gray-950 text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold dark:text-white">
              Complete Patient History
            </h2>
            <p className="text-green-100 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              Make informed decisions with consent-based access to past records.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "clipboard-list",
                title: "Past Prescriptions",
                desc: "Avoid drug interactions by viewing active and past medications.",
              },
              {
                icon: "generate-report",
                title: "Lab Reports",
                desc: "Trend analysis for vitals and test results over time.",
              },
              {
                icon: "hospital-management",
                title: "Hospital Summary",
                desc: "Discharge summaries and procedure notes from other facilities.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 dark:border-gray-700"
              >
                <div className="text-lightGreen dark:text-emerald-400 text-4xl mb-6">
                  {getIcon(item.icon)}
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-green-100 dark:text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 order-2 md:order-1">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl h-[400px] w-full flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              {getIcon(
                "video",
                "100",
                undefined,
                "text-gray-300 dark:text-gray-600"
              )}
              <div className="absolute bottom-8 left-8 right-8 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 dark:text-red-400">
                  {getIcon("video")}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    Secure Consultation
                  </p>
                  <p className="text-xs text-green-600 dark:text-emerald-400">
                    Encrypted & HD Quality
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2">
            <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
              Online Consultations & Follow-ups
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Expand your practice beyond the clinic. Offer secure video
              consultations and monetize follow-ups effectively.
            </p>
            <ul className="space-y-4">
              {[
                "HD Video & Audio Calls",
                "Digital Prescription Generation",
                "Secure Chat for Minor Queries",
                "Automated Follow-up Reminders",
              ].map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium"
                >
                  <div className="text-lightGreen dark:text-emerald-400">
                    {getIcon("check-circle")}
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-cardGreen dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 rounded-full bg-white dark:bg-gray-800 shadow-md text-darkGreen dark:text-emerald-400 mb-6">
            {getIcon("handshake", "40")}
          </div>
          <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-4">
            Inter-Doctor Collaboration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10">
            Medicine is a team effort. Refer patients to specialists with full
            context, share insights securely, and coordinate care plans without
            phone tag.
          </p>
          <div className="flex justify-center gap-4">
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm font-bold text-gray-600 dark:text-gray-300">
              Seamless Referrals
            </span>
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm font-bold text-gray-600 dark:text-gray-300">
              Case Discussions
            </span>
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-4">
              Professional Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Showcase your qualifications, experience, and expertise. Build
              trust with a verified profile visible to thousands of patients.
            </p>
          </div>
          <div className="bg-gradient-to-r from-lightBlue/20 to-lightGreen/20 dark:from-blue-900/20 dark:to-emerald-900/20 p-8 rounded-3xl w-full md:w-auto flex-1 max-w-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-sm">
                {getIcon("id-card", "30")}
              </div>
              <div>
                <div className="h-4 w-32 bg-gray-400 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-2 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-5 lg:px-20 bg-gray-900 dark:bg-black text-white text-center transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6 text-lightGreen dark:text-emerald-400">
            {getIcon("lock", "32")}
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Bank-Grade Security & Compliance
          </h2>
          <p className="text-gray-400 mb-8">
            We prioritize your liability protocol. All data access is logged,
            consent-based, and encrypted. Compliant with major healthcare data
            standards.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
            <span>Audit Trails</span> • <span>Consent Enforcement</span> •{" "}
            <span>Cloud Security</span>
          </div>
        </div>
      </section>

      <section className="py-24 px-5 lg:px-20 bg-white dark:bg-gray-950 text-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-darkGreen to-normalGreen dark:from-emerald-900 dark:to-gray-900 p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to upgrade your practice?
            </h2>
            <p className="text-green-100 dark:text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Join the network of forward-thinking doctors using HealthHub to
              deliver better care.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/doctor/auth"
                className="bg-white dark:bg-emerald-500 text-darkGreen dark:text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                Register as Doctor
              </Link>
              <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                View Demo
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="py-8 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-center text-gray-400 dark:text-gray-600 text-sm transition-colors duration-300">
        <p>© {new Date().getFullYear()} HealthHub - For Doctors.</p>
      </footer>
    </div>
  );
};

export default DLandingPage;
