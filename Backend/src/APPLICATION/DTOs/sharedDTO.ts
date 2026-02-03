export interface updateProfileImageDTO {
  userId: string;
  action: "SET" | "REMOVE";
  imageKey?: string;
}
