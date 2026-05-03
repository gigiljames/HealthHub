import { DoctorDayScheduleDTO, TodayAppointmentDTO, TodaySlotDTO } from "../../DTOs/doctor/DoctorDashboardDTO";
import { IGetDoctorDayScheduleUseCase } from "../../../domain/interfaces/usecases/doctor/IGetDoctorDayScheduleUseCase";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { SlotStatus } from "../../../domain/enums/slotStatus";

export class GetDoctorDayScheduleUseCase implements IGetDoctorDayScheduleUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
  ) {}

  async execute(doctorId: string, date: Date): Promise<DoctorDayScheduleDTO> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const appointmentsRaw = await this._appointmentRepository.getDoctorDayExecutionAppointments(
      doctorId,
      startOfDay,
      endOfDay,
    );

    const concreteSlots = await this._slotRepository.findConcreteSlotsByDoctorIdInRange(
      doctorId,
      startOfDay,
      endOfDay,
    );

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

    const slots: TodaySlotDTO[] = concreteSlots.map((slot) => ({
      id: slot.id as string,
      start: slot.start,
      end: slot.end,
      isBooked: slot.status === SlotStatus.BOOKED,
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
