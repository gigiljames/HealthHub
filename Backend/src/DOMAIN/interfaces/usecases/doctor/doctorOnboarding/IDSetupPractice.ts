import { PracticeType } from "../../../../enums/practiceType";

export interface IDSetupPractice {
  execute(doctorId: string, practiceType: PracticeType): Promise<void>;
}
