import React, { useEffect, useRef, useState, type RefObject } from "react";

interface ASpecializationModalProps {
  type: "add" | "edit";
  callback: (name: string, desc: string) => Promise<void>;
  setShowSpecializationModal: React.Dispatch<React.SetStateAction<boolean>>;
  editData?: { id: string; name: string; desc: string };
}

function ASpecializationModal({
  type,
  callback,
  setShowSpecializationModal,
  editData,
}: ASpecializationModalProps) {
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  useEffect(() => {
    if (type === "edit" && editData) {
      setName(editData.name);
      setDesc(editData.desc);
    }
  }, [editData, type]);

  const nameRegex = /^[A-Za-z][A-Za-z\s&-]{1,49}$/;
  const descRegex = /^[A-Za-z0-9\s.,()&-]{10,200}$/;
  const nameErrorRef = useRef<HTMLDivElement>(null);
  const descErrorRef = useRef<HTMLDivElement>(null);

  function removeErrors() {
    if (nameErrorRef.current) nameErrorRef.current.innerText = "";
    if (descErrorRef.current) descErrorRef.current.innerText = "";
  }

  function showError(ref: RefObject<HTMLDivElement | null>, message: string) {
    if (ref.current) {
      ref.current.innerText = message;
    }
  }
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    removeErrors();

    let valid = true;
    if (!name) {
      valid = false;
      showError(nameErrorRef, "Enter name of the specialization.");
    } else if (!nameRegex.test(name)) {
      valid = false;
      showError(nameErrorRef, "Enter a valid name.");
    }
    if (desc.length < 10) {
      valid = false;
      showError(
        descErrorRef,
        "Description must be at least 10 characters long."
      );
    } else if (!descRegex.test(desc)) {
      valid = false;
      showError(descErrorRef, "Enter a valid description.");
    }
    if (valid) {
      await callback(name, desc);
    }
  }
  return (
    <>
      <div
        className={`absolute top-0 h-screen w-screen flex justify-center items-center bg-black/50 z-50 px-2`}
      >
        <div className="relative flex flex-col justify-center items-center bg-white p-6 rounded-xl gap-3 w-full lg:w-fit ">
          {type === "add" && (
            <>
              <h1 className="font-bold text-xl">Add Specialization</h1>
              <p className="font-semibold text-red-400 text-[14px]/[17px] lg:w-[400px] ">
                Note: You cannot delete a specialization after adding it. You
                can only de-activate it.
              </p>
            </>
          )}
          {type === "edit" && (
            <h1 className="font-bold text-xl">Edit Specialization</h1>
          )}

          <form
            className="flex flex-col w-full lg:min-w-[400px] gap-2"
            onSubmit={(e) => handleFormSubmit(e)}
          >
            <div className="flex flex-col">
              <h3 className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Specialization name
              </h3>
              <input
                className="p-3 border-1 border-inputBorder rounded-lg"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
              <div className="text-red-500 mb-1" ref={nameErrorRef}></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Description
              </h3>
              <textarea
                className="p-3 border-1 border-inputBorder rounded-lg min-h-40 max-h-100"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter description"
              ></textarea>
              <div className="text-red-500 mb-1" ref={descErrorRef}></div>
            </div>
            <div className="flex gap-2 flex-col-reverse lg:flex-row w-full">
              <button
                type="button"
                className="py-2 px-8 rounded-lg bg-gray-300 text-white text-center font-semibold hover:-translate-y-0.5 transition-all duration-200 w-full"
                onClick={() => setShowSpecializationModal(false)}
              >
                Close
              </button>
              <button
                type="submit"
                className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold hover:-translate-y-0.5 transition-all duration-200 w-full"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ASpecializationModal;
