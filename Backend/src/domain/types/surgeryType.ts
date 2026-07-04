export type Surgery = {
  year: number;
  surgeryName: string;
  reason: string;
  surgeryType: "major" | "minor";
  hospital: string;
  doctor: string;
};
