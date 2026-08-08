import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { userApi } from "./userAPI";

const API_URL = import.meta.env.VITE_API_URL;

describe("userApi", () => {
  it("updateUser PUTs the form data to /user/update", async () => {
    let receivedName: string | null = null;
    server.use(
      http.put(`${API_URL}/user/update`, async ({ request }) => {
        const formData = await request.formData();
        receivedName = formData.get("name") as string;
        return HttpResponse.json({
          message: "updated",
          user: { _id: "1", name: "Jane", email: "jane@example.com", profile_picture: "" },
        });
      })
    );

    const formData = new FormData();
    formData.append("name", "Jane");

    const store = createTestStore();
    const result = await store
      .dispatch(userApi.endpoints.updateUser.initiate(formData))
      .unwrap();

    expect(receivedName).toBe("Jane");
    expect(result.message).toBe("updated");
  });

  it("getScheduledReportTime GETs /user/schedule-time", async () => {
    server.use(
      http.get(`${API_URL}/user/schedule-time`, () =>
        HttpResponse.json({ scheduled_time: "09:00", timezone: "UTC" })
      )
    );

    const store = createTestStore();
    const result = await store
      .dispatch(userApi.endpoints.getScheduledReportTime.initiate())
      .unwrap();

    expect(result).toEqual({ scheduled_time: "09:00", timezone: "UTC" });
  });

  it("scheduleReport POSTs the schedule to /user/schedule", async () => {
    let received: unknown;
    server.use(
      http.post(`${API_URL}/user/schedule`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        userApi.endpoints.scheduleReport.initiate({
          timezone: "UTC",
          scheduled_time: "09:00",
        })
      )
      .unwrap();

    expect(received).toEqual({ timezone: "UTC", scheduled_time: "09:00" });
  });
});
