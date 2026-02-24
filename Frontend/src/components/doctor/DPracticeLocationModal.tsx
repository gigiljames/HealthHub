import { useState, useEffect, useRef } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import LocationPicker from "../common/LocationPicker";
import { useDispatch, useSelector } from "react-redux";
import {
  addPracticeLocation,
  updatePracticeLocation,
} from "../../state/doctor/dProfileCreationSlice";
import type { RootState } from "../../state/store";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";
import { listOrganizations } from "../../api/organization/organizationService";
import type { PracticeLocation } from "../../types/practiceLocation";
import type { PracticeLocationType } from "../../enums/practiceLocationType";

interface Organization {
  id: string;
  name: string;
  address: string;
  organizationType: string;
}

interface LocationData {
  coordinates: number[];
  address: string;
  placeId: string;
}

interface DPracticeLocationModalProps {
  existingPracticeLocation?: any;
  setPracticeLocationModal: (value: boolean) => void;
}

function DPracticeLocationModal({
  existingPracticeLocation,
  setPracticeLocationModal,
}: DPracticeLocationModalProps) {
  const dispatch = useDispatch();
  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );

  const [name, setName] = useState("");
  const [type, setType] = useState<
    "ONLINE" | "HOSPITAL" | "CLINIC" | "PRIVATE_CLINIC" | ""
  >("");
  const [organizationId, setOrganizationId] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [consultationFee, setConsultationFee] = useState("");
  const [consultationModes, setConsultationModes] = useState<
    ("VIDEO" | "AUDIO" | "CHAT" | "IN_PERSON")[]
  >([]);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const typeErrorRef = useRef<HTMLDivElement | null>(null);
  const organizationErrorRef = useRef<HTMLDivElement | null>(null);
  const locationErrorRef = useRef<HTMLDivElement | null>(null);
  const consultationFeeErrorRef = useRef<HTMLDivElement | null>(null);
  const consultationModesErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (existingPracticeLocation) {
      setName(existingPracticeLocation.name);
      setType(existingPracticeLocation.type);
      setOrganizationId(existingPracticeLocation.organizationId || "");
      setConsultationFee(existingPracticeLocation.consultationFee.toString());
      setConsultationModes(existingPracticeLocation.consultationModes || []);
      setIsPrimary(existingPracticeLocation.isPrimary);
      setIsActive(existingPracticeLocation.isActive);
      if (existingPracticeLocation.location) {
        setLocation({
          coordinates: existingPracticeLocation.location.coordinates,
          address: existingPracticeLocation.location.address,
          placeId: existingPracticeLocation.location.placeId,
        });
      }
    }
  }, [existingPracticeLocation]);

  useEffect(() => {
    setLoadingOrganizations(true);
    listOrganizations()
      .then((response) => {
        if (response?.success) {
          setOrganizations(response.organizations || []);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load organizations.");
      })
      .finally(() => setLoadingOrganizations(false));
  }, []);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      nameErrorRef,
      typeErrorRef,
      organizationErrorRef,
      locationErrorRef,
      consultationFeeErrorRef,
      consultationModesErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  const handleConsultationModeToggle = (
    mode: "VIDEO" | "AUDIO" | "CHAT" | "IN_PERSON",
  ) => {
    setConsultationModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  // Get available consultation modes based on practice type
  const getAvailableConsultationModes = (): (
    | "VIDEO"
    | "AUDIO"
    | "CHAT"
    | "IN_PERSON"
  )[] => {
    if (type === "ONLINE") {
      return ["VIDEO", "AUDIO", "CHAT"];
    }
    return ["VIDEO", "AUDIO", "CHAT", "IN_PERSON"];
  };

  // Remove IN_PERSON mode when type changes to ONLINE
  useEffect(() => {
    if (type === "ONLINE" && consultationModes.includes("IN_PERSON")) {
      setConsultationModes((prev) => prev.filter((m) => m !== "IN_PERSON"));
    }
  }, [type, consultationModes]);

  function handleSaveClick() {
    removeErrors();
    let valid = true;

    // Check if trying to create another ONLINE location
    if (
      type === "ONLINE" &&
      !existingPracticeLocation &&
      practiceLocations.some((loc) => loc.type === "ONLINE")
    ) {
      showError(typeErrorRef, "Only one ONLINE practice location is allowed.");
      valid = false;
    }

    if (!name.trim()) {
      showError(nameErrorRef, "Name is required.");
      valid = false;
    }

    if (!type) {
      showError(typeErrorRef, "Practice type is required.");
      valid = false;
    }

    // Validate organization for HOSPITAL and CLINIC types
    if ((type === "HOSPITAL" || type === "CLINIC") && !organizationId) {
      showError(
        organizationErrorRef,
        "Organization is required for this type.",
      );
      valid = false;
    }

    // Validate location for PRIVATE_CLINIC
    if (type === "PRIVATE_CLINIC" && !location) {
      showError(locationErrorRef, "Location is required for Private Clinic.");
      valid = false;
    }

    if (!consultationFee || parseFloat(consultationFee) <= 0) {
      showError(consultationFeeErrorRef, "Valid consultation fee is required.");
      valid = false;
    }

    if (consultationModes.length === 0) {
      showError(
        consultationModesErrorRef,
        "Select at least one consultation mode.",
      );
      valid = false;
    }

    // Validate only one primary location
    if (isPrimary) {
      const otherPrimaryExists = practiceLocations.some(
        (loc) => loc.isPrimary && loc._id !== existingPracticeLocation?._id,
      );
      if (otherPrimaryExists) {
        toast.error(
          "Another location is already set as primary. Please unset it first.",
        );
        valid = false;
      }
    }

    if (!valid) {
      toast.error("Please fix errors.");
      return;
    }

    const practiceLocationData = {
      _id: existingPracticeLocation?._id || Date.now().toString(),
      organizationId: organizationId || "",
      name: name.trim(),
      type: type as PracticeLocationType,
      consultationFee: parseFloat(consultationFee),
      consultationModes,
      isPrimary,
      isActive,
    };

    if (location && practiceLocationData.type !== "ONLINE") {
      practiceLocationData.location = {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address,
        placeId: location.placeId,
      };
    }

    if (existingPracticeLocation) {
      dispatch(updatePracticeLocation(practiceLocationData));
      toast.success("Practice location updated successfully.");
    } else {
      dispatch(addPracticeLocation(practiceLocationData));
      toast.success("Practice location added successfully.");
    }
    setPracticeLocationModal(false);
  }

  const handleLocationSelect = (locationData: LocationData) => {
    setLocation(locationData);
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 bg-black/25 h-screen w-screen flex justify-center items-center px-2"
        onClick={() => setPracticeLocationModal(false)}
      >
        <div
          className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-[600px] relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-xl">
              {existingPracticeLocation
                ? "Edit Practice Location"
                : "Add Practice Location"}
            </h1>
            <span
              className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
              onClick={() => setPracticeLocationModal(false)}
            >
              {getIcon("close", "24px", "black")}
            </span>
          </div>

          <form className="flex flex-col gap-2">
            <div>
              <ProfileCreationInput
                title="Name"
                placeholder="Enter practice location name"
                value={name}
                changeState={(val) => setName(val as string)}
              />
              <div className="error-container" ref={nameErrorRef}></div>
            </div>

            <div>
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2 mb-1">
                Practice Type
              </p>
              <select
                className="w-full p-3 border-1 border-inputBorder rounded-lg outline-none focus:border-darkGreen"
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as
                      | "ONLINE"
                      | "HOSPITAL"
                      | "CLINIC"
                      | "PRIVATE_CLINIC"
                      | "",
                  )
                }
              >
                <option value="">Select practice type</option>
                <option value="ONLINE">Online</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="CLINIC">Clinic</option>
                <option value="PRIVATE_CLINIC">Private Clinic</option>
              </select>
              <div className="error-container" ref={typeErrorRef}></div>
            </div>

            {(type === "HOSPITAL" || type === "CLINIC") && (
              <div>
                <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2 mb-1">
                  Organization
                </p>
                {loadingOrganizations ? (
                  <p className="text-sm text-gray-500 p-3">
                    Loading organizations...
                  </p>
                ) : (
                  <select
                    className="w-full p-3 border-1 border-inputBorder rounded-lg outline-none focus:border-darkGreen"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                  >
                    <option value="">Select organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} - {org.organizationType} ({org.address})
                      </option>
                    ))}
                  </select>
                )}
                <div
                  className="error-container"
                  ref={organizationErrorRef}
                ></div>
              </div>
            )}

            {type === "PRIVATE_CLINIC" && (
              <div>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={location || undefined}
                />
                <div className="error-container" ref={locationErrorRef}></div>
              </div>
            )}

            <div>
              <ProfileCreationInput
                title="Consultation Fee (₹)"
                placeholder="Enter consultation fee"
                type="number"
                value={consultationFee}
                changeState={(val) => setConsultationFee(val as string)}
              />
              <div
                className="error-container"
                ref={consultationFeeErrorRef}
              ></div>
            </div>

            <div>
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2 mb-1">
                Consultation Modes
              </p>
              <div className="flex flex-wrap gap-2">
                {getAvailableConsultationModes().map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border-1 border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={consultationModes.includes(mode)}
                      onChange={() => handleConsultationModeToggle(mode)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm">{mode.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
              {type === "ONLINE" && (
                <p className="text-xs text-gray-500 pl-2 mt-1">
                  In-person consultations not available for online practice
                </p>
              )}
              <div
                className="error-container"
                ref={consultationModesErrorRef}
              ></div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Set as primary location
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </form>

          <div className="flex justify-end gap-3">
            <button
              className="py-2 px-6 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all"
              onClick={() => setPracticeLocationModal(false)}
            >
              Cancel
            </button>
            <button
              className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold hover:-translate-y-0.5 transition-all"
              onClick={handleSaveClick}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DPracticeLocationModal;
