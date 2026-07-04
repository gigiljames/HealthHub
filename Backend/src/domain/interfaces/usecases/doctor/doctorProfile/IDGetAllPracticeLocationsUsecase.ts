import { PracticeLocation } from "../../../../types/practiceLocation";

export interface IDGetAllPracticeLocationsUsecase {
  execute(userId: string): Promise<PracticeLocation[]>;
}
