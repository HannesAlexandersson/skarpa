import { z } from "zod";

export function earliestPickupDate(now = new Date()) {
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const tomorrow = new Date(`${today}T12:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export const bookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(500),
  phone: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(254),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= earliestPickupDate();
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const bookingSubmissionSchema = bookingSchema.extend({ submissionId: z.string().uuid() });

export function bookingRpcArgs(data: z.infer<typeof bookingSubmissionSchema>) {
  return { p_name: data.name, p_address: data.address, p_phone: data.phone, p_email: data.email,
    p_date: data.date, p_time: data.time, p_submission_id: data.submissionId };
}