import { useEffect, useState } from "react";
import { getUser } from "../../api/admin/userManagementService";
import { useAdminStore } from "../../zustand/adminStore";
import getIcon from "../../helpers/getIcon";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  isNewUser: boolean;
  bloodGroup: string;
  maritalStatus: string;
  dob: Date | null;
  gender: string;
  occupation: string;
  profileImageUrl: string | null;
  allergies: string[];
  bodyMetrics: {
    height: number;
    weight: number;
    lastUpdated: Date | null;
  };
  contact: {
    address: string;
    phone: string;
  };
}

function AUserCard() {
  const userId = useAdminStore((state) => state.userId);
  const toggleUserCard = useAdminStore((state) => state.toggleUserCard);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const data = await getUser(userId);
        if (data.success) {
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <>
        <div
          className="absolute top-0 h-screen w-full flex justify-center items-center bg-black/50 z-50 px-2"
          onClick={(e) => {
            e.stopPropagation();
            toggleUserCard();
          }}
        >
          <div
            className="relative flex flex-col justify-center items-center bg-white p-6 rounded-xl gap-3 w-full lg:w-fit min-w-[350px] max-w-[500px]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightGreen"></div>
              <p className="text-gray-600 font-medium">
                Loading user profile...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <div
          className="absolute top-0 h-screen w-screen flex justify-center items-center bg-black/50 z-50 px-2"
          onClick={(e) => {
            e.stopPropagation();
            toggleUserCard();
          }}
        >
          <div
            className="relative flex flex-col justify-center items-center bg-white p-6 rounded-xl gap-3 w-full lg:w-fit min-w-[350px] max-w-[500px]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-red-500 font-medium">
                Failed to load user profile
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div
        className="absolute top-0 h-screen w-full flex justify-center items-center bg-black/50 z-50 px-2"
        onClick={(e) => {
          e.stopPropagation();
          toggleUserCard();
        }}
      >
        <div
          className="relative flex flex-col bg-white p-6 rounded-xl gap-4 w-full lg:w-fit min-w-[400px] max-w-[600px] max-h-[80vh] overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b-1 border-b-gray-200 pb-3">
            <h1 className="font-bold text-xl text-black">User Profile</h1>
            <button
              onClick={() => toggleUserCard()}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              {getIcon("close", "24px", "#000000")}
            </button>
          </div>

          {/* Profile Content */}
          <div className="flex flex-col gap-4">
            {/* Profile Header with Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                {userProfile.profileImageUrl ? (
                  <img
                    src={userProfile.profileImageUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-600">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-black">
                  {userProfile.name}
                </h2>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile.isBlocked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {userProfile.isBlocked ? "Blocked" : "Active"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile.isNewUser
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {userProfile.isNewUser ? "New User" : "Profile completed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wider">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Gender</p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.gender || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Date of Birth
                  </p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.dob
                      ? new Date(userProfile.dob).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Blood Group
                  </p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.bloodGroup || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Marital Status
                  </p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.maritalStatus || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Occupation
                  </p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.occupation || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wider">
                Contact Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Primary Phone
                  </p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.contact.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <p className="text-sm text-black font-medium">
                    {userProfile.contact.address || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wider">
                Health Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Height</p>
                    <p className="text-sm text-black font-medium">
                      {userProfile.bodyMetrics.height
                        ? `${userProfile.bodyMetrics.height} cm`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Weight</p>
                    <p className="text-sm text-black font-medium">
                      {userProfile.bodyMetrics.weight
                        ? `${userProfile.bodyMetrics.weight} kg`
                        : "-"}
                    </p>
                  </div>
                </div>
                {userProfile.allergies && userProfile.allergies.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {userProfile.bodyMetrics.lastUpdated && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Last Updated
                    </p>
                    <p className="text-sm text-black font-medium">
                      {new Date(
                        userProfile.bodyMetrics.lastUpdated
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AUserCard;
