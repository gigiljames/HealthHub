import { useState, useEffect, useRef } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import { useDispatch, useSelector } from "react-redux";
import {
  addPracticeLocation,
  updatePracticeLocation,
} from "../../state/doctor/dProfileCreationSlice";
import type { RootState } from "../../state/store";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";
import { listOrganizations } from "../../api/organization/organizationService";

interface Organization {
  id: string;
  name: string;
  address: string;
  organizationType: string;
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
  const [ownerId, setOwnerId] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const typeErrorRef = useRef<HTMLDivElement | null>(null);
  const ownerErrorRef = useRef<HTMLDivElement | null>(null);
  const consultationFeeErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (existingPracticeLocation) {
      setName(existingPracticeLocation.name);
      setType(existingPracticeLocation.type);
      setOwnerId(existingPracticeLocation.ownerId || "");
      setConsultationFee(existingPracticeLocation.consultationFee.toString());
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
      ownerErrorRef,
      consultationFeeErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

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

    // Validate owner for HOSPITAL and CLINIC types
    if ((type === "HOSPITAL" || type === "CLINIC") && !ownerId) {
      showError(ownerErrorRef, "Organization is required for this type.");
      valid = false;
    }

    if (!consultationFee || parseFloat(consultationFee) <= 0) {
      showError(consultationFeeErrorRef, "Valid consultation fee is required.");
      valid = false;
    }

    if (!valid) {
      toast.error("Please fix errors.");
      return;
    }

    const practiceLocationData = {
      id: existingPracticeLocation?.id || Date.now().toString(),
      name: name.trim(),
      type: type as "ONLINE" | "HOSPITAL" | "CLINIC" | "PRIVATE_CLINIC",
      ownerId: ownerId || undefined,
      consultationFee: parseFloat(consultationFee),
    };

    if (existingPracticeLocation) {
      dispatch(updatePracticeLocation(practiceLocationData));
      toast.success("Practice location updated successfully.");
    } else {
      dispatch(addPracticeLocation(practiceLocationData));
      toast.success("Practice location added successfully.");
    }
    setPracticeLocationModal(false);
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 bg-black/25 h-screen w-screen flex justify-center items-center px-2"
        onClick={() => setPracticeLocationModal(false)}
      >
        <div
          className="flex flex-col bg-white p-6 rounded-xl gap-3 w-full lg:w-[500px] relative max-h-[90vh] overflow-y-auto"
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
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    <option value="">Select organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} - {org.organizationType} ({org.address})
                      </option>
                    ))}
                  </select>
                )}
                <div className="error-container" ref={ownerErrorRef}></div>
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
