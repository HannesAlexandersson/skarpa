import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingForm } from "@/components/booking/BookingForm";
import { bookingRpcArgs, earliestPickupDate, WITHDRAWAL_CONSENT_TEXT, WITHDRAWAL_CONSENT_VERSION } from "@/lib/booking-schema";

const details = { name: "Test Customer", address: "Testgatan 1", phone: "0701234567", email: "booking-test@example.com", date: earliestPickupDate(), time: "14:30", paymentMethod: "invoice" as const, knifeCount: 1 };
function fillForm() {
  for (const [id, value] of Object.entries(details)) fireEvent.change(document.getElementById(id) as HTMLInputElement, { target: { value } });
}

describe("Booking storage", () => {
  it("sends customer contact details and separate pickup selections to the atomic booking operation", () => {
    expect(bookingRpcArgs({ ...details, submissionId: "b7d41702-56a0-4f98-8e30-e744f237471a", withdrawalConsent: true })).toEqual({
      p_name: "Test Customer", p_address: "Testgatan 1", p_phone: "0701234567", p_email: "booking-test@example.com",
      p_date: details.date, p_time: "14:30", p_submission_id: "b7d41702-56a0-4f98-8e30-e744f237471a", p_payment_method: "invoice", p_knife_count: 1,
      p_withdrawal_consent: true, p_withdrawal_consent_text: WITHDRAWAL_CONSENT_TEXT, p_withdrawal_consent_version: WITHDRAWAL_CONSENT_VERSION,
    });
  });
  it("keeps failed bookings editable and retries with the same submission reference", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("Unavailable")).mockResolvedValueOnce("saved-booking-id");
    render(<BookingForm onSubmit={onSubmit} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Boka upphämtning" }));
    fireEvent.click(screen.getByLabelText(WITHDRAWAL_CONSENT_TEXT));
    fireEvent.click(screen.getByRole("button", { name: "Bekräfta och boka" }));
    await screen.findByRole("alert");
    expect((screen.getByLabelText("E-post") as HTMLInputElement).value).toBe("booking-test@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Boka upphämtning" }));
    fireEvent.click(screen.getByLabelText(WITHDRAWAL_CONSENT_TEXT));
    fireEvent.click(screen.getByRole("button", { name: "Bekräfta och boka" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[0]?.[0].submissionId).toBe(onSubmit.mock.calls[1]?.[0].submissionId);
    expect(await screen.findByText("Bokningsreferens: saved-booking-id")).toBeInTheDocument();
  });
});