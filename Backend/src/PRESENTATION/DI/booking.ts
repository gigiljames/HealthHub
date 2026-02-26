import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { PaymentRepository } from "../../infrastructure/repositories/paymentRepository";
import { StripePaymentAdapter } from "../../infrastructure/gateways/StripePaymentAdapter";
import { LockSlotUseCase } from "../../application/usecases/booking/LockSlotUseCase";
import { BookAppointmentUseCase } from "../../application/usecases/booking/BookAppointmentUseCase";
import { PatientBookingController } from "../controllers/PatientBookingController";

// Repositories
const slotRepository = new SlotRepository();
const appointmentRepository = new AppointmentRepository();
const paymentRepository = new PaymentRepository();

// Gateways
const stripePaymentAdapter = new StripePaymentAdapter(
  process.env.STRIPE_SECRET_KEY || "mock_secret_key",
);

// Use Cases
const lockSlotUseCase = new LockSlotUseCase(slotRepository);
const bookAppointmentUseCase = new BookAppointmentUseCase(
  slotRepository,
  appointmentRepository,
  stripePaymentAdapter,
  paymentRepository,
);

// Controller
export const injectedBookingController = new PatientBookingController(
  lockSlotUseCase,
  bookAppointmentUseCase,
);
