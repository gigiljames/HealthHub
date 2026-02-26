import React from "react";

interface UPaymentModalProps {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onClose: () => void;
}

const UPaymentModal: React.FC<UPaymentModalProps> = ({
  amount,
  currency,
  onSuccess,
  onClose,
}) => {
  const handlePay = async () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-6 flex flex-col gap-3">
          <button
            onClick={handlePay}
            className="w-full bg-darkGreen/90 hover:bg-darkGreen text-white font-semibold py-3 rounded-xl  disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {`Pay ${currency.toUpperCase()} ${amount.toFixed(2)}`}
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UPaymentModal;
