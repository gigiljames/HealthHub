import React from "react";

interface PaginationBarProps {
  totalPageCount: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

function PaginationBar({ totalPageCount, setCurrentPage }: PaginationBarProps) {
  const totalPages: number[] = [];
  const currentPageBox = document.getElementById("currentPageBox");
  for (let i = 1; i <= totalPageCount; i++) totalPages.push(i);
  return (
    <>
      <div className="flex justify-center items-center my-2">
        <div className="bg-gray-100 p-2 rounded-lg  flex">
          <div className="flex relative">
            <div
              className={` w-9 h-10 bg-lightGreen rounded-md absolute transition-all duration-200`}
              id="currentPageBox"
            ></div>
            {totalPages.map((page, index) => {
              return (
                <button
                  className={`w-9 h-10 font-medium cursor-pointer text-black rounded-sm flex justify-center items-center z-10 `}
                  onClick={() => {
                    setCurrentPage(page);
                    if (currentPageBox)
                      currentPageBox.style.left = `${index * 2.25}rem`;
                  }}
                  key={index}
                >
                  {page}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default PaginationBar;
