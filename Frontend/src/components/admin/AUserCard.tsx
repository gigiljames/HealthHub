import { useEffect } from "react";
import { getUser } from "../../api/admin/userManagementService";
import { useAdminStore } from "../../zustand/adminStore";
import getIcon from "../../helpers/getIcon";

function AUserCard() {
  const userId = useAdminStore((state) => state.userId);
  const toggleUserCard = useAdminStore((state) => state.toggleUserCard);
  useEffect(() => {
    // getUser(userId).then(() => {});
  });
  return (
    <>
      <div
        className="h-[200px] w-[200px] bg-red-500"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        User Card
        <div onClick={() => toggleUserCard()}>
          {getIcon("close", "24px", "#000000")}
        </div>
      </div>
    </>
  );
}

export default AUserCard;
