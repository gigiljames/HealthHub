export const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-sm w-fit">
          Approved
        </span>
      );
    case "verified":
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-sm w-fit">
          Verified
        </span>
      );
    case "rejected":
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium text-sm w-fit">
          Rejected
        </span>
      );
    case "pending":
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium text-sm w-fit">
          Pending
        </span>
      );
    case "resubmitted":
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm w-fit">
          Resubmitted
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-sm w-fit">
          {status}
        </span>
      );
  }
};
