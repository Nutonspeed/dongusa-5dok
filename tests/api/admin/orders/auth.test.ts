/* eslint-env jest */
jest.mock("../../../../lib/auth/getUser", () => ({
  requireAdmin: jest.fn().mockRejectedValue(new Error("Unauthorized")),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: any) => new Response(JSON.stringify(body), init),
  },
}));

class ResponseMock {
  body: any;
  status: number;
  headers: any;
  constructor(body?: any, init?: any) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = init?.headers || {};
  }
  async json() {
    return JSON.parse(this.body);
  }
}
(global as any).Response = ResponseMock;

const { GET: bulkExport } = require("../../../../app/api/admin/orders/bulk-export/route");
const { POST: bulkStatus } = require("../../../../app/api/admin/orders/bulk-status/route");
const { POST: bulkMessagePreset } = require("../../../../app/api/admin/orders/messages/bulk-preset/route");
const { POST: createLabels } = require("../../../../app/api/admin/orders/shipping/create-labels/route");

describe("admin order endpoints authentication", () => {
  const dummyRequest: any = {};

  it("bulk export requires admin", async () => {
    const res = await bulkExport();
    expect(res.status).toBe(401);
  });

  it("bulk status requires admin", async () => {
    const res = await bulkStatus(dummyRequest);
    expect(res.status).toBe(401);
  });

  it("bulk preset requires admin", async () => {
    const res = await bulkMessagePreset(dummyRequest);
    expect(res.status).toBe(401);
  });

  it("create labels requires admin", async () => {
    const res = await createLabels(dummyRequest);
    expect(res.status).toBe(401);
  });
});

