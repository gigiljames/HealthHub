export interface GetUsersRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
  blocked?: boolean;
  unblocked?: boolean;
  newUser?: boolean;
}

export interface UserListItemDTO {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isNewUser: boolean;
}

export interface GetUsersResponseDTO {
  users: UserListItemDTO[];
  totalDocumentCount: number;
}

export interface GetUserProfileResponseDTO {
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
  pastDiseases: {
    bronchialAsthma: { value: boolean };
    epilepsy: { value: boolean };
    tuberculosis: { value: boolean };
  };
  pastSurgeries: {
    year: number;
    surgeryName: string;
    reason: string;
    surgeryType: "major" | "minor";
    doctor: string;
    hospital: string;
  }[];
}

export interface ChangeUserStatusRequestDTO {
  id: string;
}
