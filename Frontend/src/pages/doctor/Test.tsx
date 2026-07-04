import React, { useState } from "react";

function Test() {
  const [infoTab, setInfoTab] = useState(true);
  const [reportTab, setReportTab] = useState(true);
  const [videoTab, setVideoTab] = useState(true);
  return (
    <div className="p-10 h-screen">
      <div className="flex h-full w-full gap-2">
        <div
          className={`bg-teal-300 ${infoTab ? "w-full p-4" : "w-[75px]"} min-w-[75px] rounded-2xl flex flex-col gap-1 pt-2 h-full transition-all duration-300`}
          onClick={() => {
            if (infoTab && !reportTab && !videoTab) {
              setReportTab(true);
            }
            setInfoTab((prev) => !prev);
          }}
        >
          {infoTab && (
            <>
              <div className="text-lg uppercase font-semibold">
                Patient Info
              </div>
              <div
                className="bg-white h-full rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                sdkfklsdj hjkdshfkjldsfh jksdf hjkdsfh kdsjklfh kjsdf hljksdlh
                fjkdsfh jksdf hsdjkfh jksdfh jksldfh lkjsdfh sdkj fjkdsf hdsjkfh
                jkdsfh jkdsfh jkdsfh sdjklfh sdjkfh dsjkfh dsjkfh dsjkfh dsjkfh
                dsjkfhjkdsfh djklsfh djks hjk
                hfjkdsfhjkdsfhjksdhfkjsdhjkcvnx,mvneuiwahuir jv uiohunvkc
                vihnireuv njnv ,m,cxv nsduin in
              </div>
            </>
          )}
          {!infoTab && (
            <div className="font-bold h-full flex uppercase items-center justify-start">
              {/* <span className="rotate-270 h-fit">patient information</span> */}
            </div>
          )}
        </div>
        <div
          className={`bg-orange-300 ${reportTab ? "w-full" : "w-[75px]"} min-w-[75px] rounded-2xl p-4 pt-2 flex flex-col gap-1 h-full transition-all duration-300`}
          onClick={() => {
            if (reportTab && !infoTab && !videoTab) {
              setInfoTab(true);
            }
            setReportTab((prev) => !prev);
          }}
        >
          {reportTab && (
            <>
              <div className="text-lg uppercase font-semibold">Reports</div>
              <div
                className="bg-white h-full rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                sdkfklsdj hjkdshfkjldsfh jksdf hjkdsfh kdsjklfh kjsdf hljksdlh
                fjkdsfh jksdf hsdjkfh jksdfh jksldfh lkjsdfh sdkj fjkdsf hdsjkfh
                jkdsfh jkdsfh jkdsfh sdjklfh sdjkfh dsjkfh dsjkfh dsjkfh dsjkfh
                dsjkfhjkdsfh djklsfh djks hjk
                hfjkdsfhjkdsfhjksdhfkjsdhjkcvnx,mvneuiwahuir jv uiohunvkc
                vihnireuv njnv ,m,cxv nsduin in
              </div>
            </>
          )}
          {!reportTab && (
            <div className="font-bold h-full flex uppercase items-center justify-start">
              {/* <span className="rotate-270 h-fit">patient information</span> */}
            </div>
          )}
        </div>
        <div
          className={`bg-emerald-300 ${videoTab ? "w-full" : "w-[75px]"} min-w-[75px] rounded-2xl p-4 pt-2 flex flex-col gap-1 h-full transition-all duration-300`}
          onClick={() => {
            if (videoTab && !reportTab && !infoTab) {
              setReportTab(true);
            }
            setVideoTab((prev) => !prev);
          }}
        >
          {videoTab && (
            <>
              <div className="text-lg uppercase font-semibold">
                Patient Info
              </div>
              <div
                className="bg-black h-full rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              ></div>
            </>
          )}
          {!videoTab && (
            <div className="font-bold h-full flex uppercase items-center justify-start">
              {/* <span className="rotate-270 h-fit">patient information</span> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Test;
