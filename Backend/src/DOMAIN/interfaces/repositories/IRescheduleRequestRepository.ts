import RescheduleRequest from "../../../domain/entities/rescheduleRequest";
import { IBaseRepository } from "./IBaseRepository";

export interface IRescheduleRequestRepository extends IBaseRepository<RescheduleRequest> {
  create(request: RescheduleRequest): Promise<RescheduleRequest>;
  save(request: RescheduleRequest): Promise<RescheduleRequest>;
  findPendingByAppointmentId(appointmentId: string): Promise<RescheduleRequest | null>;
}
