import UGuestNavbar from "../../components/user/UGuestNavbar";
import UNavbar from "../../components/user/UNavbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import UDoctorCard from "../../components/user/UDoctorCard";
import { getSearchSuggestions } from "../../api/map/mapService";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { useEffect, useState } from "react";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";

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
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [specialization, setSpecialization] = useState("");
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const debouncedHandleLocationChange = useDebouncedSearch(
    handleLocationInputChange,
    300
  );
  useEffect(() => {
    getSpecializationList().then((response) => {
      if (response?.success) {
        setSpecializationList(response.data);
      }
    });
  }, []);
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
      <div className="w-full h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
        {token && role ? <UNavbar /> : <UGuestNavbar />}
        <section className="w-full px-3 lg:px-20 pt-12 lg:pt-22 pb-4  dark:bg-gray-900/50 overflow-hidden transition-colors duration-300 h-full flex items-center gap-2 lg:gap-3 bg-slate-100">
          <div className=" bg-white h-full w-[250px] rounded-xl border-2 border-gray-200"></div>
          <div className="h-full flex-1 rounded-xl bg-white border-2 border-gray-200">
            <input type="text" placeholder="Search" />
            <div className="flex flex-col gap-1">
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Specialization
              </p>
              <div
                className={`border-1 border-inputBorder px-3  rounded-lg peer md:min-w-[200px] lg:min-w-[400px] bg-white h-[50px]`}
              >
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
              {/* <div
                className="error-container"
                ref={specializationErrorRef}
              ></div> */}
            </div>
            {/* Searchable select component */}
            <div className="relative w-[400px]">
              <input
                className="w-full"
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

            {/* <UDoctorCard
              doctor={{
                name: "Dr. John Doe",
                specialization: "Cardiology",
                consultationFee: 500,
                location: "New York, NY",
                consultationModes: ["Online", "In-Person"],
              }}
            /> */}
          </div>
        </section>
      </div>
    </>
  );
}

export default UDoctorsPage;
