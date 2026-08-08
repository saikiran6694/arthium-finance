import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { reportApi } from "./reportAPI";

const API_URL = import.meta.env.VITE_API_URL;

describe("reportApi", () => {
  it("getAllReports GETs /report/all using the provided page params", async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${API_URL}/report/all`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json({ message: "ok", reports: [], pagination: {} });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        reportApi.endpoints.getAllReports.initiate({
          pageNumber: 3,
          pageSize: 15,
        })
      )
      .unwrap();

    expect(receivedUrl?.searchParams.get("page_number")).toBe("3");
    expect(receivedUrl?.searchParams.get("page_size")).toBe("15");
  });

  it("getAllReports defaults to page 1 and size 20 when omitted", async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${API_URL}/report/all`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json({ message: "ok", reports: [], pagination: {} });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        reportApi.endpoints.getAllReports.initiate(
          {} as { pageNumber: number; pageSize: number }
        )
      )
      .unwrap();

    expect(receivedUrl?.searchParams.get("page_number")).toBe("1");
    expect(receivedUrl?.searchParams.get("page_size")).toBe("20");
  });

  it("updateReportSetting PUTs the payload to /report/update-setting", async () => {
    let received: unknown;
    server.use(
      http.put(`${API_URL}/report/update-setting`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        reportApi.endpoints.updateReportSetting.initiate({
          is_enabled: true,
        })
      )
      .unwrap();

    expect(received).toEqual({ is_enabled: true });
  });
});
