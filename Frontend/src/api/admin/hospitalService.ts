import { AxiosError, type AxiosResponse } from "axios";

// Dummy hospital data
const dummyHospitals = [
  {
    id: "1",
    name: "City General Hospital",
    email: "contact@citygeneral.com",
    isBlocked: false,
    isNewUser: false,
    type: "Multi-specialty",
    establishedYear: 1995,
    about:
      "City General Hospital is a leading healthcare provider with state-of-the-art facilities and a team of experienced medical professionals dedicated to providing exceptional patient care.",
    profileImageUrl:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    features: [
      "Emergency Care",
      "ICU",
      "Cardiology",
      "Neurology",
      "Pediatrics",
      "Maternity",
    ],
    contact: {
      address: "123 Healthcare Ave, Medical District, City, State 12345",
      phone: "+1 (555) 123-4567",
      email: "contact@citygeneral.com",
      website: "www.citygeneral.com",
    },
    verificationStatus: "verified",
    verificationRemarks: "All documents verified and approved.",
    submissionDate: new Date("2023-01-15"),
    acceptedTerms: true,
  },
  {
    id: "2",
    name: "Sunrise Medical Center",
    email: "info@sunrisemed.com",
    isBlocked: false,
    isNewUser: false,
    type: "Specialty Hospital",
    establishedYear: 2010,
    about:
      "Specializing in orthopedics and sports medicine, Sunrise Medical Center provides comprehensive care for bone, joint, and muscle conditions.",
    profileImageUrl:
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8b25a8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    features: [
      "Orthopedics",
      "Sports Medicine",
      "Physiotherapy",
      "Pain Management",
    ],
    contact: {
      address: "456 Health St, Downtown, City, State 12345",
      phone: "+1 (555) 987-6543",
      email: "info@sunrisemed.com",
      website: "www.sunrisemed.com",
    },
    verificationStatus: "pending",
    submissionDate: new Date("2023-03-20"),
    acceptedTerms: true,
  },
  {
    id: "3",
    name: "Green Valley Clinic",
    email: "support@greenvalleyclinic.org",
    isBlocked: true,
    isNewUser: false,
    type: "Community Clinic",
    establishedYear: 2005,
    about:
      "Providing affordable healthcare services to the local community with a focus on family medicine and preventive care.",
    profileImageUrl:
      "https://images.unsplash.com/photo-1585435557343-3b109fda45ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    features: [
      "Family Medicine",
      "Pediatrics",
      "Vaccinations",
      "Basic Diagnostics",
    ],
    contact: {
      address: "789 Main St, Green Valley, City, State 12345",
      phone: "+1 (555) 456-7890",
      email: "support@greenvalleyclinic.org",
    },
    verificationStatus: "rejected",
    verificationRemarks: "Missing required certification documents.",
    submissionDate: new Date("2023-02-10"),
    acceptedTerms: true,
  },
];

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getHospitals(
  search: string,
  page: number,
  limit: number,
  sort: string
) {
  try {
    // In a real implementation, this would be an API call
    // const response = await axios.get(
    //   `/admin/hospitals?search=${search}&page=${page}&limit=${limit}&sort=${sort}`
    // );
    // return handleAxiosResponse(response, "GET_HOSPITALS");

    // Dummy implementation
    const filteredHospitals = dummyHospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(search.toLowerCase()) ||
        hospital.email.toLowerCase().includes(search.toLowerCase())
    );

    // Simple sorting for demo purposes
    const sortedHospitals = [...filteredHospitals].sort((a, b) => {
      if (sort === "alpha-asc") return a.name.localeCompare(b.name);
      if (sort === "alpha-desc") return b.name.localeCompare(a.name);
      return 0;
    });

    // Simple pagination for demo purposes
    const startIndex = (page - 1) * limit;
    const paginatedHospitals = sortedHospitals.slice(
      startIndex,
      startIndex + limit
    );

    return {
      success: true,
      hospitals: paginatedHospitals,
      totalDocumentCount: filteredHospitals.length,
      totalPages: Math.ceil(filteredHospitals.length / limit),
      currentPage: page,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    console.error("Error in getHospitals:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function getHospital(id: string) {
  try {
    // In a real implementation, this would be an API call
    // const response = await axios.get(`/admin/hospitals/${id}`);
    // return handleAxiosResponse(response, "GET_HOSPITAL");

    // Dummy implementation
    const hospital = dummyHospitals.find((h) => h.id === id);

    if (!hospital) {
      return {
        success: false,
        message: "Hospital not found",
      };
    }

    return {
      success: true,
      hospital: hospital,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    console.error("Error in getHospital:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
