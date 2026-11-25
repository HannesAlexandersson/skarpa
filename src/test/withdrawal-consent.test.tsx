import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingForm } from "@/components/booking/BookingForm";
import { bookingSubmissionSchema, earliestPickupDate, WITHDRAWAL_CONSENT_TEXT } from "@/lib/booking-schema";

const details = { name: "Test Customer", address: "Testgatan 1", phone: "0701234567", email: "consent-test@example.com", date: earliestPickupDate(), time: "14:30", paymentMethod: "invoice", knifeCount: 1 };

function fillForm() {
  for (const [id, value] of Object.entries(details)) fireEvent.change(document.getElementById(id) as HTMLInputElement, { target: { value } });
}

function openConsent() {
  fireEvent.click(screen.getByRole("button", { name: "Boka upphämtning" }));
  return screen.getByRole("dialog", { name: "Ångerrätt och tidig start" });
}

describe("Withdrawal-period consent", () => {
  it("requires explicit consent in the validated server submission", () => {
    const submission = { ...details, submissionId: "b7d41702-56a0-4f98-8e30-e744f237471a" };
    expect(bookingSubmissionSchema.safeParse(submission).success).toBe(false);
    expect(bookingSubmissionSchema.safeParse({ ...submission, withdrawalConsent: false }).success).toBe(false);
    expect(bookingSubmissionSchema.safeParse({ ...submission, withdrawalConsent: true }).success).toBe(true);
  });

  it("opens after the booking button and never saves while unchecked", async () => {
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    fillForm();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openConsent()).toBeInTheDocument();
    expect(screen.getByText("14 dagars ångerrätt enligt distansavtalslagen", { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bekräfta och boka" })).toBeDisabled();
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it("closing without consent saves nothing and preserves every entered detail", async () => {
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    fillForm();
    openConsent();
    fireEvent.click(screen.getByRole("button", { name: "Tillbaka" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
    for (const [id, value] of Object.entries(details)) expect((document.getElementById(id) as HTMLInputElement).value).toBe(String(value));
  });

  it("submits only after the customer checks the exact consent wording", async () => {
    const onSubmit = vi.fn().mockResolvedValue("consent-booking-id");
    render(<BookingForm onSubmit={onSubmit} />);
    fillForm();
    openConsent();
    fireEvent.click(screen.getByLabelText(WITHDRAWAL_CONSENT_TEXT));
    fireEvent.click(screen.getByRole("button", { name: "Bekräfta och boka" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ ...details, withdrawalConsent: true })));
    expect(await screen.findByText("Bokningsreferens: consent-booking-id")).toBeInTheDocument();
  });
});
