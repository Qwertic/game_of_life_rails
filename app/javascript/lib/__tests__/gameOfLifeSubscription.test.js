// Mock @rails/actioncable before importing the module
let mockCable;
jest.mock("@rails/actioncable", () => ({
  createConsumer: () => mockCable,
}));

import { createGameOfLifeSubscription } from "../gameOfLifeSubscription";

describe("createGameOfLifeSubscription", () => {
  beforeEach(() => {
    mockCable = {
      subscriptions: {
        create: jest.fn((_, callbacks) => {
          // Save callbacks for test access
          mockCable._callbacks = callbacks;
          return { perform: jest.fn() };
        }),
      },
    };
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("calls onConnect when connected", () => {
    const onConnect = jest.fn();
    createGameOfLifeSubscription({ onConnect });
    mockCable._callbacks.connected();
    expect(onConnect).toHaveBeenCalled();
  });

  it("calls onDisconnect when disconnected", () => {
    const onDisconnect = jest.fn();
    createGameOfLifeSubscription({ onDisconnect });
    mockCable._callbacks.disconnected();
    expect(onDisconnect).toHaveBeenCalled();
  });

  it("calls onGridUpdate when receiving grid_update", () => {
    const onGridUpdate = jest.fn();
    createGameOfLifeSubscription({ onGridUpdate });
    mockCable._callbacks.received({ type: "grid_update", grid: [[1]] });
    expect(onGridUpdate).toHaveBeenCalledWith([[1]]);
  });

  it("calls onJobStatus when receiving job_status", () => {
    const onJobStatus = jest.fn();
    createGameOfLifeSubscription({ onJobStatus });
    mockCable._callbacks.received({ type: "job_status", status: "running" });
    expect(onJobStatus).toHaveBeenCalledWith({ type: "job_status", status: "running" });
  });

  it("does not call handlers for unknown data", () => {
    const onGridUpdate = jest.fn();
    const onJobStatus = jest.fn();
    createGameOfLifeSubscription({ onGridUpdate, onJobStatus });
    mockCable._callbacks.received({ type: "other" });
    expect(onGridUpdate).not.toHaveBeenCalled();
    expect(onJobStatus).not.toHaveBeenCalled();
  });
});
