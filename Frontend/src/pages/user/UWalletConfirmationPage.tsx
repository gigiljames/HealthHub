import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { getUserTransactions } from "../../api/user/walletService";

function UWalletConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status"); // "success" or "failure"
  const isSuccess = status === "success";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuccess) {
      setLoading(false);
      return;
    }
    if (!id) return;
    (async () => {
      try {
        const res = await getUserTransactions();
        const txs = res?.data?.transactions || res?.transactions || [];
        const exists = txs.some(
          (t: any) => t.id === id || t._id === id || t.gatewayRef === id,
        );
        if (!exists) {
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
  }, [id, isSuccess, navigate]);

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
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Top-up Successful!
              </h1>
              <p className="text-gray-500 dark:text-gray-450 text-sm mb-8">
                Your payment has been successfully processed and the funds have
                been added to your wallet balance.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/wallet")}
                  className="w-full bg-darkGreen text-white font-semibold py-3 rounded-xl hover:bg-darkGreen/90 transition-all cursor-pointer"
                >
                  Go to Wallet
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-gray-300 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
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
                Top-up Failed
              </h1>
              <p className="text-gray-500 dark:text-gray-450 text-sm mb-8">
                Your payment could not be processed. No charges have been made.
                Please try again or use a different payment method.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/wallet")}
                  className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-all cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-gray-300 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
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

export default UWalletConfirmationPage;
