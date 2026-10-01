import { spawn } from "node:child_process"

const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "4174",
    "--strictPort",
  ],
  {
    env: { ...process.env, VITE_ENABLE_PROTOTYPE: "true" },
    stdio: "inherit",
  },
)

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal))
}
