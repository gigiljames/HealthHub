import UGuestNavbar from "../../components/user/UGuestNavbar";
import UNavbar from "../../components/user/UNavbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import UDoctorCard from "../../components/user/UDoctorCard";
import { getSearchSuggestions } from "../../api/map/mapService";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { useEffect, useState } from "react";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";
import getIcon from "../../helpers/getIcon";

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

function UDoctorsPage() {
  const token = useSelector((state: RootState) => state.token.token);
  const role = useSelector((state: RootState) => state.token.role);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("");
  const [locationText, setLocationText] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [specialization, setSpecialization] = useState("");
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  // Filter states
  const [consultationModes, setConsultationModes] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  const debouncedHandleLocationChange = useDebouncedSearch(
    handleLocationInputChange,
    300,
  );

  useEffect(() => {
    getSpecializationList().then((response) => {
      console.log(response);
      if (response?.success) {
        setSpecializationList(response.specializations);
      }
    });
    fetchDoctors(1, true);
  }, []);

  async function fetchDoctors(pageNum: number, reset: boolean = false) {
    setLoading(true);
    try {
      const { getPublicDoctors } = await import(
        "../../api/doctor/doctorService"
      );
      const response = await getPublicDoctors(
        searchText,
        pageNum,
        10,
        consultationModes,
        languages,
        gender,
        specialization,
        consultationFee,
      );

      console.log(response);

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
    setTimeout(() => fetchDoctors(1, true), 0);
  }

  function handleConsultationModeChange(mode: string) {
    setConsultationModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  function handleLanguageChange(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  }

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
  return (
    <>
      <div className="w-full h-screen overflow-y-auto bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
        {token && role ? <UNavbar /> : <UGuestNavbar />}
        <section className="w-full pt-12 lg:pt-18 pb-4  dark:bg-gray-900/50 transition-colors duration-300 flex flex-col items-center bg-slate-100 min-h-full">
          <div className="w-full  bg-white px-3 lg:px-20 xl:px-[10%] pt-8 lg:pt-4 pb-0">
            <h1 className="text-[24px] md:text-[32px] font-bold mb-1">
              Find the right doctor for your needs
            </h1>
            <p className="text-[14px] md:text-[16px] font-medium  text-slate-500">
              Book appointments with top doctors in your area.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-2 w-full sticky top-17 bg-white py-4 lg:px-20 xl:px-[10%] shadow-md z-5">
              {/* Search bar */}
              <div className="flex gap-2 w-full rounded-lg p-2 bg-slate-100 shadow-md border-1 border-inputBorder/30 ">
                <div className="flex gap-1 w-full h-[40px]">
                  <div className="w-full h-full bg-white rounded-md">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full h-full"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <div className="w-[5px] rounded-full bg-inputBorder/20"></div>
                  <div className=" bg-white w-full rounded-md">
                    <select
                      className="w-full h-full capitalize text-sm md:text-[16px] outline-none bg-transparent"
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
                      className="w-full h-full"
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
                                className="hover:bg-gray-300"
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
                    onClick={handleApplyFilters}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            <div className="flex w-full h-full px-3 lg:px-20 xl:px-[10%] gap-2 lg:gap-3 text-[14px] font-medium text-slate-600">
              {/* Filters */}
              <div className="flex flex-col gap-2 w-[250px] h-full sticky top-44 max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar pb-3">
                <div className="flex items-center justify-between bg-white rounded-xl border-2 border-gray-200 p-3">
                  <h2 className="font-semibold text-black text-[16px]">
                    Filters
                  </h2>
                  <p
                    className="text-lightGreen/80 font-medium hover:text-lightGreen transition-colors duration-200 cursor-pointer underline"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                  <h3 className="text-black">Consultation mode</h3>
                  <div>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="consultationMode"
                        checked={consultationModes.includes("VIDEO")}
                        onChange={() => handleConsultationModeChange("VIDEO")}
                      />
                      <p>Video call</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="consultationMode"
                        checked={consultationModes.includes("AUDIO")}
                        onChange={() => handleConsultationModeChange("AUDIO")}
                      />
                      <p>Audio call</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="consultationMode"
                        checked={consultationModes.includes("CHAT")}
                        onChange={() => handleConsultationModeChange("CHAT")}
                      />
                      <p>Chat</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="consultationMode"
                        checked={consultationModes.includes("IN_PERSON")}
                        onChange={() =>
                          handleConsultationModeChange("IN_PERSON")
                        }
                      />
                      <p>In-Person</p>
                    </label>
                  </div>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                  <h3 className="text-black">Consultation fee</h3>
                  <div>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="radio"
                        name="consultationFee"
                        checked={consultationFee === "500"}
                        onChange={() => setConsultationFee("500")}
                      />
                      <p>Above 500</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="radio"
                        name="consultationFee"
                        checked={consultationFee === "750"}
                        onChange={() => setConsultationFee("750")}
                      />
                      <p>Above 750</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="radio"
                        name="consultationFee"
                        checked={consultationFee === "1000"}
                        onChange={() => setConsultationFee("1000")}
                      />
                      <p>Above 1000</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="radio"
                        name="consultationFee"
                        checked={consultationFee === "1500"}
                        onChange={() => setConsultationFee("1500")}
                      />
                      <p>Above 1500</p>
                    </label>
                  </div>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                  <h3 className="text-black">Languages</h3>
                  <div>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="languages"
                        checked={languages.includes("English")}
                        onChange={() => handleLanguageChange("English")}
                      />
                      <p>English</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="languages"
                        checked={languages.includes("Malayalam")}
                        onChange={() => handleLanguageChange("Malayalam")}
                      />
                      <p>Malayalam</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="languages"
                        checked={languages.includes("Tamil")}
                        onChange={() => handleLanguageChange("Tamil")}
                      />
                      <p>Tamil</p>
                    </label>
                    <label htmlFor="" className="flex gap-2">
                      <input
                        type="checkbox"
                        name="languages"
                        checked={languages.includes("Hindi")}
                        onChange={() => handleLanguageChange("Hindi")}
                      />
                      <p>Hindi</p>
                    </label>
                  </div>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
                  <h3 className="text-black">Rating</h3>
                  <div></div>
                </div>
                <button
                  className="bg-lightGreen p-2 mx-0.5 rounded-lg text-white font-semibold"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </button>
              </div>
              <div className="w-full  rounded-xl bg-white border-2 border-gray-200 p-3 h-fit">
                <div className="flex items-center justify-between border-1 border-gray-200 p-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <p className=" font-medium text-slate-600">Sort by:</p>
                    <select
                      name=""
                      id=""
                      className="h-[35px] bg-gray-100 rounded-lg p-1"
                    >
                      <option value="">None</option>
                      <option value="">Name (A-Z)</option>
                      <option value="">Name (Z-A)</option>
                      <option value="">Consultation Fee (Low to High)</option>
                      <option value="">Consultation Fee (High to Low)</option>
                      <option value="">Rating (High to Low)</option>
                      <option value="">Rating (Low to High)</option>
                      <option value="">Nearest Location</option>
                    </select>
                  </div>
                  {doctors.length > 0 && (
                    <div>Showing {doctors.length} doctors</div>
                  )}
                </div>
                {doctors.length === 0 ? (
                  <p className="text-center w-full border-1 p-4 py-8 mt-2 rounded-lg border-inputBorder/30 text-inputBorder shadow-sm">
                    No doctors found
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1 md:gap-3 mt-2">
                      {doctors.map((doctor) => (
                        <UDoctorCard key={doctor.id} doctor={doctor} />
                      ))}
                    </div>
                    <div className="flex items-center w-full border-y-1 border-inputBorder/40 justify-center hover:border-inputBorder/80 transition-all duration-200 group">
                      <button
                        className="text-gray-400 p-1 py-3 rounded-lg flex items-center gap-2 group-hover:text-gray-500 transition-all duration-200"
                        onClick={handleLoadMore}
                        disabled={loading || doctors.length >= totalCount}
                      >
                        <p>{loading ? "Loading..." : "Load More"}</p>{" "}
                        {getIcon("chevron-down-outline", "18px")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default UDoctorsPage;
