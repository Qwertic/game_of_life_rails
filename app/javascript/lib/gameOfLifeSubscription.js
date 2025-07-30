import { createConsumer } from "@rails/actioncable";

export function createGameOfLifeSubscription({
  onGridUpdate,
  onJobStatus,
  onConnect,
  onDisconnect,
}) {
  const cable = createConsumer();
  const subscription = cable.subscriptions.create(
    { channel: "GameOfLifeChannel" },
    {
      connected() {
        if (onConnect) onConnect();
      },
      disconnected() {
        if (onDisconnect) onDisconnect();
      },
      received(data) {
        if (data) {
          if (data.type === "grid_update" && data.grid) {
            if (onGridUpdate) onGridUpdate(data.grid);
          } else if (data.type === "job_status") {
            if (onJobStatus) onJobStatus(data);
          }
        }
      },
    }
  );
  return subscription;
}
