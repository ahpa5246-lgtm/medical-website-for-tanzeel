import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
  stages: [
    { duration: "15s", target: 5 },
    { duration: "30s", target: 20 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
}

export default function () {
  const baseUrl = (__ENV.BASE_URL || "").replace(/\/$/, "")
  if (!baseUrl) {
    throw new Error("BASE_URL is required")
  }

  const response = http.get(baseUrl + "/")
  check(response, {
    "HTTP status is successful": (r) => r.status >= 200 && r.status < 400,
  })
  sleep(1)
}
