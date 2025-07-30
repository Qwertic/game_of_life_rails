// API utility functions for Game of Life

function getCsrfToken() {
  return document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
}

async function apiRequest(url, method, body) {
  const csrfToken = getCsrfToken();
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response;
}

export async function apiStartSimulation(grid) {
  const response = await apiRequest("/game_of_life", "POST", {
    game: { grid },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function apiCancelJob(jobId) {
  const response = await apiRequest("/game_of_life/cancel", "POST", {
    job_id: jobId,
  });
  return response.ok;
}
