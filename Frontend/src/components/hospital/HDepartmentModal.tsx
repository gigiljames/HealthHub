import React, { useEffect, useRef, useState, type RefObject } from "react";

interface ASpecializationModalProps {
  type: "add" | "edit";
  callback: (name: string, color: string) => Promise<void>;
  setShowDepartmentModal: React.Dispatch<React.SetStateAction<boolean>>;
  editData?: { id: string; name: string; color: string };
}

function HDepartmentModal({
  type,
  callback,
  setShowDepartmentModal,
  editData,
}: ASpecializationModalProps) {
  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>("#bed7cd");
  useEffect(() => {
    if (type === "edit" && editData) {
      setName(editData.name);
      setColor(editData.color);
    }
  }, [editData, type]);

  const nameRegex = /^[A-Za-z][A-Za-z\s&-]{1,49}$/;
  const nameErrorRef = useRef<HTMLDivElement>(null);
  const colorErrorRef = useRef<HTMLDivElement>(null);

  function removeErrors() {
    if (nameErrorRef.current) nameErrorRef.current.innerText = "";
    if (colorErrorRef.current) colorErrorRef.current.innerText = "";
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
      showError(nameErrorRef, "Enter name of the department.");
    } else if (!nameRegex.test(name)) {
      valid = false;
      showError(nameErrorRef, "Enter a valid name.");
    }
    if (!color) {
      valid = false;
      showError(colorErrorRef, "Pick a color");
    }
    if (valid) {
      await callback(name, color);
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
              <h1 className="font-bold text-xl">Create Department</h1>
            </>
          )}
          {type === "edit" && (
            <h1 className="font-bold text-xl">Edit Department</h1>
          )}

          <form
            className="flex flex-col w-full lg:min-w-[400px] gap-2"
            onSubmit={(e) => handleFormSubmit(e)}
          >
            <div className="flex flex-col">
              <h3 className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Department name
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
                Department Color
              </h3>
              <div className=" flex p-3 border-1 border-inputBorder rounded-lg gap-2">
                <input
                  type="color"
                  className="colorInput w-full h-15"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input
                  type="text"
                  className="text-center w-full font-medium"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div className="text-red-500 mb-1" ref={colorErrorRef}></div>
            </div>
            <div className="flex gap-2 flex-col-reverse lg:flex-row w-full">
              <button
                type="button"
                className="py-2 px-8 rounded-lg bg-gray-300 text-white text-center font-semibold hover:-translate-y-0.5 transition-all duration-200 w-full"
                onClick={() => setShowDepartmentModal(false)}
              >
                Close
              </button>
              <button
                type="submit"
                className="py-2 px-8 rounded-lg bg-darkGreen text-white text-center font-semibold hover:-translate-y-0.5 transition-all duration-200 w-full"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default HDepartmentModal;
