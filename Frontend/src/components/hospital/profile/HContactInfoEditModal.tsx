import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import {
  setPhone,
  setEmail,
  setWebsite,
  setAddress,
} from "../../../state/hospital/hProfileCreationSlice";
import { saveHospitalProfileStage2 } from "../../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import getIcon from "../../../helpers/getIcon";
import ProfileCreationInput from "../../common/ProfileCreationInput";
import LoadingCircle from "../../common/LoadingCircle";
import {
  emailRegex,
  phoneRegex,
  websiteRegex,
} from "../../../constants/regexes";

interface HContactInfoEditModalProps {
  closeModal: () => void;
}

function HContactInfoEditModal({ closeModal }: HContactInfoEditModalProps) {
  const dispatch = useDispatch();
  const { phone, email, website, address, location } = useSelector(
    (state: RootState) => state.hProfileCreation
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  const [formData, setFormData] = useState({
    phone: phone || "",
    email: email || "",
    website: website || "",
    address: address || "",
  });

  const [loading, setLoading] = useState(false);

  const phoneErrorRef = useRef<HTMLDivElement | null>(null);
  const emailErrorRef = useRef<HTMLDivElement | null>(null);
  const websiteErrorRef = useRef<HTMLDivElement | null>(null);
  const addressErrorRef = useRef<HTMLDivElement | null>(null);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const clearErrors = () => {
    [phoneErrorRef, emailErrorRef, websiteErrorRef, addressErrorRef].forEach(
      (r) => r.current && (r.current.innerHTML = "")
    );
  };

  async function handleSave() {
    clearErrors();
    let valid = true;

    if (!formData.phone || formData.phone.trim() === "") {
      valid = false;
      showError(phoneErrorRef, "Enter phone number.");
    } else if (!phoneRegex.test(formData.phone)) {
      valid = false;
      showError(phoneErrorRef, "Enter a valid phone number.");
    }

    if (!formData.email || formData.email.trim() === "") {
      valid = false;
      showError(emailErrorRef, "Enter contact email.");
    } else if (!emailRegex.test(formData.email)) {
      valid = false;
      showError(emailErrorRef, "Enter a valid email address.");
    }

    if (
      formData.website &&
      formData.website.trim() !== "" &&
      !websiteRegex.test(formData.website)
    ) {
      valid = false;
      showError(
        websiteErrorRef,
        "Enter a valid website URL (https://example.com)."
      );
    }

    if (!formData.address || formData.address.trim() === "") {
      valid = false;
      showError(addressErrorRef, "Enter the hospital address.");
    } else if (formData.address.trim().length < 10) {
      valid = false;
      showError(addressErrorRef, "Address must be at least 10 characters.");
    }

    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    const payload = {
      hospitalId: userInfo.id,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      address: formData.address,
      location,
    };

    setLoading(true);
    try {
      const data = await saveHospitalProfileStage2(payload);
      if (data.success) {
        dispatch(setPhone(formData.phone));
        dispatch(setEmail(formData.email));
        dispatch(setWebsite(formData.website));
        dispatch(setAddress(formData.address));
        toast.success(
          data?.message || "Contact information updated successfully."
        );
        closeModal();
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Contact Information
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {getIcon("close", "24px", "black")}
          </button>
        </div>

        <div className="flex flex-col gap-x-6 gap-y-4">
          <div>
            <ProfileCreationInput
              title="Phone"
              type="number"
              placeholder="Enter phone number"
              value={formData.phone}
              changeState={(val) =>
                setFormData({ ...formData, phone: val as string })
              }
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={phoneErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Contact Email"
              placeholder="Enter contact email"
              value={formData.email}
              changeState={(val) =>
                setFormData({ ...formData, email: val as string })
              }
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={emailErrorRef}
            ></div>
          </div>

          <div className="md:col-span-2">
            <ProfileCreationInput
              title="Website"
              placeholder="Enter website link"
              value={formData.website}
              changeState={(val) =>
                setFormData({ ...formData, website: val as string })
              }
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={websiteErrorRef}
            ></div>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
            Address
          </p>
          <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
            <textarea
              className="p-2 peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] h-[50px] bg-white min-h-30"
              placeholder="Enter Complete Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            ></textarea>
          </div>
          <div
            className="error-container text-red-500 text-sm mt-1"
            ref={addressErrorRef}
          ></div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-darkGreen text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading && <LoadingCircle />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HContactInfoEditModal;
