import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import TV2Providers from "./TV2Providers";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <TV2Providers>
        <App />
      </TV2Providers>
    </BrowserRouter>
  </React.StrictMode>
);