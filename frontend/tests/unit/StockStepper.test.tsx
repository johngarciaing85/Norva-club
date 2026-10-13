import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StockStepper } from "@/components/admin/StockStepper";

afterEach(cleanup);

describe("StockStepper", () => {
  it("renders current value", () => {
    render(<StockStepper value={5} originalValue={5} onChange={() => {}} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onChange with incremented value on plus click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StockStepper value={3} originalValue={3} onChange={onChange} />);
    await user.click(screen.getByLabelText("Aumentar stock"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("calls onChange with decremented value on minus click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StockStepper value={3} originalValue={3} onChange={onChange} />);
    await user.click(screen.getByLabelText("Disminuir stock"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("prevents stock from going below 0", () => {
    render(<StockStepper value={0} originalValue={0} onChange={() => {}} />);
    expect(screen.getByLabelText("Disminuir stock")).toBeDisabled();
  });

  it("shows original value when modified", () => {
    render(<StockStepper value={7} originalValue={3} onChange={() => {}} />);
    expect(screen.getByText("(era 3)")).toBeInTheDocument();
  });

  it("does not show original value when unchanged", () => {
    render(<StockStepper value={5} originalValue={5} onChange={() => {}} />);
    expect(screen.queryByText(/era/)).not.toBeInTheDocument();
  });
});
