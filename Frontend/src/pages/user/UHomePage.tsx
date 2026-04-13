import { useEffect, useState } from "react";
import UNavbar from "../../components/user/UNavbar";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { getSearchSuggestions } from "../../api/map/mapService";
import { useNavigate } from "react-router";

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
  }, []);
  return (
    <>
      <UNavbar />
      <div className="h-screen pt-[70px] ">
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
      </div>
    </>
  );
}

export default UHomePage;
