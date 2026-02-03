import getIcon from "../../../helpers/getIcon";
import { useSelector } from "react-redux";
import type { RootState } from "../../../state/store";

function DProfileDocuments() {
  const documents = useSelector(
    (state: RootState) => state.dProfileCreation.certificates,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border-1 border-gray-200 p-8">
        <h2 className="uppercase font-semibold text-lg mb-6">Documents</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-800 text-sm">
          Documents cannot be edited here. Please contact support to update your
          verified documents.
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getIcon("id-card", "24px", "gray")}
              </div>
              <div>
                <p className="font-semibold text-gray-800">Medical License</p>
              </div>
            </div>
            <a
              href={documents.medicalLicense}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Document
            </a>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getIcon("graduation-cap", "24px", "gray")}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Latest Degree Certificate
                </p>
              </div>
            </div>
            <a
              href={documents.latestDegree}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Document
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DProfileDocuments;
