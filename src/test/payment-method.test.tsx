import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingForm } from "@/components/booking/BookingForm";
import { bookingSchema, earliestPickupDate } from "@/lib/booking-schema";

const base = { name: "Test Person", address: "Testgatan 1", phone: "0701234567", email: "t@example.com", date: earliestPickupDate(), time: "14:30" };

describe("Payment method", () => {
  it("is required", () => {
    expect(bookingSchema.safeParse(base).success).toBe(false);
  });
  it("rejects methods that are not offered", () => {
    expect(bookingSchema.safeParse({ ...base, paymentMethod: "paypal" }).success).toBe(false);
  });
  it.each(["invoice", "klarna", "swish", "cash"])("accepts %s", (paymentMethod) => {
    expect(bookingSchema.safeParse({ ...base, paymentMethod }).success).toBe(true);
  });
  it("blocks submit and shows an error when no method is chosen", async () => {
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    for (const [label, value] of [["Namn", base.name], ["Adress", base.address], ["Telefon", base.phone], ["E-post", base.email],
      ["Datum för upphämtning", base.date], ["Tid för upphämtning", base.time]] as const)
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Boka upphämtning" }));
    expect(await screen.findByText("Välj ett betalsätt.")).toBeInTheDocument();
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });
});

describe("Missing pickup time", () => {
  it("shows a Swedish message", () => {
    const r = bookingSchema.safeParse({ ...base, time: undefined, paymentMethod: "cash" });
    expect(r.success ? "" : r.error.issues[0]?.message).toBe("Välj en tid.");
  });
});
