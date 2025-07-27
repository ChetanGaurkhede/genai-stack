import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import "./index.css";
import MyStacksPage from "./pages/BuilderPage.jsx";
import BuilderPage from "./pages/BuilderPage.jsx";

import App from "./App.jsx";
import WorkflowBuilders from "./pages/MyStacksPage.jsx";
import Header from "./components/headers/Header.jsx";
import { StackProvider } from "./context/stackAiContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Header />
      <StackProvider>
        <Routes>
          <Route path="/" element={<MyStacksPage />} />
          <Route path="/builder/:stackId" element={<WorkflowBuilders />} />
        </Routes>
      </StackProvider>
    </Router>
  </StrictMode>
);
