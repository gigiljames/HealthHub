import UDoctorCard from "../../components/user/UDoctorCard";
import { getSearchSuggestions } from "../../api/map/mapService";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { useEffect, useState, useRef } from "react";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";
import getIcon from "../../helpers/getIcon";
import { useLocation } from "react-router";
import Footer from "../../components/common/Footer";

interface LocationSuggestion {
  latitude: number;
  longitude: number;
  formatted: string;
}

interface Location {
  longitude: number;
  latitude: number;
}

function UDoctorsPage() {
  const loc = useLocation();
  const passedValues = loc.state;

  const [searchText, setSearchText] = useState(passedValues?.search || "");
  const [locationText, setLocationText] = useState(passedValues?.locationText || "");
  const [location, setLocation] = useState<Location | null>(passedValues?.location || null);
  const [specialization, setSpecialization] = useState(passedValues?.specialization || "");

  const [doctors, setDoctors] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("");
  const [specializationList, setSpecializationList] = useState<any[]>([]);

  // Filter states
  const [consultationModes, setConsultationModes] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  const debouncedHandleLocationChange = useDebouncedSearch(
    handleLocationInputChange,
    300,
  );

  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getSpecializationList().then((response) => {
      if (response?.success) {
        setSpecializationList(response.specializations);
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, location, specialization, sort, consultationModes, consultationFee]);

  async function fetchDoctors(
    pageNum: number,
    reset: boolean = false,
  ) {
    setLoading(true);
    try {
      const { getPublicDoctors } = await import(
        "../../api/doctor/doctorService"
      );
      const response = await getPublicDoctors(
        searchText,
        sort,
        pageNum,
        10,
        location ? [location.longitude, location.latitude] : [],
        consultationModes,
        languages,
        gender,
        specialization,
        consultationFee,
      );

      if (response?.success) {
        if (reset) {
          setDoctors(response.doctors || []);
        } else {
          setDoctors((prev) => [...prev, ...(response.doctors || [])]);
        }
        setTotalCount(response.totalDocumentCount || 0);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    if (doctors.length < totalCount) {
      fetchDoctors(page + 1, false);
    }
  }

  function handleApplyFilters() {
    fetchDoctors(1, true);
  }

  function handleResetFilters() {
    setConsultationModes([]);
    setLanguages([]);
    setGender("");
    setConsultationFee("");
    setSpecialization("");
    setSearchText("");
    setLocationText("");
    setLocation(null);
  }

  function handleConsultationModeChange(mode: string) {
    setConsultationModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  async function handleLocationInputChange(text: string, signal: AbortSignal) {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    const res = await getSearchSuggestions(text, signal);
    const features = res.features;
    const suggestions = features.map((feature: any) => ({
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      formatted: feature.properties.formatted,
    }));
    setSuggestions(suggestions);
  }

  return (
    <>
      <div className="w-full min-h-screen overflow-y-auto bg-gray-100 text-gray-800 font-sans">
        <section className="w-full pb-12 pt-20 min-h-full flex flex-col items-center ">
          <div className="w-full px-20 flex flex-col gap-6 ">
            {/* Page Header */}
            <div className="w-full pt-4 pb-2">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Find the right doctor for your needs
              </h1>
              <p className="text-sm md:text-base text-gray-500 font-medium">
                Book appointments with top doctors in your area.
              </p>
            </div>

            {/* Top Search Bar */}
            <div className="w-full sticky top-[72px] lg:top-[88px] z-20">
              <div className="w-full p-2 bg-white rounded-2xl border-1 border-gray-200 flex flex-col lg:flex-row gap-2">
                <div className="flex-1 h-[50px] relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    {getIcon("search", "20px")}
                  </div>
                  <input
                    type="text"
                    placeholder="Search doctors, symptoms..."
                     className="w-full h-full pl-10 pr-10 bg-gray-50 rounded-xl border-1 border-gray-100 outline-none"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  {searchText && (
                    <button
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      onClick={() => setSearchText("")}
                    >
                      {getIcon("close", "20px")}
                    </button>
                  )}
                </div>

                <div className="flex-1 h-[50px]">
                  <select
                    className="w-full h-full px-4 bg-gray-50 rounded-xl border-1 border-gray-100 outline-none capitalize cursor-pointer"
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

                <div ref={locationRef} className="flex-1 h-[50px] relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    {getIcon("location", "20px")}
                  </div>
                  <input
                    className="w-full h-full pl-10 pr-10 bg-gray-50 rounded-xl border-1 border-gray-100 outline-none"
                    type="text"
                    placeholder="Enter location"
                    value={locationText}
                    onChange={(e) => {
                      setLocationText(e.target.value);
                      debouncedHandleLocationChange(e.target.value);
                    }}
                    onClick={() => setIsOpen(true)}
                  />
                  {locationText && (
                    <button
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      onClick={() => {
                        setLocationText("");
                        setLocation(null);
                        setSuggestions([]);
                      }}
                    >
                      {getIcon("close", "20px")}
                    </button>
                  )}
                  {isOpen && suggestions.length > 0 && (
                    <div className="absolute top-[60px] left-0 w-full max-h-[300px] overflow-y-auto bg-white border-1 border-gray-200 rounded-xl shadow-lg z-30 py-2">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
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
                  {isOpen && locationText && suggestions.length === 0 && (
                    <div className="absolute top-[60px] left-0 w-full bg-white border-1 border-gray-200 rounded-xl shadow-lg z-30 p-4 text-center text-sm text-gray-500">
                      Couldn't find suggestions.
                    </div>
                  )}
                </div>

                <button
                  className="h-[50px] lg:w-[160px] bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen text-gray-50 hover:text-white rounded-xl font-medium border-1 border-lightGreen flex items-center justify-center cursor-pointer"
                  onClick={handleApplyFilters}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 w-full relative">
              {/* Sidebar Filters */}
              <div className="w-full lg:w-[280px] shrink-0 sticky top-[152px] h-max hidden lg:flex flex-col gap-4">
                <div className="bg-white border-1 border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-white">
                    <h2 className="font-semibold text-lg text-black">
                      Filters
                    </h2>
                    <button
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 hover:underline transition-colors cursor-pointer"
                      onClick={handleResetFilters}
                    >
                      Reset all
                    </button>
                  </div>
                  <div className="h-[1px] w-full bg-gray-200 my-1"></div>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
                      Consultation Mode
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { id: "VIDEO", label: "Video call" },
                        { id: "AUDIO", label: "Audio call" },
                        { id: "CHAT", label: "Chat" },
                        { id: "IN_PERSON", label: "In-Person" },
                      ].map((mode) => (
                        <label
                          key={mode.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={consultationModes.includes(mode.id)}
                            onChange={() =>
                              handleConsultationModeChange(mode.id)
                            }
                            className="w-4 h-4 rounded border-gray-200 text-lightGreen focus:ring-lightGreen cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                            {mode.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-200 my-1"></div>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
                      Consultation Fee
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { id: "500", label: "Above ₹500" },
                        { id: "750", label: "Above ₹750" },
                        { id: "1000", label: "Above ₹1000" },
                        { id: "1500", label: "Above ₹1500" },
                      ].map((fee) => (
                        <label
                          key={fee.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="consultationFee"
                            checked={consultationFee === fee.id}
                            onChange={() => setConsultationFee(fee.id)}
                            className="w-4 h-4 text-lightGreen border-gray-200 focus:ring-lightGreen cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                            {fee.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-1 border-gray-200 rounded-2xl p-4">
                  <div className="text-sm font-medium text-gray-500">
                    {doctors.length > 0 ? (
                      <span>
                        Showing{" "}
                        <span className="text-black font-bold">
                          {doctors.length}
                        </span>{" "}
                        doctors
                      </span>
                    ) : (
                      <span>No doctors found</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select
                      className="text-sm bg-gray-50 border-1 border-gray-200 rounded-lg px-3 py-2 outline-none font-medium cursor-pointer"
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="">Recommended</option>
                      <option value="location">Nearest to me</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="fee-asc">Fee (Low to High)</option>
                      <option value="fee-desc">Fee (High to Low)</option>
                      <option value="rating-desc">Rating (High to Low)</option>
                    </select>
                  </div>
                </div>

                {doctors.length === 0 ? (
                  <div className="w-full flex items-center justify-center p-12 bg-white border-1 border-dashed border-gray-300 rounded-2xl">
                    <div className="text-center flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-2">
                        {getIcon("search", "32px")}
                      </div>
                      <h3 className="text-lg font-semibold text-black">
                        No doctors found
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        Try adjusting your filters or search terms to find what
                        you're looking for.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 px-6 py-2 bg-lightGreen/10 text-darkGreen hover:bg-lightGreen/20 rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {doctors.map((doctor) => (
                        <UDoctorCard key={doctor.id} doctor={doctor} />
                      ))}
                    </div>
                    {doctors.length < totalCount && (
                      <div className="flex justify-center mt-2">
                        <button
                          className="px-8 py-3 bg-white border-1 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
                          onClick={handleLoadMore}
                          disabled={loading}
                        >
                          {loading ? (
                            <span>Loading...</span>
                          ) : (
                            <>
                              View More Doctors
                              {getIcon("chevron-down-outline", "18px")}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default UDoctorsPage;
