import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingForm } from "@/components/booking/BookingForm";

describe("Pickup time", () => {
  it("includes the selected time in a booking", async () => {
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    for (const [label, value] of [
      ["Namn", "Test Person"], ["Adress", "Testgatan 1"],
      ["Telefon", "0701234567"], ["E-post", "test@example.com"],
      ["Datum för upphämtning", "2099-12-01"], ["Tid för upphämtning", "14:30"],
    ] as const) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Boka upphämtning" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ date: "2099-12-01", time: "14:30" })));
  });
});