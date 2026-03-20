import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

if (import.meta.env.MODE === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.error = () => {};
  console.warn = () => {};
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000, // 30s
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  </BrowserRouter>,
);
