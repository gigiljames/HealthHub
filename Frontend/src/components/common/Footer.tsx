import { Link } from "react-router";
import getIcon from "../../helpers/getIcon";

const Footer = () => {
  return (
    <footer className="bg-[#242424]  transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 lg:px-20 py-16 text-gray-400">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm lg:text-base">
          <div className="flex flex-col gap-5">
            <Link to="/" className="inline-block">
              <img
                src="/Logo_with_text.png"
                alt="HealthHub"
                className="h-[35px] md:h-[45px] object-contain"
              />
            </Link>
            <p className="leading-relaxed text-gray-400">
              Your comprehensive platform for modern healthcare. Book
              appointments, manage health records, and consult online with top
              medical professionals securely.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-100 mb-6">
              For Patients
            </h3>
            <ul className="flex flex-col gap-4 font-medium">
              <li>
                <Link
                  to="/doctors"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Video Consultation
                </Link>
              </li>
              <li>
                <Link
                  to="/records"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Manage Records
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-100 mb-6">
              For Doctors
            </h3>
            <ul className="flex flex-col gap-4 font-medium">
              <li>
                <Link
                  to="/doctor"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  HealthHub for Doctors
                </Link>
              </li>
              <li>
                <Link
                  to="/doctor/signup"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Join the Network
                </Link>
              </li>
              <li>
                <Link
                  to="/doctor/login"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Doctor Login
                </Link>
              </li>
              <li>
                <Link
                  to="/doctor"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Practice Management
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-100 mb-6">
              Support & Legal
            </h3>
            <ul className="flex flex-col gap-4 font-medium">
              <li>
                <Link
                  to="/"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium">
          <p className="text-gray-500">
            © {new Date().getFullYear()} HealthHub. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
            >
              {getIcon("facebook", "20")}
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
            >
              {getIcon("instagram", "20")}
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
            >
              {getIcon("x-twitter", "20")}
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
            >
              {getIcon("linkedin", "20")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
