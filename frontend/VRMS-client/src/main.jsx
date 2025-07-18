import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { MaterialTailwindControllerProvider } from "@/context";

import 'mdb-react-ui-kit/dist/css/mdb.min.css'; // ✅ MDB styles
import "@fortawesome/fontawesome-free/css/all.min.css"; // ✅ FontAwesome for icons
import "../public/css/tailwind.css"; // ✅ Your own Tailwind styles (optional)

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <MaterialTailwindControllerProvider>
      <App />
    </MaterialTailwindControllerProvider>
  </BrowserRouter>
);
