import { useEffect, useState } from "react";
import getIcon from "../../helpers/getIcon";
import { useAdminStore } from "../../zustand/adminStore";

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  isNewUser: boolean;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  gender?: string;
  dob?: Date | null;
  specialization?: {
    name: string;
  };
  about?: string;
  verificationStatus?: string;
  verificationRemarks?: string;
  education?: Array<{
    title: string;
    institution: string;
    graduationYear: number;
  }>;
  experience?: Array<{
    designation: string;
    hospital: string;
    startDate: Date;
    endDate?: Date;
    type: string;
  }>;
  independentFee?: number;
  isVisible?: boolean;
  lastUpdated?: Date;
}

function ADoctorCard() {
  const doctorId = useAdminStore((state) => state.doctorId);
  const toggleDoctorCard = useAdminStore((state) => state.toggleDoctorCard);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an API call
        // const data = await getDoctor(doctorId);
        // if (data.success) {
        //   setDoctorProfile(data.doctor);
        // }

        // Dummy data implementation
        const dummyDoctor: DoctorProfile = {
          id: doctorId,
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@example.com",
          phone: "+1 (555) 123-4567",
          isBlocked: false,
          isNewUser: false,
          profileImageUrl:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          bannerImageUrl:
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
          gender: "female",
          dob: new Date("1985-05-15"),
          specialization: { name: "Cardiology" },
          about:
            "Board-certified cardiologist with over 10 years of experience in treating heart conditions. Specializes in interventional cardiology and preventive care.",
          verificationStatus: "verified",
          education: [
            {
              title: "MD in Cardiology",
              institution: "Harvard Medical School",
              graduationYear: 2010,
            },
            {
              title: "MBBS",
              institution: "Johns Hopkins University",
              graduationYear: 2006,
            },
          ],
          experience: [
            {
              designation: "Senior Cardiologist",
              hospital: "City General Hospital",
              startDate: new Date("2015-01-01"),
              type: "Full-time",
            },
            {
              designation: "Resident",
              hospital: "Metro Health Center",
              startDate: new Date("2010-06-01"),
              endDate: new Date("2014-12-31"),
              type: "Full-time",
            },
          ],
          independentFee: 150,
          isVisible: true,
          lastUpdated: new Date(),
        };

        setDoctorProfile(dummyDoctor);
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchDoctorProfile();
  }, [doctorId]);

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={(e) => {
          e.stopPropagation();
          toggleDoctorCard();
        }}
      >
        <div
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightGreen"></div>
            <p className="mt-4 text-gray-600">Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={(e) => {
          e.stopPropagation();
          toggleDoctorCard();
        }}
      >
        <div
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-8">
            <p className="text-red-500 font-medium">
              Failed to load doctor profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        e.stopPropagation();
        toggleDoctorCard();
      }}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Doctor Profile</h2>
          <button
            onClick={toggleDoctorCard}
            className="text-gray-500 hover:text-gray-700"
          >
            {getIcon("close", "24px", "currentColor")}
          </button>
        </div>

        {/* Profile Header */}
        <div className="mt-6">
          {/* Banner Image */}
          <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
            {doctorProfile.bannerImageUrl ? (
              <img
                src={doctorProfile.bannerImageUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-50 to-cyan-50"></div>
            )}
            {/* Profile Image */}
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white">
                {doctorProfile.profileImageUrl ? (
                  <img
                    src={doctorProfile.profileImageUrl}
                    alt={doctorProfile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                    {doctorProfile.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="mt-14 pl-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {doctorProfile.name}
                </h1>
                <p className="text-gray-600">
                  {doctorProfile.specialization?.name || "General Practitioner"}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctorProfile.isBlocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {doctorProfile.isBlocked ? "Blocked" : "Active"}
                </span>
                {doctorProfile.verificationStatus && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doctorProfile.verificationStatus === "verified"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doctorProfile.verificationStatus === "verified"
                      ? "Verified"
                      : "Pending Verification"}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{doctorProfile.email}</p>
              </div>
              {doctorProfile.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{doctorProfile.phone}</p>
                </div>
              )}
              {doctorProfile.dob && (
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(doctorProfile.dob).toLocaleDateString()}
                  </p>
                </div>
              )}
              {doctorProfile.gender && (
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">
                    {doctorProfile.gender}
                  </p>
                </div>
              )}
              {doctorProfile.independentFee && (
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-medium">${doctorProfile.independentFee}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Profile Status</p>
                <p className="font-medium">
                  {doctorProfile.isNewUser ? "New User" : "Profile Completed"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Visibility</p>
                <p className="font-medium">
                  {doctorProfile.isVisible ? "Visible" : "Hidden"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {doctorProfile.about && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-gray-700">{doctorProfile.about}</p>
          </div>
        )}

        {/* Education */}
        {doctorProfile.education && doctorProfile.education.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Education
            </h3>
            <div className="space-y-4">
              {doctorProfile.education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                >
                  <h4 className="font-medium text-gray-900">{edu.title}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    Graduated: {edu.graduationYear}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {doctorProfile.experience && doctorProfile.experience.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Work Experience
            </h3>
            <div className="space-y-4">
              {doctorProfile.experience.map((exp, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                >
                  <h4 className="font-medium text-gray-900">
                    {exp.designation}
                  </h4>
                  <p className="text-gray-600">{exp.hospital}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString()} -{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : "Present"}{" "}
                    - {exp.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              doctorProfile.isBlocked
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {doctorProfile.isBlocked ? "Unblock Doctor" : "Block Doctor"}
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              doctorProfile.verificationStatus === "verified"
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {doctorProfile.verificationStatus === "verified"
              ? "Revoke Verification"
              : "Verify Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ADoctorCard;
