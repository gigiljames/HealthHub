import { DoctorDayScheduleDTO, TodayAppointmentDTO, TodaySlotDTO } from "../../DTOs/doctor/DoctorDashboardDTO";
import { IGetDoctorDayScheduleUseCase } from "../../../domain/interfaces/usecases/doctor/IGetDoctorDayScheduleUseCase";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetSlotsUsecase";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { SlotStatus } from "../../../domain/enums/slotStatus";

export class GetDoctorDayScheduleUseCase implements IGetDoctorDayScheduleUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _getSlotsUsecase: IGetSlotsUsecase,
  ) {}

  async execute(doctorId: string, date: Date): Promise<DoctorDayScheduleDTO> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const appointmentsRaw = await this._appointmentRepository.getDoctorDayExecutionAppointments(
      doctorId,
      startOfDay,
      endOfDay,
    );

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const slotsRaw = await this._getSlotsUsecase.execute({
      doctorId,
      startDate: dateStr,
      endDate: dateStr,
      excludePast: false,
    });

    const appointments: TodayAppointmentDTO[] = appointmentsRaw.map((app) => ({
      id: app.id,
      status: app.status,
      start: app.start,
      end: app.end,
      patientName: app.patientName,
      dob: app.dob,
      gender: app.gender,
      bloodGroup: app.bloodGroup,
      profileImageUrl: app.profileImageUrl,
      reason: app.reason,
      mode: app.mode,
    }));

    const slots: TodaySlotDTO[] = slotsRaw.map((slot) => ({
      id: slot.id as string,
      start: new Date(slot.start),
      end: new Date(slot.end),
      isBooked: slot.status === SlotStatus.BOOKED,
      practiceLocationId: slot.practiceLocationId,
    }));

    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(
      (app) => app.status === AppointmentStatus.CONFIRMED
    ).length;

    const now = new Date();
    const upcomingAppointments = appointments
      .filter((app) => app.start > now && app.status === AppointmentStatus.CONFIRMED)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0].start : null;

    return {
      totalAppointments,
      pendingAppointments,
      nextAppointment,
      appointments,
      slots,
    };
  }
}
