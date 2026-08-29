import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileGate from "./ProfileGate.jsx";

beforeEach(() => {
  localStorage.clear();
});

describe("ProfileGate", () => {
  it("shows the 'new profile' option when no profiles exist yet", () => {
    render(<ProfileGate onEnter={() => {}} />);
    expect(screen.getByText(/new profile/i)).toBeInTheDocument();
  });

  it("creates a profile and calls onEnter with the trimmed name", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    render(<ProfileGate onEnter={onEnter} />);

    await user.click(screen.getByText(/new profile/i));
    await user.type(screen.getByPlaceholderText(/your name/i), "  Rehan  ");
    await user.click(screen.getByText(/^start$/i));

    expect(onEnter).toHaveBeenCalledWith("Rehan");
  });

  it("persists the created profile to localStorage so it survives a reload", async () => {
    const user = userEvent.setup();
    render(<ProfileGate onEnter={() => {}} />);

    await user.click(screen.getByText(/new profile/i));
    await user.type(screen.getByPlaceholderText(/your name/i), "Rehan");
    await user.click(screen.getByText(/^start$/i));

    const stored = JSON.parse(localStorage.getItem("toggle-profiles-v1"));
    expect(stored).toEqual([{ name: "Rehan", pin: "" }]);
  });

  it("does not create a second profile with a duplicate name (case-insensitive)", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    localStorage.setItem("toggle-profiles-v1", JSON.stringify([{ name: "Rehan", pin: "" }]));
    render(<ProfileGate onEnter={onEnter} />);

    await user.click(screen.getByText(/new profile/i));
    await user.type(screen.getByPlaceholderText(/your name/i), "rehan");
    await user.click(screen.getByText(/^start$/i));

    expect(onEnter).not.toHaveBeenCalled();
  });

  it("does not call onEnter for an empty name", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    render(<ProfileGate onEnter={onEnter} />);

    await user.click(screen.getByText(/new profile/i));
    await user.click(screen.getByText(/^start$/i));

    expect(onEnter).not.toHaveBeenCalled();
  });

  it("prompts for a PIN when entering a PIN-protected profile, and blocks entry on a wrong PIN", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    localStorage.setItem("toggle-profiles-v1", JSON.stringify([{ name: "Rehan", pin: "1234" }]));
    vi.spyOn(window, "prompt").mockReturnValue("0000");

    render(<ProfileGate onEnter={onEnter} />);
    await user.click(screen.getByText("Rehan"));

    expect(window.prompt).toHaveBeenCalled();
    expect(onEnter).not.toHaveBeenCalled();
    window.prompt.mockRestore();
  });

  it("allows entry when the correct PIN is provided", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    localStorage.setItem("toggle-profiles-v1", JSON.stringify([{ name: "Rehan", pin: "1234" }]));
    vi.spyOn(window, "prompt").mockReturnValue("1234");

    render(<ProfileGate onEnter={onEnter} />);
    await user.click(screen.getByText("Rehan"));

    expect(onEnter).toHaveBeenCalledWith("Rehan");
    window.prompt.mockRestore();
  });
});
