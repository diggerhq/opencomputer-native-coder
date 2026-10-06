import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const amazonLinuxPackages = [
  "nspr",
  "nss",
  "dbus-libs",
  "atk",
  "at-spi2-atk",
  "at-spi2-core",
  "cups-libs",
  "libX11",
  "libXcomposite",
  "libXdamage",
  "libXext",
  "libXfixes",
  "libXrandr",
  "mesa-libgbm",
  "libxcb",
  "pango",
  "cairo",
  "alsa-lib",
];

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function privileged(command, args) {
  if (typeof process.getuid !== "function" || process.getuid() === 0) {
    run(command, args);
    return;
  }
  run("sudo", [command, ...args]);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

if (process.platform !== "linux") {
  run(npx, ["playwright", "install", "chromium"]);
} else if (existsSync("/usr/bin/dnf") || existsSync("/bin/dnf")) {
  privileged("dnf", ["install", "-y", ...amazonLinuxPackages]);
  run(npx, ["playwright", "install", "chromium"]);
} else if (existsSync("/usr/bin/apt-get") || existsSync("/bin/apt-get")) {
  run(npx, ["playwright", "install", "--with-deps", "chromium"]);
} else {
  console.warn(
    "No supported system package manager was found; installing Chromium without OS dependencies.",
  );
  run(npx, ["playwright", "install", "chromium"]);
}
