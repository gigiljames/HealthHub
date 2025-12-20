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

const HLandingPage = () => {
  document.title = "HealthHub for Hospitals - Operational Excellence";
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
            to="/"
            className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors"
          >
            For Patients
          </Link>
          <Link
            to="/doctor"
            className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors"
          >
            For Doctors
          </Link>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-yellow-500 dark:text-gray-300 text-xl"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? getIcon("moon") : getIcon("sun")}
          </button>
          <Link
            to="/hospital/auth"
            className="px-6 py-2 rounded-full bg-darkGreen dark:bg-emerald-600 text-white hover:bg-normalGreen dark:hover:bg-emerald-500 transition-all duration-300 font-bold shadow-md"
          >
            Hospital Login
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
              ENTERPRISE HEALTHCARE MANAGEMENT
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-extrabold text-darkGreen dark:text-emerald-400 leading-tight"
            >
              Operational Control <br />
              <span className="text-normalGreen dark:text-emerald-200">
                & Efficiency at Scale.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0"
            >
              Centralize department management, oversee doctor performance, and
              maintain strict compliance. The all-in-one operating system for
              modern hospitals.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <Link
                to="/hospital/auth"
                className="px-8 py-4 rounded-xl bg-darkGreen dark:bg-emerald-600 text-white font-bold text-lg hover:bg-normalGreen dark:hover:bg-emerald-500 transition-all shadow-lg hover:-translate-y-1"
              >
                Onboard Your Hospital
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
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 aspect-video flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="h-2 w-32 bg-gray-100 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="flex flex-1 gap-6">
                <div className="w-1/4 space-y-3">
                  <div className="h-8 bg-lightGreen/20 dark:bg-emerald-900/30 rounded w-full"></div>
                  <div className="h-8 bg-gray-50 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-8 bg-gray-50 dark:bg-gray-700 rounded w-full"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800"></div>
                    <div className="h-24 bg-green-50 dark:bg-emerald-900/20 rounded border border-green-100 dark:border-emerald-800"></div>
                  </div>
                  <div className="h-32 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="order-2 md:order-1"
            >
              <div className="grid grid-cols-2 gap-4">
                {["Cardiology", "Neurology", "Pediatrics", "Orthopedics"].map(
                  (dept, i) => (
                    <div
                      key={i}
                      className="p-6 bg-cardGreen dark:bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-center"
                    >
                      <div className="text-darkGreen dark:text-emerald-400 text-3xl mb-2">
                        {getIcon("building")}
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-200">
                        {dept}
                      </span>
                    </div>
                  )
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="order-1 md:order-2"
            >
              <div className="text-lightGreen dark:text-emerald-400 mb-2 font-bold uppercase tracking-wider">
                Structure & Organize
              </div>
              <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
                Centralized Department Management
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Create, edit, and organize departments with ease. Assign doctors
                to specific units and maintain a clear operational hierarchy
                suitable for hospitals of any size.
              </p>
              <div className="flex gap-4 items-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-2">
                  {getIcon(
                    "check-circle",
                    undefined,
                    undefined,
                    "text-lightGreen dark:text-emerald-400"
                  )}{" "}
                  Unlimited Departments
                </span>
                <span className="flex items-center gap-2">
                  {getIcon(
                    "check-circle",
                    undefined,
                    undefined,
                    "text-lightGreen dark:text-emerald-400"
                  )}{" "}
                  Auto-Categorization
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="text-lightGreen dark:text-emerald-400 mb-2 font-bold uppercase tracking-wider">
              Growth & Scaling
            </div>
            <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
              Seamless Doctor Onboarding
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Invite top talent to join your hospital. Manage incoming requests,
              verify credentials, and approve associations with a single click.
            </p>
            <ul className="space-y-4">
              {[
                "Email invitations & secure onboarding links",
                "Credential verification workflow",
                "Digital contract acceptance",
                "Role assignment upon entry",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <div className="text-darkGreen dark:text-emerald-400">
                    {getIcon("user-plus")}
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative">
              <div className="absolute top-4 right-4 text-green-500 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-bold">
                New Request
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl">
                  {getIcon("user-md")}
                </div>
                <div>
                  <h4 className="font-bold text-lg dark:text-white">
                    Dr. Sarah Wilson
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Cardiologist • 8 Yrs Exp
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-3 bg-darkGreen dark:bg-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition">
                  Approve
                </button>
                <button className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Reject
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-darkGreen dark:bg-black text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl font-bold mb-12">Granular Doctor Control</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "toggle-on",
                title: "Active Status",
                desc: "Enable or disable doctor accounts instantly based on availability or contract status.",
              },
              {
                icon: "lock",
                title: "Independent Practice",
                desc: "Allow or disallow doctors from taking consultations outside your hospital jurisdiction.",
              },
              {
                icon: "shield",
                title: "Suspension Protocol",
                desc: "Temporarily suspend access during audits or internal investigations.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-gray-700"
              >
                <div className="text-lightGreen dark:text-emerald-400 text-4xl mb-6 mx-auto w-fit">
                  {getIcon(item.icon)}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-green-100 dark:text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="mb-4 text-darkGreen dark:text-emerald-400 text-5xl">
            {getIcon("money-bill-wave")}
          </div>
          <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
            Financial & Schedule Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mb-12">
            Set consultation fees, define appointment durations, and manage
            specific working hours for each doctor. Override defaults to
            accommodate special cases.
          </p>
          <div className="grid md:grid-cols-2 gap-6 w-full text-left">
            <div className="p-6 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-lg transition cursor-default">
              <h4 className="font-bold text-lg text-darkGreen dark:text-emerald-400 mb-2">
                Fee Structure
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set global or individual fees for OPD and Video Consultations.
              </p>
            </div>
            <div className="p-6 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-lg transition cursor-default">
              <h4 className="font-bold text-lg text-darkGreen dark:text-emerald-400 mb-2">
                Rostering
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure distinct morning/evening shifts and break times per
                doctor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-6">
              Data-Driven Decisions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Stop guessing. Gain real-time insights into your hospital's
              performance. Monitor appointment volume, doctor utilization, and
              patient retention rates.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <span className="block text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-1">
                  +40%
                </span>
                <span className="text-xs text-gray-500 uppercase font-bold">
                  Appt Efficiency
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <span className="block text-3xl font-bold text-darkGreen dark:text-emerald-400 mb-1">
                  24/7
                </span>
                <span className="text-xs text-gray-500 uppercase font-bold">
                  Visibility
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-[200px] text-gray-200 dark:text-gray-700 opacity-50">
              {getIcon("chart-line")}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-5 lg:px-20 bg-white dark:bg-gray-950 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold text-darkGreen dark:text-emerald-400 mb-4">
              Hospital Profile & Visibility
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your public presence. List your departments, showcase your
              top doctors, and build trust with a verified institutional
              profile.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-darkGreen dark:text-emerald-400 mb-4 flex items-center gap-2">
              Patient Sentiment analysis{" "}
              {getIcon("star", "24", undefined, "text-yellow-400")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Collect and moderate patient reviews. Use feedback to improve
              services while maintaining control over public perception.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-900 dark:bg-black text-gray-400 text-sm text-center">
        <div className="max-w-4xl mx-auto px-5">
          <p className="flex items-center justify-center gap-2 mb-4 uppercase tracking-widest font-bold text-gray-500">
            {getIcon("lock", "14")} Enterprise Grade Security
          </p>
          <p>
            Role-Based Access Control (RBAC) • Audit Logs • Secure Data Storage
            • HIPAA/GDPR Compliant Architecture
          </p>
        </div>
      </section>

      <section className="py-24 px-5 lg:px-20 bg-gradient-to-r from-darkGreen to-gray-900 dark:from-emerald-900 dark:to-black text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Modernize Your Hospital Operations
          </h2>
          <p className="text-green-100/80 dark:text-gray-400 text-lg mb-10">
            Join the leading healthcare network and experience the power of
            centralized management.
          </p>
          <Link
            to="/hospital/auth"
            className="inline-block bg-white text-darkGreen dark:text-black hover:bg-lightGreen transition-colors px-10 py-5 rounded-xl font-bold text-xl shadow-2xl"
          >
            Partner with HealthHub
          </Link>
        </motion.div>
      </section>

      <footer className="py-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 text-center text-gray-400 dark:text-gray-600 text-sm transition-colors duration-300">
        <p>© {new Date().getFullYear()} HealthHub - Hospital Solutions.</p>
      </footer>
    </div>
  );
};

export default HLandingPage;
