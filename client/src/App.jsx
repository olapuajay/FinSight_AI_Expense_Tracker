import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Signup";
import Dashboard from "./pages/Dashboard"; 
import ExpenseList from "./pages/ExpenseList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoutes> <Dashboard /> </ProtectedRoutes>} />
        <Route path="/expense-list" element={<ProtectedRoutes> <ExpenseList /> </ProtectedRoutes>} />
      </Routes>
    </Router>
  )
}

export default App
