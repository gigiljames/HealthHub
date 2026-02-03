import { PracticeLocation } from "../../../../types/practiceLocation";

export interface IDGetPracticeLocationsUsecase {
  execute(userId: string): Promise<PracticeLocation[]>;
}
