import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

// Request notification permission early
if ("Notification" in window && Notification.permission === "default") {
  setTimeout(() => Notification.requestPermission(), 5000);
}

createRoot(document.getElementById("root")!).render(<App />);
