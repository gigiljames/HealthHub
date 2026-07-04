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
import { getOrganizationByCode, getOrganizationById } from "../../api/organization/organizationService";
import type { PracticeLocation } from "../../types/practiceLocation";
import type { PracticeLocationType } from "../../enums/practiceLocationType";

interface LocationData {
  coordinates: number[];
  address: string;
  placeId: string;
}

interface DPracticeLocationModalProps {
  existingPracticeLocation?: any;
  setPracticeLocationModal: (value: boolean) => void;
  onSave?: (practiceLocationData: any) => Promise<boolean>;
}

function DPracticeLocationModal({
  existingPracticeLocation,
  setPracticeLocationModal,
  onSave,
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
  const [organizationCode, setOrganizationCode] = useState("");
  const [resolvedOrgName, setResolvedOrgName] = useState("");
  const [lookingUpCode, setLookingUpCode] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [consultationFee, setConsultationFee] = useState("");
  const [consultationModes, setConsultationModes] = useState<
    ("VIDEO" | "AUDIO" | "CHAT" | "IN_PERSON")[]
  >([]);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const typeErrorRef = useRef<HTMLDivElement | null>(null);
  const organizationErrorRef = useRef<HTMLDivElement | null>(null);
  const locationErrorRef = useRef<HTMLDivElement | null>(null);
  const consultationFeeErrorRef = useRef<HTMLDivElement | null>(null);
  const consultationModesErrorRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoad = useRef(true);

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
      isInitialLoad.current = true;
    }
  }, [existingPracticeLocation]);

  useEffect(() => {
    if (organizationId && (type === "HOSPITAL" || type === "CLINIC")) {
      setLookingUpCode(true);
      getOrganizationById(organizationId)
        .then((response) => {
          if (response?.success && response.organization) {
            setResolvedOrgName(response.organization.name);
            setOrganizationCode(response.organization.organizationCode || "");
          }
        })
        .catch((err) => console.error("Error resolving organization details:", err))
        .finally(() => setLookingUpCode(false));
    }
  }, [organizationId, type]);

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

  const handleCodeChange = (val: string) => {
    const cleanCode = val.toUpperCase().slice(0, 6);
    setOrganizationCode(cleanCode);
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      if (organizationCode === "") {
        return;
      }
      isInitialLoad.current = false;
    }

    if (organizationCode.length !== 6) {
      setResolvedOrgName("");
      setOrganizationId("");
      return;
    }

    if (type !== "HOSPITAL" && type !== "CLINIC") {
      return;
    }

    setLookingUpCode(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await getOrganizationByCode(organizationCode, type);
        if (response?.success && response.organization) {
          setResolvedOrgName(response.organization.name);
          setOrganizationId(response.organization.id);
          if (organizationErrorRef.current) {
            organizationErrorRef.current.innerHTML = "";
          }
        } else {
          setResolvedOrgName("");
          setOrganizationId("");
          showError(organizationErrorRef, response?.message || "Invalid organization code.");
        }
      } catch (err) {
        setResolvedOrgName("");
        setOrganizationId("");
        showError(organizationErrorRef, "Error looking up organization code.");
      } finally {
        setLookingUpCode(false);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      setLookingUpCode(false);
    };
  }, [organizationCode, type]);

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
        "Valid 6-character Organization Code is required.",
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

    const practiceLocationData: any = {
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

    if (onSave) {
      onSave(practiceLocationData).then((success) => {
        if (success) {
          setPracticeLocationModal(false);
        }
      });
    } else {
      if (existingPracticeLocation) {
        dispatch(updatePracticeLocation(practiceLocationData));
        toast.success("Practice location updated successfully.");
      } else {
        dispatch(addPracticeLocation(practiceLocationData));
        toast.success("Practice location added successfully.");
      }
      setPracticeLocationModal(false);
    }
  }

  const handleLocationSelect = (locationData: LocationData) => {
    setLocation(locationData);
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 bg-black/25 h-screen w-screen flex justify-center items-center px-2 animate-in fade-in duration-200"
        onClick={() => setPracticeLocationModal(false)}
      >
        <div
          className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-[600px] relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-xl text-gray-800">
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

          <form className="flex flex-col gap-3">
            <div>
              <ProfileCreationInput
                title="Name"
                placeholder="Enter practice location name"
                value={name}
                changeState={(val) => setName(val as string)}
              />
              <div className="error-container text-red-500 text-xs mt-1 pl-2" ref={nameErrorRef}></div>
            </div>

            <div>
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2 mb-1">
                Practice Type
              </p>
              <select
                className="w-full p-3 border-1 border-inputBorder rounded-lg outline-none focus:border-darkGreen text-sm"
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
              <div className="error-container text-red-500 text-xs mt-1 pl-2" ref={typeErrorRef}></div>
            </div>

            {(type === "HOSPITAL" || type === "CLINIC") && (
              <div className="flex flex-col gap-1 relative">
                <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                  Organization Code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-char organization code"
                    value={organizationCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="flex-1 p-3 border-1 border-inputBorder rounded-lg outline-none focus:border-darkGreen uppercase text-sm font-mono tracking-wider"
                  />
                </div>
                {lookingUpCode && (
                  <p className="text-xs text-gray-500 pl-2 mt-0.5">Verifying code...</p>
                )}
                {resolvedOrgName && (
                  <div className="flex items-center gap-1.5 text-xs text-darkGreen pl-2 mt-1 font-medium bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 w-fit">
                    <span className="w-2 h-2 rounded-full bg-darkGreen inline-block"></span>
                    Selected: {resolvedOrgName}
                  </div>
                )}
                <div className="error-container text-red-500 text-xs mt-0.5 pl-2" ref={organizationErrorRef}></div>
                <button
                  type="button"
                  onClick={() => setShowInstructionsModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline text-left pl-2 mt-1 w-fit"
                >
                  Do not have an organization code? Ask your organization to register to HealthHub
                </button>
              </div>
            )}

            {type === "PRIVATE_CLINIC" && (
              <div>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={location || undefined}
                />
                <div className="error-container text-red-500 text-xs mt-1 pl-2" ref={locationErrorRef}></div>
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
                className="error-container text-red-500 text-xs mt-1 pl-2"
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
              <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-gray-200 text-xs text-slate-600 space-y-1.5 max-w-lg">
                <p className="font-bold text-slate-800">Note on Consultation Modes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Video:</strong> Includes Video call, Audio call, and Chat.</li>
                  <li><strong>Audio:</strong> Includes Audio call and Chat (no Video).</li>
                  <li><strong>Chat:</strong> Includes Chat only (no Video or Audio).</li>
                  <li><strong>In Person:</strong> For physical visits (no online features).</li>
                </ul>
              </div>
              <div
                className="error-container text-red-500 text-xs mt-1 pl-2"
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

          <div className="flex justify-end gap-3 pt-3 border-t mt-2">
            <button
              className="py-2 px-6 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all text-sm"
              onClick={() => setPracticeLocationModal(false)}
            >
              Cancel
            </button>
            <button
              className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold hover:-translate-y-0.5 transition-all text-sm shadow-md"
              onClick={handleSaveClick}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {showInstructionsModal && (
        <div
          className="fixed top-0 left-0 z-[60] bg-black/40 h-screen w-screen flex justify-center items-center px-4 animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setShowInstructionsModal(false)}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-4 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg text-gray-800">
                Register Your Organization
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full"
                onClick={() => setShowInstructionsModal(false)}
              >
                {getIcon("close", "20px", "black")}
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-3">
              <p>
                To practice at a hospital or clinic, it must be registered on HealthHub. Please share the enrolment link with your organization representative.
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Registration Link
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/organizations/enrol`}
                    className="flex-1 p-2 bg-white border border-gray-200 rounded text-xs select-all text-gray-700 outline-none font-mono"
                    id="reg-link-input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const linkVal = `${window.location.origin}/organizations/enrol`;
                      navigator.clipboard.writeText(linkVal);
                      toast.success("Link copied to clipboard!");
                    }}
                    className="px-3 py-2 bg-darkGreen text-white text-xs font-semibold rounded hover:bg-darkGreen/90 transition-all shrink-0"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="font-bold text-gray-700 text-xs">Instructions for Organization:</p>
                <ul className="list-decimal list-inside space-y-1 text-xs text-gray-500">
                  <li>Visit the registration link above.</li>
                  <li>Fill out the registration form (Name, Type, Location, Bank Details).</li>
                  <li>Verify email ownership using the OTP sent to their inbox.</li>
                  <li>HealthHub administration will verify and approve the request.</li>
                  <li>Once approved, they will receive a unique 6-character code by email.</li>
                  <li>Enter that 6-character code in the modal here to link it.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-all"
                onClick={() => setShowInstructionsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DPracticeLocationModal;
