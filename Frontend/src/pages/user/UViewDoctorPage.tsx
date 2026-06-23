import UNavbar from "../../components/user/UNavbar";
import UGuestNavbar from "../../components/user/UGuestNavbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DraggableMarkerMap from "../../components/common/DraggableMarkerMap";
import { days, months } from "../../constants/dateAndTime";
import { useParams, useNavigate } from "react-router";
import { getPublicDoctorProfile } from "../../api/doctor/doctorService";
import type { Gender } from "../../enums/gender";
import type { DoctorEducation } from "../../types/doctorEducationType";
import type { DoctorExperience } from "../../types/doctorExperienceType";
import type { PopulatedPracticeLocation } from "../../types/populatedPracticeLocation";
import type { Slot } from "../../state/doctor/dSlotSlice";
import type { PracticeType } from "../../enums/practiceType";
import DNavbar from "../../components/doctor/DNavbar";
import { PracticeLocationType } from "../../enums/practiceLocationType";
// import UDoctorCalendar from "../../components/user/UDoctorCalendar";
import getIcon from "../../helpers/getIcon";
import Footer from "../../components/common/Footer";
import Avatar from "../../components/common/Avatar";
import BannerImage from "../../components/common/BannerImage";
import { getPublicDoctorReviews } from "../../api/reviewApi";
import { Star } from "lucide-react";

export interface GetDoctorPublicProfileDTO {
  id: string;
  name: string;
  specialization: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  gender: Gender;
  contactEmail: string;
  contactPhone: string;
  languages: string[];
  education: DoctorEducation[];
  experience: DoctorExperience[];
  about: string;
  practiceLocations: PopulatedPracticeLocation[];
  slots: { [practiceLocationId: string]: any };
  practiceType: PracticeType;
  rating?: number;
  reviewCount?: number;
}

function UViewDoctorPage() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState<GetDoctorPublicProfileDTO>();
  const token = useSelector((state: RootState) => state.token.token);
  const role = useSelector((state: RootState) => state.token.role);
  // const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<number[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewAboutButton, setViewAboutButton] = useState(false);
  const [currSlots, setCurrSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedPracticeLocation, setSelectedPracticeLocation] =
    useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<"online" | "in-person" | "">(
    "",
  );
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState<number>(0);
  const [reviewsPage, setReviewsPage] = useState<number>(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState<number>(1);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (doctorId) {
      setReviewsLoading(true);
      getPublicDoctorReviews(doctorId, reviewsPage, 5)
        .then((res) => {
          if (res.success && res.data) {
            setReviews(res.data.reviews || []);
            setReviewsTotal(res.data.total || 0);
            setReviewsTotalPages(res.data.totalPages || 1);
          }
        })
        .catch((err) => console.error("Failed to fetch public doctor reviews", err))
        .finally(() => setReviewsLoading(false));
    }
  }, [doctorId, reviewsPage]);

  useEffect(() => {
    if (doctorId) {
      getPublicDoctorProfile(doctorId)
        .then((res) => {
          if (!res?.doctor) {
            navigate("/404");
            return;
          }
          console.log(res);
          const doc = res.doctor;
          setDoctor(doc);
          setViewAboutButton(doc.about?.length > 200);

          // Auto-select the first practice location by default
          if (doc.practiceLocations && doc.practiceLocations.length > 0) {
            const firstLoc = doc.practiceLocations[0];
            setSelectedPracticeLocation(firstLoc);

            if (firstLoc.type === PracticeLocationType.ONLINE) {
              // setMapLocation([-91, 91]);
            } else {
              setMapLocation(firstLoc.location?.coordinates ?? [-91, 91]);
            }

            const slots = doc.slots[firstLoc._id] || [];
            setCurrSlots(slots);

            if (
              firstLoc.consultationModes &&
              firstLoc.consultationModes.length > 0
            ) {
              const firstMode = firstLoc.consultationModes[0] as string;
              if (firstMode === "IN_PERSON") {
                setSelectedMode("in-person");
              } else {
                setSelectedMode("online");
              }
            }
          }
        })
        .catch((err: any) => {
          if (err.response?.status === 403) {
            navigate("/403");
          } else {
            navigate("/404");
          }
        });
    }
  }, [doctorId, navigate]);

  function handleSelectPracticeLocation(id: string) {
    setSelectedDate(null);
    setSelectedSlot("");
    const pLoc = doctor?.practiceLocations.find((loc) => loc._id === id);
    setSelectedPracticeLocation(pLoc);
    if (pLoc) {
      setMapLocation(pLoc.location?.coordinates ?? [-91, 91]);
    }
    const slots = doctor?.slots[id] || [];
    setCurrSlots(slots);

    // Auto-select the first consultation mode by default
    if (pLoc && pLoc.consultationModes && pLoc.consultationModes.length > 0) {
      const firstMode = pLoc.consultationModes[0] as string;
      if (firstMode === "IN_PERSON") {
        setSelectedMode("in-person");
      } else {
        setSelectedMode("online");
      }
    } else {
      setSelectedMode("");
    }
  }

  return (
    <>
      <div className="bg-[#F5F7FA] dark:bg-gray-950 min-h-screen pt-[70px] pb-20 transition-colors duration-300">
        {token && role === "user" ? (
          <UNavbar />
        ) : token && role === "doctor" ? (
          <DNavbar />
        ) : (
          <UGuestNavbar />
        )}
        {/* <UDoctorCalendar
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          doctorId={doctorId!}
          practiceLocations={doctor?.practiceLocations || []}
        /> */}

        <div className="flex justify-center w-full">
          <div className="w-full xl:w-[90%] 2xl:w-[80%] py-6 px-4 md:px-6 flex flex-col gap-6 font-sans">
            {/* Back Button */}
            <div
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer w-fit transition-colors mb-2"
              onClick={() => navigate(-1)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              <span className="font-semibold text-sm">Back</span>
            </div>

            <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Column - Doctor Details */}
              <div className="w-full lg:w-[65%] flex flex-col gap-6">
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300 w-full">
                  <div className="w-full relative h-[160px] md:h-[220px]">
                    <BannerImage
                      className="w-full h-full object-cover"
                      src={doctor?.bannerImageUrl}
                      alt={`${doctor?.name} Banner`}
                    />
                    <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-8 p-1.5 bg-white dark:bg-gray-900 rounded-full shadow-md">
                      <Avatar
                        className="w-24 h-24 md:w-32 md:h-32 object-cover bg-slate-300 rounded-full border-4 border-white dark:border-gray-900"
                        src={doctor?.profileImageUrl}
                        alt={doctor?.name}
                      />
                    </div>
                  </div>

                  <div className="w-full pt-16 md:pt-20 px-6 md:px-8 pb-6 flex flex-col md:flex-row gap-6 md:gap-3 justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {doctor?.name}
                      </h1>
                      <p className="text-base md:text-lg font-medium text-darkGreen dark:text-emerald-400 mb-3">
                        {doctor?.specialization}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 justify-end md:items-end">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-darkGreen dark:text-emerald-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.08-7.074-6.974l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                        <span className="font-semibold">
                          {doctor?.contactPhone}
                        </span>
                      </div>
                      {doctor?.contactEmail && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-darkGreen dark:text-emerald-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                            />
                          </svg>
                          <span className="font-semibold">
                            {doctor?.contactEmail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* About */}
                {doctor?.about && (
                  <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      About
                    </h3>
                    <p
                      className={`text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl whitespace-pre-line ${viewAboutButton ? "line-clamp-4" : ""}`}
                    >
                      {doctor?.about}
                    </p>
                    {(doctor?.about?.length || 0) > 200 && (
                      <button
                        className="mt-4 text-darkGreen dark:text-emerald-400 hover:text-green-800 dark:hover:text-emerald-300 font-bold text-sm tracking-wide transition-colors hover:underline"
                        onClick={() => setViewAboutButton(!viewAboutButton)}
                      >
                        {viewAboutButton ? "READ MORE" : "READ LESS"}
                      </button>
                    )}
                  </div>
                )}

                {/* Location Map */}
                {selectedMode !== "online" && selectedPracticeLocation && (
                  <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Location Map
                    </h3>
                    <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      {mapLocation === null ? (
                        <div className="flex items-center justify-center p-12 text-gray-500 font-medium text-sm text-center">
                          Select a practice location to view on map
                        </div>
                      ) : mapLocation[0] === -91 && mapLocation[1] === 91 ? (
                        <div className="flex items-center justify-center p-12 text-gray-500 font-medium text-sm text-center">
                          Online consultation - No physical location
                        </div>
                      ) : (
                        <DraggableMarkerMap
                          initialLatLong={{
                            lng: mapLocation[0],
                            lat: mapLocation[1],
                          }}
                          height={"350px"}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Experience */}
                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm flex flex-col gap-5 h-full">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">
                    Experience
                  </h3>
                  <div className="flex flex-col gap-5">
                    {doctor?.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-1.5 relative pl-4 border-l-2 border-darkGreen/30 dark:border-emerald-500/30"
                      >
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-darkGreen dark:bg-emerald-500 -left-[6px] top-1.5"></div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {exp.designation}
                        </p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm leading-tight">
                          {exp.hospital} • {exp.location}
                        </p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                          {months[exp.startDate.month]} {exp.startDate.year} -{" "}
                          {exp.present
                            ? "Present"
                            : `${months[exp.endDate!.month]} ${exp.endDate?.year}`}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                    {(!doctor?.experience ||
                      doctor.experience.length === 0) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          No experience details available
                        </p>
                      )}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm flex flex-col gap-5 h-full">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">
                    Education
                  </h3>
                  <div className="flex flex-col gap-5">
                    {doctor?.education.map((edu, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-1.5 relative pl-4 border-l-2 border-darkGreen/30 dark:border-emerald-500/30"
                      >
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-darkGreen dark:bg-emerald-500 -left-[6px] top-1.5"></div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {edu.institution}
                        </p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm leading-tight">
                          {edu.title}
                        </p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                          Graduation year - {edu.graduationYear}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                    {(!doctor?.education || doctor.education.length === 0) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        No education details available
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-105 dark:border-gray-800 pb-4 gap-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Star className="w-5.5 h-5.5 fill-amber-400 text-amber-400" />
                      <span>Ratings & Reviews</span>
                    </h3>
                    {doctor?.rating && doctor.rating > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                          <span className="text-2xl font-black text-amber-600 dark:text-amber-450">{doctor.rating}%</span>
                          <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-450 uppercase tracking-wider">Patient Experience</span>
                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">{doctor.reviewCount} total reviews</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {reviewsLoading ? (
                    <div className="flex justify-center py-10">
                      <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-slate-50/50 dark:bg-slate-805/20 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-700/50 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={rev.patientProfileImage}
                                alt={rev.patientName || "Patient"}
                                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                                  {rev.patientName}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                  {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                {rev.score}%
                              </span>
                            </div>
                          </div>

                          {rev.comment && (
                            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium mt-1">
                              "{rev.comment}"
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Pagination Controls */}
                      {reviewsTotalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-105 dark:border-slate-800 pt-4 mt-2">
                          <button
                            onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                            disabled={reviewsPage === 1}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${reviewsPage === 1
                              ? "text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed"
                              : "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                          >
                            Previous
                          </button>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Page {reviewsPage} of {reviewsTotalPages}
                          </span>
                          <button
                            onClick={() => setReviewsPage((p) => Math.min(reviewsTotalPages, p + 1))}
                            disabled={reviewsPage === reviewsTotalPages}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${reviewsPage === reviewsTotalPages
                              ? "text-slate-400 dark:text-slate-600 border-slate-105 dark:border-slate-800 cursor-not-allowed"
                              : "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 border border-dashed border-gray-250 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-805/20">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        No reviews yet for Dr. {doctor?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Appointment Booking */}
              <div className="w-full lg:w-[35%] flex flex-col gap-6 sticky top-[100px] h-fit">
                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-4">
                    Book Appointment
                  </h2>

                  {doctor?.practiceLocations &&
                    doctor.practiceLocations.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {/* Location Select */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Practice Location
                        </label>
                        <div className="relative">
                          <select
                            value={selectedPracticeLocation?._id || ""}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200 appearance-none font-medium"
                            onChange={(e) =>
                              handleSelectPracticeLocation(e.target.value)
                            }
                          >
                            <option value="">Select Location</option>
                            {doctor.practiceLocations.map((location, index) => (
                              <option key={index} value={location._id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Mode Select */}
                      {selectedPracticeLocation &&
                        selectedPracticeLocation.consultationModes && (
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Consultation Mode
                            </label>
                            {(() => {
                              const modes =
                                selectedPracticeLocation.consultationModes as string[];
                              const hasInPerson = modes.includes("IN_PERSON");
                              const onlineModesList = modes.filter((m) =>
                                ["AUDIO", "VIDEO", "CHAT"].includes(m),
                              );
                              const hasOnline = onlineModesList.length > 0;

                              return (
                                <div className="flex flex-col gap-3">
                                  {hasInPerson && hasOnline && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div
                                        className={`flex justify-center items-center py-2.5 px-4 rounded-xl cursor-pointer transition-all ${selectedMode === "in-person" ? "bg-darkGreen text-white shadow-md border border-darkGreen" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
                                        onClick={() => {
                                          setSelectedMode("in-person");
                                          setSelectedSlot("");
                                        }}
                                      >
                                        <span className="font-semibold text-sm">
                                          Offline
                                        </span>
                                      </div>
                                      <div
                                        className={`flex justify-center items-center py-2.5 px-4 rounded-xl cursor-pointer transition-all ${selectedMode === "online" ? "bg-darkGreen text-white shadow-md border border-darkGreen" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
                                        onClick={() => {
                                          setSelectedMode("online");
                                          setSelectedSlot("");
                                        }}
                                      >
                                        <span className="font-semibold text-sm">
                                          Online
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {hasInPerson && !hasOnline && (
                                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                      Only offline consultation available here.
                                    </div>
                                  )}

                                  {hasOnline && !hasInPerson && (
                                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                      Only online consultation available here.
                                    </div>
                                  )}

                                  {selectedMode === "online" &&
                                    onlineModesList.length > 0 && (
                                      <div className="mt-1 flex flex-col gap-2">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                          Online Formats Supported
                                        </span>
                                        <div className="flex gap-2 flex-wrap">
                                          {onlineModesList.map((m) => (
                                            <div
                                              key={m}
                                              className="px-2.5 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md text-darkGreen dark:text-emerald-400 flex items-center gap-1.5 border border-green-200 dark:border-green-800/50 shadow-sm"
                                            >
                                              {getIcon(m.toLowerCase(), "16px")}
                                              <span className="text-xs font-bold leading-none">
                                                {m.charAt(0).toUpperCase() +
                                                  m.slice(1).toLowerCase()}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      {/* Availability */}
                      {selectedPracticeLocation && selectedMode && (
                        <div className="flex flex-col gap-4">
                          {currSlots && Object.keys(currSlots).length > 0 ? (
                            <>
                              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Availability
                                </label>
                              </div>

                              {(() => {
                                const hasAnyAvailableSlotsForMode =
                                  Object.values(currSlots).some(
                                    (slotsOfDay: any) =>
                                      slotsOfDay.some(
                                        (slot: any) =>
                                          slot.mode === selectedMode &&
                                          (!slot.lockedUntil ||
                                            new Date(slot.lockedUntil) <=
                                            new Date()),
                                      ),
                                  );

                                if (!hasAnyAvailableSlotsForMode) {
                                  return (
                                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/30 gap-3 text-center">
                                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        No {selectedMode} slots available in the
                                        next few days
                                      </p>
                                      <button
                                        className="text-sm font-bold text-darkGreen dark:text-emerald-400 hover:underline transition-colors"
                                        onClick={() =>
                                          navigate(`/doctors/${doctorId}/slots`)
                                        }
                                      >
                                        View deeper calendar
                                      </button>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-1">
                                      {Object.keys(currSlots).map(
                                        (date, index) => {
                                          const dateObj = new Date(date);
                                          const isSelected =
                                            selectedDate === date;
                                          return (
                                            <div
                                              key={index}
                                              className={`flex flex-col justify-center items-center py-2 rounded-xl transition-all cursor-pointer ${isSelected ? "bg-darkGreen text-white shadow-md border border-darkGreen" : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                              onClick={() => {
                                                setSelectedDate(date);
                                                setSelectedSlot("");
                                              }}
                                            >
                                              <span
                                                className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-green-100" : "text-gray-500 dark:text-gray-400"}`}
                                              >
                                                {days[dateObj.getDay()]}
                                              </span>
                                              <span className="text-xl font-bold leading-tight">
                                                {dateObj.getDate()}
                                              </span>
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>

                                    {/* Slots Grid */}
                                    {selectedDate &&
                                      (currSlots as any)[selectedDate]?.length >
                                      0 ? (
                                      <div className="grid grid-cols-3 gap-2">
                                        {(
                                          (currSlots as any)[
                                          selectedDate
                                          ] as any[]
                                        )
                                          .filter(
                                            (slot) =>
                                              slot.mode === selectedMode,
                                          )
                                          .map((slot: any, index: number) => {
                                            const isAvailable =
                                              (slot.status === "AVAILABLE" ||
                                                slot.status === "LOCKED") &&
                                              (!slot.lockedUntil ||
                                                new Date(slot.lockedUntil) <=
                                                new Date());
                                            const slotId = slot.id || slot._id;
                                            const isSelected =
                                              selectedSlot === slotId;

                                            return (
                                              <div
                                                key={index}
                                                className={`flex justify-center items-center py-2 rounded-lg transition-all ${!isAvailable
                                                  ? "bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-default opacity-60"
                                                  : isSelected
                                                    ? "bg-darkGreen text-white shadow-md border-darkGreen"
                                                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:border-darkGreen dark:hover:border-emerald-500 hover:bg-green-50 dark:hover:bg-emerald-900/20"
                                                  }`}
                                                onClick={() => {
                                                  if (isAvailable)
                                                    setSelectedSlot(slotId);
                                                }}
                                              >
                                                <span
                                                  className={`text-sm ${!isAvailable ? "" : "font-bold"}`}
                                                >
                                                  {new Date(
                                                    slot.start,
                                                  ).toLocaleTimeString(
                                                    "en-US",
                                                    {
                                                      hour: "numeric",
                                                      minute: "numeric",
                                                    },
                                                  )}
                                                </span>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    ) : selectedDate ? (
                                      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-center">
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                          No {selectedMode} slots on this date
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-center">
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                          Choose a date to view slots
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </>
                          ) : (
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-center">
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                No slots loaded for this location
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5 mt-2">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              Consultation fee
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ₹{selectedPracticeLocation?.consultationFee}
                            </span>
                          </div>
                        </div>
                      )}

                      {!selectedMode && selectedPracticeLocation && (
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800/50 text-center">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                            Please select a consultation mode above
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 pt-2">
                        <button
                          onClick={() => {
                            if (!selectedSlot) {
                              toast.error("Select a slot to book an appointment");
                              return;
                            }
                            if (!(token && role)) {
                              navigate("/login")
                            } else {
                              navigate(
                                `/doctors/${doctorId}/book/${selectedSlot}`,
                              );
                            }
                          }}
                          className="w-full bg-darkGreen hover:bg-green-800 transition-colors text-white py-3.5 rounded-xl font-bold text-base shadow-sm cursor-pointer"
                        >
                          Book Appointment
                        </button>
                        <button
                          onClick={() => navigate(`/doctors/${doctorId}/slots`)}
                          className="w-full bg-white dark:bg-transparent text-darkGreen dark:text-emerald-400 border-2 border-darkGreen dark:border-emerald-500 py-3 rounded-xl font-bold hover:bg-green-50 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          View All Slots
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-center">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        This doctor hasn't added practice locations yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UViewDoctorPage;
