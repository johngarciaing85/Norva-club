import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

afterEach(cleanup);

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Confirmar acción",
    description: "¿Estás seguro?",
    onConfirm: vi.fn(),
  };

  it("renders title and description when open", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Confirmar acción")).toBeInTheDocument();
    expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await user.click(screen.getByText("Confirmar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when cancel is clicked", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);
    await user.click(screen.getByText("Cancelar"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows loading state", () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);
    expect(screen.getByText("Procesando…")).toBeInTheDocument();
    expect(screen.getByText("Procesando…")).toBeDisabled();
  });

  it("uses custom button labels", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Enviar"
        cancelLabel="Volver"
      />
    );
    expect(screen.getByText("Enviar")).toBeInTheDocument();
    expect(screen.getByText("Volver")).toBeInTheDocument();
  });
});
