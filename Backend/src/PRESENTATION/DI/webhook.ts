import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { StripePaymentService } from "../../application/services/stripePaymentService";
import { ConfirmPaymentWebhookUseCase } from "../../application/usecases/payment/ConfirmPaymentWebhookUseCase";
import { HandlePaymentFailureUseCase } from "../../application/usecases/payment/HandlePaymentFailureUseCase";
import { WebhookController } from "../controllers/WebhookController";
import { EmailService } from "../../application/services/emailService";
import { createNotificationUseCase } from "./notification";

// Repositories
const slotRepository = new SlotRepository();
const appointmentRepository = new AppointmentRepository();
const transactionRepository = new TransactionRepository();
const walletRepository = new WalletRepository();

// Gateways
const stripePaymentService = new StripePaymentService();

// Services
const emailService = new EmailService();

// Use Cases
const confirmPaymentWebhookUseCase = new ConfirmPaymentWebhookUseCase(
  transactionRepository,
  appointmentRepository,
  slotRepository,
  walletRepository,
  emailService,
  createNotificationUseCase,
);
const handlePaymentFailureUseCase = new HandlePaymentFailureUseCase(
  transactionRepository,
  appointmentRepository,
  slotRepository,
);

// Controller
export const injectedWebhookController = new WebhookController(
  confirmPaymentWebhookUseCase,
  handlePaymentFailureUseCase,
  stripePaymentService,
);
