import getIcon from "../../../helpers/getIcon";

function DProfileDocuments() {
  // const [documents, setDocuments] = useState<any[]>([]);

  // useEffect(() => {
  // setLoading(true);
  // getDoctorProfileStage4() ...
  //   .finally(() => setLoading(false));
  // }, []);

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
                {getIcon("document", "24px", "gray")}
              </div>
              <div>
                <p className="font-semibold text-gray-800">Medical License</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
            <button className="text-darkGreen font-medium hover:underline text-sm">
              View
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getIcon("document", "24px", "gray")}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Latest Degree Certificate
                </p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
            <button className="text-darkGreen font-medium hover:underline text-sm">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DProfileDocuments;
