import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { analyticsApi } from "./analyticsAPI";

const API_URL = import.meta.env.VITE_API_URL;
const filters = { preset: "this_month", from: "2026-08-01", to: "2026-08-31" };

describe("analyticsApi", () => {
  it("summaryAnalytics GETs /analytics/summary with the filter params", async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${API_URL}/analytics/summary`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json({ message: "ok", stats: {} });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(analyticsApi.endpoints.summaryAnalytics.initiate(filters))
      .unwrap();

    expect(receivedUrl?.searchParams.get("preset")).toBe("this_month");
    expect(receivedUrl?.searchParams.get("from")).toBe("2026-08-01");
    expect(receivedUrl?.searchParams.get("to")).toBe("2026-08-31");
  });

  it("chartAnalytics GETs /analytics/chart with the filter params", async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${API_URL}/analytics/chart`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json({ message: "ok", stats: {} });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(analyticsApi.endpoints.chartAnalytics.initiate(filters))
      .unwrap();

    expect(receivedUrl?.searchParams.get("preset")).toBe("this_month");
  });

  it("expensePieChartBreakdown GETs /analytics/expense-breakdown with the filter params", async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${API_URL}/analytics/expense-breakdown`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json({ message: "ok", stats: {} });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        analyticsApi.endpoints.expensePieChartBreakdown.initiate(filters)
      )
      .unwrap();

    expect(receivedUrl?.searchParams.get("preset")).toBe("this_month");
  });

  it("works when filter params are omitted", async () => {
    server.use(
      http.get(`${API_URL}/analytics/summary`, () =>
        HttpResponse.json({ message: "ok", stats: {} })
      )
    );

    const store = createTestStore();
    const result = await store
      .dispatch(analyticsApi.endpoints.summaryAnalytics.initiate({}))
      .unwrap();

    expect(result.message).toBe("ok");
  });
});
