import { createRoot } from "react-dom/client";
import App from "./app";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";

const root = createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
