import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Farms from "@/components/pages/Farms";
import Crops from "@/components/pages/Crops";
import Tasks from "@/components/pages/Tasks";
import Finances from "@/components/pages/Finances";
import Weather from "@/components/pages/Weather";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="farms" element={<Farms />} />
          <Route path="crops" element={<Crops />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="finances" element={<Finances />} />
          <Route path="weather" element={<Weather />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;