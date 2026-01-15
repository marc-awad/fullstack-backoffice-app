import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import ProtectedRoute from "../guards/ProtectedRoute"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <h1>Dashboard</h1>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
