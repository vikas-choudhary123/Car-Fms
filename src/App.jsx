"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import AdminDashboard from "./pages/admin/Dashboard"
import AdminAssignTask from "./pages/admin/AssignTask"
// import AllTasks from "./pages/admin/AllTasks"
import DataPage from "./pages/admin/DataPage"
import AdminDataPage from "./pages/admin/admin-data-page"
import AccountDataPage from "./pages/delegation"
import ApprovalPending from "./pages/admin/ApprovalPending"
import AfterRepairReceiving from "./pages/admin/AfterRepairReceiving"
import Fuel from "./pages/admin/Fuel"
import "./index.css"
import QuickTask from "./pages/QuickTask"
import License from "./pages/License"
import TrainingVideo from "./pages/TrainingVideo"

// Auth wrapper component to protect routes
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const username = sessionStorage.getItem("username")
  const userRole = sessionStorage.getItem("role")

  // If no user is logged in, redirect to login
  if (!username) {
    return <Navigate to="/login" replace />
  }

  // If this is an admin-only route and user is not admin, redirect to tasks
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard/admin" replace />
  }

  return children
}

function App() {
  // const [darkMode, setDarkMode] = useState(false)

  // useEffect(() => {
  //   // Check for user preference
  //   if (
  //     localStorage.theme === "dark" ||
  //     (!(\"theme\" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  //   ) {
  //     setDarkMode(true)
  //     document.documentElement.classList.add("dark")
  //   } else {
  //     setDarkMode(false)
  //     document.documentElement.classList.remove("dark")
  //   }
  // }, [])

  // const toggleDarkMode = () => {
  //   setDarkMode(!darkMode)
  //   if (darkMode) {
  //     document.documentElement.classList.remove("dark")
  //     localStorage.theme = "light"
  //   } else {
  //     document.documentElement.classList.add("dark")
  //     localStorage.theme = "dark"
  //   }
  // }

  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/admin" replace />} />

        {/* Admin & User Dashboard route */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quick-task"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <QuickTask />
            </ProtectedRoute>
          }
        />
        {/* Assign Task route - only for admin */}
        <Route
          path="/dashboard/assign-task"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAssignTask />
            </ProtectedRoute>
          }
        />

        {/* Delegation route for user */}
        <Route
          path="/dashboard/delegation"
          element={
            <ProtectedRoute>
              <AccountDataPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/approval-pending"
          element={
            <ProtectedRoute>
              <ApprovalPending />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/after-repair-receiving"
          element={
            <ProtectedRoute>
              <AfterRepairReceiving />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/fuel"
          element={
            <ProtectedRoute>
              <Fuel />
            </ProtectedRoute>
          }
        />

        {/* Data routes */}
        <Route
          path="/dashboard/data/:category"
          element={
            <ProtectedRoute>
              <DataPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/license"
          element={
            <ProtectedRoute>
              <License />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/traning-video"
          element={
            <ProtectedRoute>
              <TrainingVideo />
            </ProtectedRoute>
          }
        />

        {/* Specific route for Admin Data Page */}
        <Route
          path="/dashboard/data/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDataPage />
            </ProtectedRoute>
          }
        />

        {/* Backward compatibility redirects */}
        <Route path="/admin/*" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/dashboard/admin" replace />} />
        <Route parh="/admin/quick-task" element={<Navigate to="/dashboard/quick-task" replace />} />
        <Route path="/admin/assign-task" element={<Navigate to="/dashboard/assign-task" replace />} />
        <Route path="/admin/data/:category" element={<Navigate to="/dashboard/data/:category" replace />} />
        <Route path="/admin/license" element={<Navigate to="/dashboard/license" replace />} />
        <Route path="/admin/traning-video" element={<Navigate to="/dashboard/traning-video" replace />} />
        <Route path="/user/*" element={<Navigate to="/dashboard/admin" replace />} />
      </Routes>
    </Router>
  )
}

export default App
