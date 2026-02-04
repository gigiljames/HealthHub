import { useDispatch, useSelector } from "react-redux";
import { addSlots } from "../../../state/doctor/dSlotSlice";
import { useEffect, useState } from "react";
import getIcon from "../../../helpers/getIcon";
import { days } from "../../../constants/dateAndTime";
import { useDoctorSlotManagementStore } from "../../../zustand/doctoreStore";
import toast from "react-hot-toast";
import {
  createSlot as createSlotApi,
  createRecurringSlots as createRecurringSlotsApi,
} from "../../../api/doctor/dSlotManagementService";
import {
  buildDateFromDateAndTime,
  getMaxAllowedDate,
  MAX_DAYS_AHEAD,
} from "../../../utils/DateTimeUtil";
import { getPracticeLocations } from "../../../api/doctor/dProfileCreationService";
import type { RootState } from "../../../state/store";
import { setPracticeLocations } from "../../../state/doctor/dProfileCreationSlice";

interface DCreateSlotModalProps {
  date: string;
}

function DCreateSlotModal({ date }: DCreateSlotModalProps) {
  const toggleCreateSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleCreateSlotModal,
  );
  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );
  const recurr = useDoctorSlotManagementStore((state) => state.recurr);
  const setRecurr = useDoctorSlotManagementStore((state) => state.setRecurr);
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [recurMode, setRecurMode] = useState<
    "this-week" | "every-this-day" | "this-month"
  >("this-week");
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [modalDate, setModalDate] = useState("");
  const [practiceLocationId, setPracticeLocationId] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    start?: string;
    end?: string;
    date?: string;
    practiceLocation?: string;
  }>({});

  useEffect(() => {
    setModalDate(date);
    if (practiceLocations.length === 0) {
      setLoadingLocations(true);
      getPracticeLocations()
        .then((response) => {
          if (response?.success) {
            dispatch(setPracticeLocations(response.data || []));
            if (response.data && response.data.length > 0) {
              setPracticeLocationId(response.data[0]._id);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load practice locations.");
        })
        .finally(() => setLoadingLocations(false));
    }
    console.log(practiceLocations);
  }, []);

  const validateInputs = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!modalDate) {
      newErrors.date = "Date is required";
      isValid = false;
    } else {
      const selectedDate = new Date(modalDate);
      const maxAllowedDate = getMaxAllowedDate();
      if (selectedDate > maxAllowedDate) {
        newErrors.date = `Date cannot be more than ${MAX_DAYS_AHEAD} days ahead`;
        isValid = false;
      }
    }

    if (!start) {
      newErrors.start = "Start time is required";
      isValid = false;
    }

    if (!end) {
      newErrors.end = "End time is required";
      isValid = false;
    }

    if (start && end) {
      const startDate = buildDateFromDateAndTime(modalDate || date, start);
      const endDate = buildDateFromDateAndTime(modalDate || date, end);
      if (startDate >= endDate) {
        newErrors.end = "End time must be greater than start time";
        isValid = false;
      }
    }

    if (!practiceLocationId) {
      newErrors.practiceLocation = "Practice location is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  async function handleCreateSlot() {
    if (!validateInputs()) {
      return;
    }

    if (recurr) {
      const slotData = {
        title: title,
        mode: mode,
        start: buildDateFromDateAndTime(modalDate, start).toISOString(),
        end: buildDateFromDateAndTime(modalDate, end).toISOString(),
        recurMode: recurMode,
        practiceLocationId: practiceLocationId,
      };

      try {
        const data = await createRecurringSlotsApi(slotData);
        if (data && data.success) {
          dispatch(addSlots(data.slots));
          toggleCreateSlotModal();
          toast.success(data.message || "Recurring slots created successfully");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    } else {
      const slotData = {
        title: title,
        mode: mode as "online" | "in-person",
        start: buildDateFromDateAndTime(modalDate, start).toISOString(),
        end: buildDateFromDateAndTime(modalDate, end).toISOString(),
        isBooked: false,
        practiceLocationId: practiceLocationId,
      };
      try {
        const data = await createSlotApi(slotData);
        if (data.success) {
          dispatch(addSlots([data.slot]));
          toggleCreateSlotModal();
          toast.success("Slot created successfully");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center px-4"
        onClick={() => toggleCreateSlotModal()}
      >
        <div
          className="bg-white p-6 rounded-xl gap-3 w-full lg:w-[500px] relative max-h-[90vh] overflow-y-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-bold text-xl">Create Slot</h1>
            <button
              className="cursor-pointer hover:bg-gray-100 p-1 rounded-full text-gray-500 hover:text-gray-700"
              onClick={() => toggleCreateSlotModal()}
            >
              {getIcon("close", "24px", "black")}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="ww-full">
              <label
                htmlFor="date"
                className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2"
              >
                Date
              </label>
              <input
                className={`border-1 px-3 rounded-lg peer md:min-w-[200px] w-full h-[50px] ${errors.date ? "border-red-500" : "border-inputBorder"}`}
                type="text"
                id="date"
                value={modalDate}
                onChange={(e) => {
                  setModalDate(e.target.value);
                  if (errors.date) setErrors({ ...errors, date: undefined });
                }}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1 pl-2">{errors.date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="title"
                className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2"
              >
                Slot Title
              </label>
              <input
                className={`border-1 px-3 rounded-lg peer md:min-w-[200px] w-full h-[50px] ${errors.title ? "border-red-500" : "border-inputBorder"}`}
                type="text"
                id="title"
                placeholder="Enter slot title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 pl-2">{errors.title}</p>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <div className="flex flex-col gap-1 w-full">
                <label
                  htmlFor="startTime"
                  className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2"
                >
                  Start
                </label>
                <input
                  className={`border-1 px-3 rounded-lg peer md:min-w-[200px] w-full h-[50px] ${errors.start ? "border-red-500" : "border-inputBorder"}`}
                  type="time"
                  id="startTime"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    if (errors.start)
                      setErrors({ ...errors, start: undefined });
                  }}
                />
                {errors.start && (
                  <p className="text-red-500 text-xs mt-1 pl-2">
                    {errors.start}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label
                  htmlFor="endTime"
                  className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2"
                >
                  End
                </label>
                <input
                  className={`border-1 px-3 rounded-lg peer md:min-w-[200px] w-full h-[50px] ${errors.end ? "border-red-500" : "border-inputBorder"}`}
                  type="time"
                  id="endTime"
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    if (errors.end) setErrors({ ...errors, end: undefined });
                  }}
                />
                {errors.end && (
                  <p className="text-red-500 text-xs mt-1 pl-2">{errors.end}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Practice Location
              </p>
              <div className="flex flex-col relative w-full mb-1.5">
                {loadingLocations ? (
                  <p className="text-sm text-gray-500 p-2">
                    Loading locations...
                  </p>
                ) : (
                  <div
                    className={`border-1 px-3 rounded-lg peer bg-white h-[50px] flex items-center ${errors.practiceLocation ? "border-red-500" : "border-inputBorder"}`}
                  >
                    <select
                      className="w-full h-full capitalize text-sm md:text-[16px] bg-transparent outline-none"
                      id="practiceLocation"
                      value={practiceLocationId}
                      onChange={(e) => {
                        setPracticeLocationId(e.target.value);
                        if (errors.practiceLocation)
                          setErrors({ ...errors, practiceLocation: undefined });
                      }}
                      required
                    >
                      <option value="">Select practice location</option>
                      {practiceLocations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.type} - {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {errors.practiceLocation && (
                  <p className="text-red-500 text-xs mt-1 pl-2">
                    {errors.practiceLocation}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Mode of consultation
              </p>
              <div className="flex flex-col relative w-full mb-1.5">
                <div className="border-1 border-inputBorder px-3 rounded-lg peer bg-white h-[50px] flex items-center">
                  <select
                    className="w-full h-full capitalize text-sm md:text-[16px] bg-transparent outline-none"
                    id="mode"
                    value={mode}
                    onChange={(e) => {
                      setMode(e.target.value as "online" | "in-person");
                    }}
                  >
                    {practiceLocations.find(
                      (loc) => loc._id === practiceLocationId,
                    )?.type === "ONLINE" ? (
                      <option value="online">Online</option>
                    ) : (
                      <>
                        <option value="online">Online</option>
                        <option value="in-person">In person</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={recurr}
                  onChange={(e) => setRecurr(e.target.checked)}
                  className="w-4 h-4 text-darkGreen rounded border-gray-300 focus:ring-darkGreen"
                />
                <span className="text-gray-700 font-medium">
                  Create recurring slots
                </span>
              </label>

              {recurr && (
                <div className="flex flex-col gap-2 mt-3 ml-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurr"
                      value="this-week"
                      checked={recurMode === "this-week"}
                      onChange={(e) =>
                        setRecurMode(
                          e.target.value as
                            | "this-week"
                            | "every-this-day"
                            | "this-month",
                        )
                      }
                      className="text-darkGreen focus:ring-darkGreen"
                    />
                    <span className="text-gray-600 text-sm">This week</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurr"
                      value="every-this-day"
                      checked={recurMode === "every-this-day"}
                      onChange={(e) =>
                        setRecurMode(
                          e.target.value as
                            | "this-week"
                            | "every-this-day"
                            | "this-month",
                        )
                      }
                      className="text-darkGreen focus:ring-darkGreen"
                    />
                    <span className="text-gray-600 text-sm">
                      Every {days[new Date(modalDate).getDay()]}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurr"
                      value="this-month"
                      checked={recurMode === "this-month"}
                      onChange={(e) =>
                        setRecurMode(
                          e.target.value as
                            | "this-week"
                            | "every-this-day"
                            | "this-month",
                        )
                      }
                      className="text-darkGreen focus:ring-darkGreen"
                    />
                    <span className="text-gray-600 text-sm">This month</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => toggleCreateSlotModal()}
            >
              Cancel
            </button>
            <button
              className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold hover:opacity-90 transition-all"
              onClick={handleCreateSlot}
            >
              Create Slot
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DCreateSlotModal;
