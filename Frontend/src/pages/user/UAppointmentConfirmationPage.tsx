import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { getAppointmentById } from "../../api/user/bookingService";

function UAppointmentConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status"); // "success" or "failure"
  const isSuccess = status === "success";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getAppointmentById(id);
        if (!res?.data) {
          navigate("/404");
          return;
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          navigate("/403");
        } else {
          navigate("/404");
        }
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <svg
          className="animate-spin h-10 w-10 text-darkGreen"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          {isSuccess ? (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                Your appointment has been successfully booked. You will receive
                a confirmation notification shortly.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/appointments")}
                  className="w-full bg-darkGreen text-white font-semibold py-3 rounded-xl hover:bg-darkGreen/90 transition-all"
                >
                  View My Appointments
                </button>
                <button
                  onClick={() => navigate("/home")}
                  className="w-full border border-gray-300 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                Your payment could not be processed. No charges have been made.
                Please try again or use a different payment method.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-gray-300 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UAppointmentConfirmationPage;
