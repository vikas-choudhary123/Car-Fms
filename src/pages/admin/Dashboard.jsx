"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  Car,
  Truck,
  Bike,
  Bus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  BarChart3,
  X,
  Fuel,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react"
import AdminLayout from "../../components/layout/AdminLayout.jsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function VehicleDashboard() {
  const [selectedVehicleType, setSelectedVehicleType] = useState("all")
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [showPendingTasks, setShowPendingTasks] = useState(false)
  const [pendingTasks, setPendingTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStaff, setFilterStaff] = useState("all")
  const [tableFormat, setTableFormat] = useState("normal") // 'normal' or 'compact'

  // Modal states for different card types
  const [showCompletedModal, setShowCompletedModal] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showOverdueModal, setShowOverdueModal] = useState(false)
  const [showUnderMaintenanceModal, setShowUnderMaintenanceModal] = useState(false)

  const [vehicleData, setVehicleData] = useState({
    vehicles: [],
    maintenanceStats: {
      totalVehicles: 0,
      activeVehicles: 0,
      underMaintenance: 0,
      criticalIssues: 0,
      completedChecks: 0,
      pendingChecks: 0,
      overdueChecks: 0,
      maintenanceEfficiency: 0,
    },
    vehicleTypes: {
      cars: { count: 0, operational: 0, maintenance: 0 },
      trucks: { count: 0, operational: 0, maintenance: 0 },
      bikes: { count: 0, operational: 0, maintenance: 0 },
      buses: { count: 0, operational: 0, maintenance: 0 },
    },
    maintenanceHistory: [],
    upcomingMaintenance: [],
    criticalAlerts: [],
    completedTasks: [],
    pendingTasksData: [],
    overdueTasksData: [],
    underMaintenanceTasks: [],
  })

  const [repairDashboardData, setRepairDashboardData] = useState({
    totalRepairs: 156,
    pendingApprovals: 12,
    completedRepairs: 144,
    totalRepairCost: 245000,
    avgRepairTime: 3.2,
    topRepairTypes: [
      { type: "Engine Oil Change", count: 45, cost: 67500 },
      { type: "Brake Pad Replacement", count: 32, cost: 48000 },
      { type: "AC Service", count: 28, cost: 42000 },
      { type: "Tire Replacement", count: 25, cost: 37500 },
      { type: "Battery Replacement", count: 26, cost: 50000 },
    ],
    monthlyRepairTrend: [
      { month: "Jan", repairs: 18, cost: 27000 },
      { month: "Feb", repairs: 22, cost: 33000 },
      { month: "Mar", repairs: 15, cost: 22500 },
      { month: "Apr", repairs: 28, cost: 42000 },
      { month: "May", repairs: 25, cost: 37500 },
      { month: "Jun", repairs: 20, cost: 30000 },
    ],
    vendorPerformance: [
      { vendor: "ABC Auto Service", repairs: 45, avgCost: 1500, rating: 4.8 },
      { vendor: "XYZ Motors", repairs: 38, avgCost: 1800, rating: 4.6 },
      { vendor: "Cool Air Service", repairs: 28, avgCost: 1200, rating: 4.7 },
      { vendor: "Quick Fix Garage", repairs: 25, avgCost: 1600, rating: 4.5 },
    ],
  })

  const [fuelDashboardData, setFuelDashboardData] = useState({
    totalFuelCost: 185000,
    totalLiters: 12500,
    avgFuelPrice: 14.8,
    totalVehicles: 45,
    avgConsumption: 12.5,
    monthlyFuelData: [
      { month: "Jan", liters: 2100, cost: 31080, vehicles: 42 },
      { month: "Feb", liters: 1950, cost: 28860, vehicles: 43 },
      { month: "Mar", liters: 2200, cost: 32560, vehicles: 44 },
      { month: "Apr", liters: 2050, cost: 30340, vehicles: 45 },
      { month: "May", liters: 2150, cost: 31820, vehicles: 45 },
      { month: "Jun", liters: 2050, cost: 30340, vehicles: 45 },
    ],
    topFuelConsumers: [
      {
        person: "Rajesh Kumar",
        vehicle: "MH-12-AB-1234",
        liters: 450,
        cost: 6660,
        trips: 28,
      },
      {
        person: "Amit Sharma",
        vehicle: "MH-12-CD-5678",
        liters: 420,
        cost: 6216,
        trips: 25,
      },
      {
        person: "Priya Singh",
        vehicle: "MH-12-EF-9012",
        liters: 380,
        cost: 5624,
        trips: 22,
      },
      {
        person: "Suresh Patel",
        vehicle: "MH-12-GH-3456",
        liters: 360,
        cost: 5328,
        trips: 20,
      },
      {
        person: "Neha Gupta",
        vehicle: "MH-12-IJ-7890",
        liters: 340,
        cost: 5032,
        trips: 18,
      },
    ],
    fuelEfficiency: [
      { vehicle: "MH-12-AB-1234", efficiency: 15.2, type: "Car" },
      { vehicle: "MH-12-CD-5678", efficiency: 12.8, type: "Truck" },
      { vehicle: "MH-12-EF-9012", efficiency: 18.5, type: "Car" },
      { vehicle: "MH-12-GH-3456", efficiency: 8.5, type: "Bus" },
      { vehicle: "MH-12-IJ-7890", efficiency: 22.3, type: "Bike" },
    ],
  })

  // Vehicle type configurations with professional icons and colors
  const vehicleTypes = [
    {
      value: "all",
      label: "All Vehicles",
      icon: Settings,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      keywords: [],
    },
    {
      value: "car",
      label: "Cars",
      icon: Car,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      keywords: ["car", "sedan", "hatchback", "vehicle"],
    },
    {
      value: "truck",
      label: "Trucks",
      icon: Truck,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      keywords: ["truck", "lorry", "heavy", "cargo"],
    },
    {
      value: "bike",
      label: "Bikes",
      icon: Bike,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      keywords: ["bike", "motorcycle", "scooter", "two wheeler"],
    },
    {
      value: "bus",
      label: "Buses",
      icon: Bus,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      keywords: ["bus", "coach", "transport"],
    },
  ]

  // Helper functions for date parsing
  const parseDateFromDDMMYYYY = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null
    const parts = dateStr.split("/")
    if (parts.length !== 3) return null
    return new Date(parts[2], parts[1] - 1, parts[0])
  }

  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, "0")
    const month = (d.getMonth() + 1).toString().padStart(2, "0")
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const isDateToday = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr)
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  }

  const isDateOverdue = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr)
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getCellValue = (row, index) => {
    if (!row || !row.c || index >= row.c.length) return null
    const cell = row.c[index]
    return cell && "v" in cell ? cell.v : null
  }

  // Improved vehicle type detection from description
  const getVehicleTypeFromDescription = (description) => {
    if (!description) return "car"
    const desc = description.toLowerCase()
    // Check each vehicle type's keywords
    for (const vehicleType of vehicleTypes) {
      if (vehicleType.value === "all") continue
      for (const keyword of vehicleType.keywords) {
        if (desc.includes(keyword)) {
          return vehicleType.value
        }
      }
    }
    return "car" // Default to car if no match found
  }

  // Get today's date in DD/MM/YYYY format
  const getTodayDate = () => {
    return formatDateToDDMMYYYY(new Date())
  }

  // Fetch and process vehicle data
  const fetchVehicleData = async () => {
    try {
      const appScriptUrl =
        "https://script.google.com/macros/s/AKfycbypYVWE9dVvRsFBoOyJurc3i3ksZ3vd9y-QietOEEZfC8ezi5VlJb1F4jmJ1_v_agrThA/exec"
      const sheetName = "Checklist"

      const response = await fetch(`${appScriptUrl}?sheet=${sheetName}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${sheetName} sheet data: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch data")
      }

      // Get current user details
      const username = sessionStorage.getItem("username")
      const userRole = sessionStorage.getItem("role")

      // Process vehicle data
      const vehicleMap = new Map()
      const maintenanceHistory = []
      const upcomingMaintenance = []
      const criticalAlerts = []
      const completedTasks = []
      const pendingTasksData = []
      const overdueTasksData = []
      const underMaintenanceTasks = []

      let totalFleet = 0
      let completedChecks = 0
      let pendingChecks = 0
      let overdueChecks = 0
      let underMaintenanceCount = 0

      const todayDate = getTodayDate()

      data.table.rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return // Skip header

        // Get data from columns
        const taskId = getCellValue(row, 1) || "" // Column B
        const doer = getCellValue(row, 2) || "" // Column C
        const taskDescription = getCellValue(row, 3) || "" // Column D
        const dueDate = getCellValue(row, 4) || "" // Column E
        const frequency = getCellValue(row, 5) || "" // Column F
        const actualDate = getCellValue(row, 6) || "" // Column G
        const underMaintenanceValue = getCellValue(row, 9) || "" // Column J

        // Check if user should see this task
        const isUserMatch = userRole === "admin" || doer.toLowerCase() === username.toLowerCase()
        if (!isUserMatch) return

        if (!taskId) return

        // Extract vehicle info from task description
        const vehicleType = getVehicleTypeFromDescription(taskDescription)
        const vehicleId = `${vehicleType}_${taskId}`
        const vehicleName = taskDescription.split(" ")[0] || `Vehicle ${taskId}`

        // Skip if a specific vehicle is selected and this task doesn't match
        if (selectedVehicleId !== "all" && selectedVehicleId !== vehicleName) {
          return
        }

        // Count total fleet (total rows with task ID)
        totalFleet++

        // Determine check status based on your requirements
        let checkStatus = "pending"

        if (actualDate && actualDate.trim() !== "") {
          // Column G is not null - completed check
          checkStatus = "completed"
          completedChecks++

          completedTasks.push({
            id: taskId,
            vehicleId,
            vehicleName,
            taskDescription,
            vehicleType,
            assignedTo: doer,
            completionDate: actualDate,
            taskStartDate: dueDate,
            frequency,
            checkedBy: getCellValue(row, 14) || "", // Column O
            okStatus: getCellValue(row, 10) || "", // Column I
          })

          maintenanceHistory.push({
            vehicleId,
            vehicleName,
            type: vehicleType,
            checkType: taskDescription,
            completedDate: actualDate,
            assignedTo: doer,
          })
        } else {
          // Column G is null - check if it's pending or overdue
          if (isDateToday(dueDate)) {
            // Due date matches today - pending
            checkStatus = "pending"
            pendingChecks++

            pendingTasksData.push({
              id: taskId,
              vehicleId,
              vehicleName,
              taskDescription,
              vehicleType,
              assignedTo: doer,
              taskStartDate: dueDate,
              frequency,
              status: "pending",
            })
          } else if (isDateOverdue(dueDate)) {
            // Due date is overdue
            checkStatus = "overdue"
            overdueChecks++

            overdueTasksData.push({
              id: taskId,
              vehicleId,
              vehicleName,
              taskDescription,
              vehicleType,
              assignedTo: doer,
              taskStartDate: dueDate,
              frequency,
              status: "overdue",
            })

            criticalAlerts.push({
              vehicleId,
              vehicleName,
              issue: "Overdue Maintenance",
              dueDate: dueDate,
              severity: "high",
            })
          }

          upcomingMaintenance.push({
            vehicleId,
            vehicleName,
            type: vehicleType,
            checkType: taskDescription,
            dueDate: dueDate,
            assignedTo: doer,
            status: checkStatus,
          })
        }

        // Count under maintenance based on Column J value
        if (underMaintenanceValue && underMaintenanceValue.toString().trim() !== "") {
          underMaintenanceCount++

          underMaintenanceTasks.push({
            id: taskId,
            vehicleId,
            vehicleName,
            taskDescription: taskDescription,
            vehicleType,
            assignedTo: doer,
            taskStartDate: dueDate,
            status: "maintenance",
            maintenanceDetails: underMaintenanceValue,
          })
        }

        // Update vehicle map
        if (!vehicleMap.has(vehicleId)) {
          vehicleMap.set(vehicleId, {
            id: vehicleId,
            name: vehicleName,
            type: vehicleType,
            assignedTo: doer,
            totalChecks: 0,
            completedChecks: 0,
            pendingChecks: 0,
            overdueChecks: 0,
            criticalIssues: 0,
            lastCheckDate: null,
            nextCheckDate: dueDate,
            status: "operational",
            efficiency: 0,
          })
        }

        const vehicle = vehicleMap.get(vehicleId)
        vehicle.totalChecks++

        if (checkStatus === "completed") {
          vehicle.completedChecks++
          vehicle.lastCheckDate = actualDate
        } else if (checkStatus === "overdue") {
          vehicle.overdueChecks++
          vehicle.criticalIssues++
        } else if (checkStatus === "pending") {
          vehicle.pendingChecks++
        }
      })

      // Calculate vehicle statistics
      const allVehicles = Array.from(vehicleMap.values()).map((vehicle) => {
        vehicle.efficiency =
          vehicle.totalChecks > 0 ? Math.round((vehicle.completedChecks / vehicle.totalChecks) * 100) : 0

        if (vehicle.criticalIssues > 0) {
          vehicle.status = "critical"
        } else if (vehicle.overdueChecks > 0) {
          vehicle.status = "overdue"
        } else if (vehicle.pendingChecks > 0) {
          vehicle.status = "maintenance"
        } else {
          vehicle.status = "operational"
        }

        return vehicle
      })

      // Filter vehicles by selected type and vehicle ID
      let filteredVehicles =
        selectedVehicleType === "all" ? allVehicles : allVehicles.filter((v) => v.type === selectedVehicleType)

      if (selectedVehicleId !== "all") {
        filteredVehicles = filteredVehicles.filter((v) => v.name === selectedVehicleId)
      }

      // Calculate type statistics
      const typeStats = {
        cars: { count: 0, operational: 0, maintenance: 0 },
        trucks: { count: 0, operational: 0, maintenance: 0 },
        bikes: { count: 0, operational: 0, maintenance: 0 },
        buses: { count: 0, operational: 0, maintenance: 0 },
      }

      allVehicles.forEach((vehicle) => {
        const type =
          vehicle.type === "car"
            ? "cars"
            : vehicle.type === "truck"
              ? "trucks"
              : vehicle.type === "bike"
                ? "bikes"
                : vehicle.type === "bus"
                  ? "buses"
                  : null
        if (type) {
          typeStats[type].count++
          if (vehicle.status === "operational") {
            typeStats[type].operational++
          } else {
            typeStats[type].maintenance++
          }
        }
      })

      const maintenanceEfficiency = totalFleet > 0 ? Math.round((completedChecks / totalFleet) * 100) : 0

      // Auto-detect if we should use compact format based on data size
      const shouldUseCompactFormat =
        completedTasks.length > 50 ||
        pendingTasksData.length > 50 ||
        overdueTasksData.length > 50 ||
        underMaintenanceTasks.length > 50

      setVehicleData({
        vehicles: filteredVehicles,
        allVehicles: allVehicles,
        maintenanceStats: {
          totalVehicles: totalFleet,
          activeVehicles: filteredVehicles.filter((v) => v.status === "operational").length,
          underMaintenance: underMaintenanceCount,
          criticalIssues: criticalAlerts.length,
          completedChecks: completedChecks,
          pendingChecks: pendingChecks,
          overdueChecks: overdueChecks,
          maintenanceEfficiency,
        },
        vehicleTypes: typeStats,
        maintenanceHistory: maintenanceHistory.slice(0, 10),
        upcomingMaintenance: upcomingMaintenance.slice(0, 10),
        criticalAlerts: criticalAlerts.slice(0, 5),
        completedTasks: completedTasks,
        pendingTasksData: pendingTasksData,
        overdueTasksData: overdueTasksData,
        underMaintenanceTasks: underMaintenanceTasks,
      })

      // Set compact format if data is large
      if (shouldUseCompactFormat) {
        setTableFormat("compact")
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error)
    }
  }

  useEffect(() => {
    fetchVehicleData()
  }, [selectedVehicleType, selectedVehicleId])

  // Get current vehicle type config
  const currentVehicleType = vehicleTypes.find((type) => type.value === selectedVehicleType) || vehicleTypes[0]

  // Get available vehicles for dropdown
  const availableVehicles = vehicleData.allVehicles || []

  // Vehicle Status Card Component with click handler
  const VehicleStatusCard = ({ title, value, icon: Icon, color, bgColor, borderColor, subtitle, onClick }) => (
    <div
      className={`rounded-lg border-l-4 ${borderColor} shadow-md hover:shadow-lg transition-all bg-white ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      }`}
      onClick={onClick}
    >
      <div className={`flex flex-row items-center justify-between space-y-0 pb-2 ${bgColor} rounded-tr-lg p-4`}>
        <h3 className={`text-sm font-medium ${color.replace("bg-", "text-")}`}>{title}</h3>
        <Icon className={`h-5 w-5 ${color.replace("bg-", "text-")}`} />
      </div>
      <div className="p-4">
        <div className={`text-3xl font-bold ${color.replace("bg-", "text-")}`}>{value}</div>
        {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  )

  const AnalyticsCard = ({ title, value, subtitle, icon: Icon, color, bgColor, borderColor, trend, onClick }) => (
    <div
      className={`rounded-lg border ${borderColor} ${bgColor} shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`rounded-lg ${color} p-2`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className={`text-sm font-medium ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render table cell based on format
  const renderTableCell = (content, isHeader = false, className = "") => {
    if (tableFormat === "compact") {
      return <td className={`px-2 py-1 text-xs ${isHeader ? "font-medium" : ""} ${className}`}>{content}</td>
    }
    return <td className={`px-6 py-4 ${isHeader ? "font-medium" : ""} ${className}`}>{content}</td>
  }

  // Render table row based on format
  const renderTableRow = (cells, key, className = "") => {
    if (tableFormat === "compact") {
      return (
        <tr key={key} className={`text-xs hover:bg-gray-50 ${className}`}>
          {cells}
        </tr>
      )
    }
    return (
      <tr key={key} className={`hover:bg-gray-50 ${className}`}>
        {cells}
      </tr>
    )
  }

  // Modal Component for showing task details
  const TaskModal = ({ isOpen, onClose, title, tasks, type }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-blue-700">{title}</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTableFormat(tableFormat === "normal" ? "compact" : "normal")}
                className="text-xs px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {tableFormat === "normal" ? "Compact View" : "Normal View"}
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No {type} tasks found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${tableFormat === "compact" ? "text-xs" : ""}`}>
                  <thead className="bg-gray-50">
                    {type === "pending"
                      ? renderTableRow(
                          [
                            renderTableCell("Task ID", true, "text-left"),
                            renderTableCell("Task Description", true, "text-left"),
                            renderTableCell("Doer Name", true, "text-left"),
                            renderTableCell("Date", true, "text-left"),
                            renderTableCell("Status", true, "text-left"),
                          ],
                          "header-pending",
                        )
                      : type === "completed"
                        ? renderTableRow(
                            [
                              renderTableCell("Task ID", true, "text-left"),
                              renderTableCell("Doer Name", true, "text-left"),
                              renderTableCell("Task Description", true, "text-left"),
                              renderTableCell("Freq", true, "text-left"),
                              renderTableCell("Checked By", true, "text-left"),
                              renderTableCell("Date", true, "text-left"),
                              renderTableCell("OK", true, "text-left"),
                            ],
                            "header-completed",
                          )
                        : type === "maintenance"
                          ? renderTableRow(
                              [
                                renderTableCell("Task ID", true, "text-left"),
                                renderTableCell("Task Description", true, "text-left"),
                                renderTableCell("Doer Name", true, "text-left"),
                                renderTableCell("Not OK", true, "text-left"),
                                renderTableCell("Status", true, "text-left"),
                              ],
                              "header-maintenance",
                            )
                          : renderTableRow(
                              [
                                renderTableCell("Task ID", true, "text-left"),
                                renderTableCell("Doer Name", true, "text-left"),
                                renderTableCell("Task Description", true, "text-left"),
                                renderTableCell("Task Start Date", true, "text-left"),
                                renderTableCell("Freq", true, "text-left"),
                              ],
                              "header-other",
                            )}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task, index) => {
                      if (type === "completed") {
                        return renderTableRow(
                          [
                            renderTableCell(task.id),
                            renderTableCell(task.assignedTo),
                            renderTableCell(
                              <div
                                className={`${
                                  tableFormat === "compact" ? "max-w-[100px] truncate" : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>,
                            ),
                            renderTableCell(task.frequency),
                            renderTableCell(task.checkedBy || "N/A"),
                            renderTableCell(task.completionDate),
                            renderTableCell(task.okStatus),
                          ],
                          `completed-${index}`,
                        )
                      } else if (type === "overdue") {
                        return renderTableRow(
                          [
                            renderTableCell(task.id),
                            renderTableCell(task.assignedTo),
                            renderTableCell(
                              <div
                                className={`${
                                  tableFormat === "compact" ? "max-w-[100px] truncate" : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>,
                            ),
                            renderTableCell(task.taskStartDate),
                            renderTableCell(task.frequency),
                          ],
                          `overdue-${index}`,
                        )
                      }
                      // For pending tasks
                      else if (type === "pending") {
                        return renderTableRow(
                          [
                            renderTableCell(task.id),
                            renderTableCell(
                              <div
                                className={`${
                                  tableFormat === "compact" ? "max-w-[100px] truncate" : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>,
                            ),
                            renderTableCell(task.assignedTo),
                            renderTableCell(task.taskStartDate),
                            renderTableCell(
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>,
                            ),
                          ],
                          `pending-${index}`,
                        )
                      }
                      // For maintenance tasks
                      // For maintenance tasks
                      else if (type === "maintenance") {
                        return renderTableRow(
                          [
                            renderTableCell(task.id),
                            renderTableCell(
                              <div
                                className={`${
                                  tableFormat === "compact" ? "max-w-[100px] truncate" : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>,
                            ),
                            renderTableCell(task.assignedTo),
                            renderTableCell(task.maintenanceDetails || "N/A"),
                            renderTableCell(
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Under Maintenance
                              </span>,
                            ),
                          ],
                          `maintenance-${index}`,
                        )
                      } else {
                        const VehicleIcon = vehicleTypes.find((t) => t.value === task.vehicleType)?.icon || Car
                        return renderTableRow(
                          [
                            renderTableCell(task.id),
                            renderTableCell(task.vehicleName),
                            renderTableCell(
                              <div
                                className={`${
                                  tableFormat === "compact" ? "max-w-[100px] truncate" : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>,
                            ),
                            renderTableCell(
                              <div className="flex items-center space-x-2">
                                <VehicleIcon className="h-4 w-4" />
                                <span className="capitalize">{task.vehicleType}</span>
                              </div>,
                            ),
                            renderTableCell(task.assignedTo),
                            renderTableCell(
                              type === "completed"
                                ? task.completionDate
                                : type === "maintenance"
                                  ? task.maintenanceDetails || "Under maintenance"
                                  : task.taskStartDate,
                            ),
                            renderTableCell(
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  type === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : type === "overdue"
                                      ? "bg-red-100 text-red-800"
                                      : type === "maintenance"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {type === "completed"
                                  ? "Completed"
                                  : type === "overdue"
                                    ? "Overdue"
                                    : type === "maintenance"
                                      ? "Under Maintenance"
                                      : "Pending"}
                              </span>,
                            ),
                          ],
                          `${type}-${index}`,
                        )
                      }
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {tasks.length} {type} tasks
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Vehicle Type Overview Component
  const VehicleTypeOverview = () => {
    const typeData = Object.entries(vehicleData.vehicleTypes).map(([type, data]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      operational: data.operational,
      maintenance: data.maintenance,
      total: data.count,
    }))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={typeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" fontSize={12} stroke="#888888" />
          <YAxis fontSize={12} stroke="#888888" />
          <Tooltip />
          <Legend />
          <Bar dataKey="operational" stackId="a" fill="#22c55e" name="Operational" />
          <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" name="Under Maintenance" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-3">
            {React.createElement(currentVehicleType.icon, {
              className: `h-8 w-8 ${currentVehicleType.color.replace("bg-", "text-")}`,
            })}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Vehicle Fleet Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              {Array.from(
                new Set(
                  availableVehicles
                    .filter((vehicle) => selectedVehicleType === "all" || vehicle.type === selectedVehicleType)
                    .map((vehicle) => vehicle.name),
                ),
              ).map((vehicleName) => (
                <option key={vehicleName} value={vehicleName}>
                  {vehicleName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!showPendingTasks && (
          <>
            {/* Main Stats Cards - 5 Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <VehicleStatusCard
                title="Total Fleet"
                value={vehicleData.maintenanceStats.totalVehicles}
                icon={Settings}
                color="bg-blue-500"
                bgColor="bg-blue-50"
                borderColor="border-blue-500"
                subtitle="Total tasks in system"
              />
              <VehicleStatusCard
                title="Completed Checks"
                value={vehicleData.maintenanceStats.completedChecks}
                icon={CheckCircle2}
                color="bg-green-500"
                bgColor="bg-green-50"
                borderColor="border-green-500"
                subtitle="Column G not null"
                onClick={() => setShowCompletedModal(true)}
              />
              <VehicleStatusCard
                title="Pending Checks"
                value={vehicleData.maintenanceStats.pendingChecks}
                icon={Clock}
                color="bg-yellow-500"
                bgColor="bg-yellow-50"
                borderColor="border-yellow-500"
                subtitle="Due today"
                onClick={() => setShowPendingModal(true)}
              />
              <VehicleStatusCard
                title="Overdue Checks"
                value={vehicleData.maintenanceStats.overdueChecks}
                icon={AlertTriangle}
                color="bg-red-500"
                bgColor="bg-red-50"
                borderColor="border-red-500"
                subtitle="Past due date"
                onClick={() => setShowOverdueModal(true)}
              />
              <VehicleStatusCard
                title="Under Maintenance"
                value={vehicleData.maintenanceStats.underMaintenance}
                icon={Wrench}
                color="bg-orange-500"
                bgColor="bg-orange-50"
                borderColor="border-orange-500"
                subtitle="Column J values"
                onClick={() => setShowUnderMaintenanceModal(true)}
              />
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-1">
              <div className="rounded-lg border border-gray-200 shadow-md bg-white">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-4">
                  <h3 className="text-blue-700 font-medium">Fleet Status by Type</h3>
                  <p className="text-blue-600 text-sm">Operational vs Under Maintenance</p>
                </div>
                <div className="p-4">
                  <VehicleTypeOverview />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Wrench className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Repair Analytics Dashboard</h2>
              </div>

              {/* Repair Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <AnalyticsCard
                  title="Total Repairs"
                  value={repairDashboardData.totalRepairs}
                  subtitle="All time repairs"
                  icon={Wrench}
                  color="bg-orange-500"
                  bgColor="bg-orange-50"
                  borderColor="border-orange-200"
                />
                <AnalyticsCard
                  title="Pending Approvals"
                  value={repairDashboardData.pendingApprovals}
                  subtitle="Awaiting approval"
                  icon={Clock}
                  color="bg-yellow-500"
                  bgColor="bg-yellow-50"
                  borderColor="border-yellow-200"
                />
                <AnalyticsCard
                  title="Completed Repairs"
                  value={repairDashboardData.completedRepairs}
                  subtitle="Successfully completed"
                  icon={CheckCircle2}
                  color="bg-green-500"
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                />
                <AnalyticsCard
                  title="Total Cost"
                  value={`₹${(repairDashboardData.totalRepairCost / 1000).toFixed(0)}K`}
                  subtitle="Total repair expenses"
                  icon={DollarSign}
                  color="bg-blue-500"
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                />
                <AnalyticsCard
                  title="Avg Repair Time"
                  value={`${repairDashboardData.avgRepairTime} days`}
                  subtitle="Average completion time"
                  icon={Calendar}
                  color="bg-purple-500"
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                />
              </div>

              {/* Repair Analytics Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Top Repair Types */}
                <div className="rounded-lg border border-gray-200 shadow-md bg-white">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100 p-4">
                    <h3 className="text-orange-700 font-medium">Top Repair Types</h3>
                    <p className="text-orange-600 text-sm">Most common repairs and costs</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {repairDashboardData.topRepairTypes.map((repair, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{repair.type}</p>
                            <p className="text-sm text-gray-600">{repair.count} repairs</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{(repair.cost / 1000).toFixed(0)}K</p>
                            <p className="text-sm text-gray-600">₹{(repair.cost / repair.count).toFixed(0)} avg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vendor Performance */}
                <div className="rounded-lg border border-gray-200 shadow-md bg-white">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-4">
                    <h3 className="text-blue-700 font-medium">Vendor Performance</h3>
                    <p className="text-blue-600 text-sm">Top performing repair vendors</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {repairDashboardData.vendorPerformance.map((vendor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{vendor.vendor}</p>
                            <p className="text-sm text-gray-600">{vendor.repairs} repairs</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{vendor.avgCost}</p>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm text-gray-600">{vendor.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Fuel className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Fuel Analytics Dashboard</h2>
              </div>

              {/* Fuel Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <AnalyticsCard
                  title="Total Fuel Cost"
                  value={`₹${(fuelDashboardData.totalFuelCost / 1000).toFixed(0)}K`}
                  subtitle="Total fuel expenses"
                  icon={DollarSign}
                  color="bg-green-500"
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                />
                <AnalyticsCard
                  title="Total Liters"
                  value={`${(fuelDashboardData.totalLiters / 1000).toFixed(1)}K L`}
                  subtitle="Fuel consumed"
                  icon={Fuel}
                  color="bg-blue-500"
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                />
                <AnalyticsCard
                  title="Avg Fuel Price"
                  value={`₹${fuelDashboardData.avgFuelPrice}`}
                  subtitle="Per liter average"
                  icon={TrendingUp}
                  color="bg-purple-500"
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                />
                <AnalyticsCard
                  title="Active Vehicles"
                  value={fuelDashboardData.totalVehicles}
                  subtitle="Fuel consuming vehicles"
                  icon={Car}
                  color="bg-orange-500"
                  bgColor="bg-orange-50"
                  borderColor="border-orange-200"
                />
                <AnalyticsCard
                  title="Avg Consumption"
                  value={`${fuelDashboardData.avgConsumption} km/L`}
                  subtitle="Fleet average mileage"
                  icon={BarChart3}
                  color="bg-indigo-500"
                  bgColor="bg-indigo-50"
                  borderColor="border-indigo-200"
                />
              </div>

              {/* Fuel Analytics Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Top Fuel Consumers */}
                <div className="rounded-lg border border-gray-200 shadow-md bg-white">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 p-4">
                    <h3 className="text-green-700 font-medium">Top Fuel Consumers</h3>
                    <p className="text-green-600 text-sm">Highest fuel usage by person</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {fuelDashboardData.topFuelConsumers.map((consumer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{consumer.person}</p>
                            <p className="text-sm text-gray-600">{consumer.vehicle}</p>
                            <p className="text-xs text-gray-500">{consumer.trips} trips</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{consumer.liters}L</p>
                            <p className="text-sm text-gray-600">₹{consumer.cost}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fuel Efficiency */}
                <div className="rounded-lg border border-gray-200 shadow-md bg-white">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100 p-4">
                    <h3 className="text-blue-700 font-medium">Fuel Efficiency</h3>
                    <p className="text-blue-600 text-sm">Vehicle-wise mileage performance</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {fuelDashboardData.fuelEfficiency.map((vehicle, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.vehicle}</p>
                            <p className="text-sm text-gray-600">{vehicle.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{vehicle.efficiency} km/L</p>
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${
                                vehicle.efficiency > 15
                                  ? "bg-green-100 text-green-800"
                                  : vehicle.efficiency > 10
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {vehicle.efficiency > 15 ? "Excellent" : vehicle.efficiency > 10 ? "Good" : "Poor"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Fuel Trend */}
              <div className="rounded-lg border border-gray-200 shadow-md bg-white">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 p-4">
                  <h3 className="text-indigo-700 font-medium">Monthly Fuel Consumption Trend</h3>
                  <p className="text-indigo-600 text-sm">Fuel usage and cost trends over time</p>
                </div>
                <div className="p-4">
                  <div className="grid gap-4 md:grid-cols-6">
                    {fuelDashboardData.monthlyFuelData.map((month, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{month.month}</p>
                        <p className="text-sm text-blue-600">{month.liters}L</p>
                        <p className="text-xs text-gray-600">₹{(month.cost / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-500">{month.vehicles} vehicles</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            {vehicleData.criticalAlerts.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 shadow-md">
                <div className="bg-gradient-to-r from-red-100 to-red-200 p-4 border-b border-red-200">
                  <h3 className="text-red-700 font-medium flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Critical Alerts ({vehicleData.criticalAlerts.length})
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {vehicleData.criticalAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium text-red-900">{alert.vehicleName}</p>
                            <p className="text-sm text-red-700">{alert.issue}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-900">Due: {alert.dueDate}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <TaskModal
          isOpen={showCompletedModal}
          onClose={() => setShowCompletedModal(false)}
          title="Completed Tasks"
          tasks={vehicleData.completedTasks}
          type="completed"
        />
        <TaskModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          title="Pending Tasks"
          tasks={vehicleData.pendingTasksData}
          type="pending"
        />
        <TaskModal
          isOpen={showOverdueModal}
          onClose={() => setShowOverdueModal(false)}
          title="Overdue Tasks"
          tasks={vehicleData.overdueTasksData.map((task) => ({
            id: task.id, // Column B (index 1)
            assignedTo: task.assignedTo, // Column C (index 2)
            taskDescription: task.taskDescription, // Column D (index 3)
            taskStartDate: task.taskStartDate, // Column E (index 4)
            frequency: task.frequency, // Column F (index 5)
          }))}
          type="overdue"
        />
        <TaskModal
          isOpen={showUnderMaintenanceModal}
          onClose={() => setShowUnderMaintenanceModal(false)}
          title="Under Maintenance Tasks"
          tasks={vehicleData.underMaintenanceTasks}
          type="maintenance"
        />
      </div>
    </AdminLayout>
  )
}
