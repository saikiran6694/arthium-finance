import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { Provider } from "react-redux";
import ReceiptScanner from "./reciept-scanner";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

function renderScanner(props: Partial<Parameters<typeof ReceiptScanner>[0]> = {}) {
  const store = createTestStore();
  const onScanComplete = vi.fn();
  const onLoadingChange = vi.fn();
  const utils = render(
    <Provider store={store}>
      <ReceiptScanner
        loadingChange={false}
        onScanComplete={onScanComplete}
        onLoadingChange={onLoadingChange}
        {...props}
      />
    </Provider>
  );
  return { ...utils, onScanComplete, onLoadingChange };
}

describe("ReceiptScanner", () => {
  it("shows an error when no file is selected", () => {
    renderScanner();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(toast.error).toHaveBeenCalledWith("Please select a file");
  });

  it("shows an error when a non-image file is selected", () => {
    renderScanner();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(toast.error).toHaveBeenCalledWith("Please upload an image file");
  });

  it("uploads and scans an image, reporting the result", async () => {
    server.use(
      http.post(`${API_URL}/transaction/scan-receipt`, () =>
        HttpResponse.json({
          title: "Coffee",
          amount: 5,
          date: "2026-08-01",
          description: "Coffee",
          category: "Food",
          payment_method: "CARD",
          type: "EXPENSE",
          receipt_url: "https://example.com/receipt.png",
        })
      )
    );

    const { onScanComplete, onLoadingChange } = renderScanner();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["data"], "receipt.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onLoadingChange).toHaveBeenCalledWith(true);

    await waitFor(
      () => expect(onScanComplete).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Coffee" })
      ),
      { timeout: 3000 }
    );
    expect(toast.success).toHaveBeenCalledWith("Receipt scanned successfully");
    await waitFor(() => expect(onLoadingChange).toHaveBeenLastCalledWith(false), {
      timeout: 3000,
    });
  }, 10000);

  it("shows an error toast with the server message when scanning fails", async () => {
    server.use(
      http.post(`${API_URL}/transaction/scan-receipt`, () =>
        HttpResponse.json({ message: "Could not read receipt" }, { status: 422 })
      )
    );

    renderScanner();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["data"], "receipt.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(
      () =>
        expect(toast.error).toHaveBeenCalledWith("Could not read receipt"),
      { timeout: 3000 }
    );
  }, 10000);

  it("shows the scanning progress UI when loadingChange is true", () => {
    renderScanner({ loadingChange: true });
    expect(screen.getByText(/Scanning receipt/)).toBeInTheDocument();
  });
});
