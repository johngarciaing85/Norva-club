import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SizeSelector } from "@/components/shop/SizeSelector";
import type { SizeVariant } from "@/types";

afterEach(cleanup);

const variants: SizeVariant[] = [
  { size: "S", stock: 3 },
  { size: "M", stock: 0 },
  { size: "L", stock: 5 },
];

describe("SizeSelector", () => {
  it("renders all size options", () => {
    render(
      <SizeSelector variants={variants} selected={null} onSelect={() => {}} />
    );
    expect(screen.getByRole("radio", { name: "Talla S" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Talla M, agotada" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Talla L" })).toBeInTheDocument();
  });

  it("disables out-of-stock sizes", () => {
    render(
      <SizeSelector variants={variants} selected={null} onSelect={() => {}} />
    );
    const mButton = screen.getByRole("radio", { name: "Talla M, agotada" });
    expect(mButton).toBeDisabled();
    expect(mButton).toHaveAttribute("aria-disabled", "true");
  });

  it("calls onSelect when an available size is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SizeSelector variants={variants} selected={null} onSelect={onSelect} />
    );
    await user.click(screen.getByRole("radio", { name: "Talla S" }));
    expect(onSelect).toHaveBeenCalledWith("S");
  });

  it("does not call onSelect when a disabled size is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SizeSelector variants={variants} selected={null} onSelect={onSelect} />
    );
    await user.click(screen.getByRole("radio", { name: "Talla M, agotada" }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks selected size as checked", () => {
    render(
      <SizeSelector variants={variants} selected="L" onSelect={() => {}} />
    );
    expect(screen.getByRole("radio", { name: "Talla L" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });
});
