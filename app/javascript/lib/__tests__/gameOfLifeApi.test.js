import { apiStartSimulation, apiCancelJob } from "../gameOfLifeApi";

describe("gameOfLifeApi", () => {
  beforeEach(() => {
    // Mock CSRF token
    document.head.innerHTML = '<meta name="csrf-token" content="test-token">';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("apiStartSimulation", () => {
    it("sends a POST request to /game_of_life with grid data and returns JSON", async () => {
      const mockGrid = [[{ alive: true, age: 0 }]];
      const mockJson = { job_id: "123" };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockJson,
      });
      const result = await apiStartSimulation(mockGrid);
      expect(global.fetch).toHaveBeenCalledWith(
        "/game_of_life",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-CSRF-Token": "test-token",
          }),
          body: JSON.stringify({ game: { grid: mockGrid } }),
        })
      );
      expect(result).toEqual(mockJson);
    });

    it("throws on non-ok response", async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(apiStartSimulation([])).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });
  });

  describe("apiCancelJob", () => {
    it("sends a POST request to /game_of_life/cancel with jobId and returns ok status", async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const result = await apiCancelJob("job-123");
      expect(global.fetch).toHaveBeenCalledWith(
        "/game_of_life/cancel",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-CSRF-Token": "test-token",
          }),
          body: JSON.stringify({ job_id: "job-123" }),
        })
      );
      expect(result).toBe(true);
    });
    it("returns false if response not ok", async () => {
      global.fetch.mockResolvedValue({ ok: false });
      const result = await apiCancelJob("job-123");
      expect(result).toBe(false);
    });
  });
});
