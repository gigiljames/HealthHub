import { useEffect, useState } from "react";
import UNavbar from "../../components/user/UNavbar";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { getSearchSuggestions } from "../../api/map/mapService";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import getIcon from "../../helpers/getIcon";
import { getPatientAppointments } from "../../api/user/bookingService";

interface LocationSuggestion {
  // name: string;
  latitude: number;
  longitude: number;
  formatted: string;
}

interface Location {
  longitude: number;
  latitude: number;
}

function UHomePage() {
  document.title = "HealthHub Home";
  const [searchText, setSearchText] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const navigate = useNavigate();

  const debouncedHandleLocationChange = useDebouncedSearch(
    handleLocationInputChange,
    300,
  );

  async function handleLocationInputChange(text: string, signal: AbortSignal) {
    const res = await getSearchSuggestions(text, signal);
    console.log(res);
    const features = res.features;
    const suggestions = features.map((feature: any) => ({
      // name: feature.properties.name,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      formatted: feature.properties.formatted,
    }));
    setSuggestions(suggestions);
  }

  useEffect(() => {
    getSpecializationList().then((response) => {
      console.log(response);
      if (response?.success) {
        setSpecializationList(response.specializations);
      }
    });

    getPatientAppointments().then((response) => {
      if (response?.success && response.appointments) {
        const pending = response.appointments.filter(
          (app: any) => app.status === "RESCHEDULE_PENDING"
        );
        setPendingRequests(pending);
      }
    }).catch(err => console.error("Failed to fetch patient appointments on home:", err));
  }, []);
  return (
    <>
      <UNavbar />
      <div className="min-h-screen pt-[70px] pb-16 bg-slate-50 dark:bg-slate-955 transition-colors">
        {pendingRequests.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 pt-6">
            <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-250 dark:border-amber-900/50 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-amber-600 dark:text-amber-500 shrink-0">
                  {getIcon("exclamation-circle", "24px")}
                </span>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-250 text-sm">
                    Action Required: Reschedule Proposed
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    You have {pendingRequests.length} appointment reschedule {pendingRequests.length === 1 ? "request" : "requests"} awaiting your approval.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (pendingRequests.length === 1) {
                    navigate(`/appointments/${pendingRequests[0]._id}`);
                  } else {
                    navigate("/appointments");
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
              >
                Review Proposed Times
              </button>
            </div>
          </div>
        )}
        {/* px-3 lg:px-20 xl:px-[15%] */}
        <div className="p-10 py-30 bg-darkGreen flex flex-col items-center">
          <div className="mb-10">
            <h1 className="text-white font-extrabold text-6xl">
              Find and book
            </h1>
          </div>
          {/* Search bar */}
          <div className="flex gap-2 w-full rounded-lg p-2 bg-slate-200 shadow-md border-1 border-inputBorder/30 max-w-300">
            <div className="flex gap-1 w-full h-[50px]">
              <div className="w-full h-full bg-white rounded-md">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-full p-3"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="w-[5px] rounded-full bg-inputBorder/20"></div>
              <div className=" bg-white w-full rounded-md">
                <select
                  className="w-full h-full capitalize text-sm md:text-[16px] outline-none bg-transparent p-3"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="">Select Specialization</option>
                  {specializationList.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[5px] rounded-full bg-inputBorder/20"></div>
              {/* Searchable select component */}
              <div className="relative w-full h-full bg-white rounded-md">
                <input
                  className="w-full h-full p-3"
                  type="text"
                  placeholder="Search"
                  value={locationText}
                  onChange={(e) => {
                    setLocationText(e.target.value);
                    debouncedHandleLocationChange(e.target.value);
                  }}
                  onClick={() => setIsOpen(true)}
                />
                {isOpen && (
                  <div className="absolute max-h-[400px] w-full border-1">
                    {suggestions.length === 0
                      ? "Couldn't find any suggestions. Enter full location."
                      : suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="hover:bg-gray-300 cursor-pointer bg-white"
                            onClick={() => {
                              setLocationText(suggestion.formatted);
                              setLocation({
                                longitude: suggestion.longitude,
                                latitude: suggestion.latitude,
                              });
                              setIsOpen(false);
                            }}
                          >
                            {suggestion.formatted}
                          </div>
                        ))}
                  </div>
                )}
              </div>
              <div className="w-[5px] rounded-full bg-inputBorder/20"></div>
              <button
                className="h-full bg-lightGreen/80 hover:bg-lightGreen transition-colors duration-200 font-semibold text-white p-2 rounded-md flex justify-center items-center min-w-[150px] md:min-w-[200px]"
                onClick={() => {
                  navigate("/doctors", {
                    state: {
                      search: searchText,
                      specialization: specialization,
                      location: location,
                    },
                  });
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Modern Premium Quick Actions Cards */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-10 text-center uppercase tracking-wider">
            Quick Actions Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Find Doctors */}
            <div 
              onClick={() => navigate("/doctors")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 hover:border-slate-350 dark:hover:border-slate-750 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-2xl flex items-center justify-center font-bold">
                  {getIcon("search-solid", "24px")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Search Doctors
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-medium">
                    Explore available clinical experts, timings, fees, and secure slots easily.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-darkGreen dark:text-emerald-400">
                <span>Find Providers</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* View Appointments */}
            <div 
              onClick={() => navigate("/appointments")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 hover:border-slate-350 dark:hover:border-slate-750 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-450 rounded-2xl flex items-center justify-center font-bold">
                  {getIcon("calendar", "24px")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-550 dark:group-hover:text-blue-450 transition-colors">
                    Consultation Visits
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-medium">
                    Manage appointments, status trackers, timings, and rejoin secure live rooms.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-darkGreen dark:text-blue-400">
                <span>My Appointments</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Medical Records */}
            <div 
              onClick={() => navigate("/medical-records")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 hover:border-slate-350 dark:hover:border-slate-750 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center font-bold">
                  {getIcon("file-medical", "24px")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                    Clinical Records
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-medium">
                    Access digital consultation summary outcomes, patient histories, and active prescriptions.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-darkGreen dark:text-purple-400">
                <span>View Records</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UHomePage;
