import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { PaymentRepository } from "../../infrastructure/repositories/paymentRepository";
import { StripePaymentAdapter } from "../../infrastructure/gateways/StripePaymentAdapter";
import { ConfirmPaymentWebhookUseCase } from "../../application/usecases/payment/ConfirmPaymentWebhookUseCase";
import { HandlePaymentFailureUseCase } from "../../application/usecases/payment/HandlePaymentFailureUseCase";
import { WebhookController } from "../controllers/WebhookController";

// Repositories
const slotRepository = new SlotRepository();
const appointmentRepository = new AppointmentRepository();
const paymentRepository = new PaymentRepository();

// Gateways
const stripePaymentAdapter = new StripePaymentAdapter(
  process.env.STRIPE_SECRET_KEY || "mock_secret_key",
);

// Use Cases
const confirmPaymentWebhookUseCase = new ConfirmPaymentWebhookUseCase(
  paymentRepository,
  appointmentRepository,
  slotRepository,
);
const handlePaymentFailureUseCase = new HandlePaymentFailureUseCase(
  paymentRepository,
  appointmentRepository,
  slotRepository,
);

// Controller
export const injectedWebhookController = new WebhookController(
  confirmPaymentWebhookUseCase,
  handlePaymentFailureUseCase,
  stripePaymentAdapter,
);
