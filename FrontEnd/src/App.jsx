import React from "react";
import { BrowserRouter, Routes, Route } from "react-router"; // ✅ Import Routes & Route
import Home from "./Pages/Home";
import ReactDOM from "react-dom/client";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Routes>
        <Route index element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
    </Routes>
      // <ToastContainer />
   
  );
}

export default App;
