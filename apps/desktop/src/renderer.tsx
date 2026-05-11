import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { EncryptApp } from "./shell/EncryptApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EncryptApp />
  </React.StrictMode>,
);