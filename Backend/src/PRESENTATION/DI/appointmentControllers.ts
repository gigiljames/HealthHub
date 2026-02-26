import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { GetPatientAppointmentsUseCase } from "../../application/usecases/appointment/GetPatientAppointmentsUseCase";
import { GetPatientAppointmentByIdUseCase } from "../../application/usecases/appointment/GetPatientAppointmentByIdUseCase";
import { GetDoctorAppointmentsUseCase } from "../../application/usecases/appointment/GetDoctorAppointmentsUseCase";
import { GetDoctorAppointmentByIdUseCase } from "../../application/usecases/appointment/GetDoctorAppointmentByIdUseCase";
import { GetAllAppointmentsUseCase } from "../../application/usecases/appointment/GetAllAppointmentsUseCase";
import { GetAdminAppointmentByIdUseCase } from "../../application/usecases/appointment/GetAdminAppointmentByIdUseCase";
import { PatientAppointmentController } from "../controllers/patient/PatientAppointmentController";
import { DoctorAppointmentController } from "../controllers/doctor/DoctorAppointmentController";
import { AdminAppointmentController } from "../controllers/admin/AdminAppointmentController";

const appointmentRepository = new AppointmentRepository();

const getPatientAppointmentsUseCase = new GetPatientAppointmentsUseCase(
  appointmentRepository,
);
const getPatientAppointmentByIdUseCase = new GetPatientAppointmentByIdUseCase(
  appointmentRepository,
);

export const injectedPatientAppointmentController =
  new PatientAppointmentController(
    getPatientAppointmentsUseCase,
    getPatientAppointmentByIdUseCase,
  );

const getDoctorAppointmentsUseCase = new GetDoctorAppointmentsUseCase(
  appointmentRepository,
);
const getDoctorAppointmentByIdUseCase = new GetDoctorAppointmentByIdUseCase(
  appointmentRepository,
);

export const injectedDoctorAppointmentController =
  new DoctorAppointmentController(
    getDoctorAppointmentsUseCase,
    getDoctorAppointmentByIdUseCase,
  );

const getAllAppointmentsUseCase = new GetAllAppointmentsUseCase(
  appointmentRepository,
);
const getAdminAppointmentByIdUseCase = new GetAdminAppointmentByIdUseCase(
  appointmentRepository,
);

export const injectedAdminAppointmentController =
  new AdminAppointmentController(
    getAllAppointmentsUseCase,
    getAdminAppointmentByIdUseCase,
  );
