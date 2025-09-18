"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Filter, Eye, CheckCircle, Clock, X, History, ArrowLeft, CheckCircle2 } from "lucide-react"
import AdminLayout from "../components/layout/AdminLayout"

// Configuration object - Move all configurations here
const CONFIG = {
  // Google Apps Script URL
  APPS_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbypYVWE9dVvRsFBoOyJurc3i3ksZ3vd9y-QietOEEZfC8ezi5VlJb1F4jmJ1_v_agrThA/exec",
  // Google Drive folder ID for file uploads
  DRIVE_FOLDER_ID: "19wG6k5wA2FOzx_mNXlnL_mNPQjdXMWCg",
  // Sheet name to work with
  SHEET_NAME: "Checklist",
  // Page configuration
  PAGE_CONFIG: {
    title: "Vehicle Checklist - Pending Tasks",
    historyTitle: "Vehicle Checklist Task History",
    description: "Showing today, tomorrow's tasks and past due tasks",
    historyDescription: "Read-only view of completed tasks with submission history (excluding admin-processed items)",
  },
}

// Enhanced Vehicle Checklist Form Component with Fixed Scrolling
const VehicleChecklistForm = ({ task, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    taskId: task?.id || "",
    date: task?.taskStartDate || "",
    vehicleName: task?.title || "",
    checkedBy: "",
    // Main checklist items
    engineOilLevel: "",
    hydraulicOil: "",
    engineRotation: "",
    clutchPaddlePlay: "",
    brakePaddlePlay: "",
    brakeOilLevel: "",
    gearOil: "",
    allHosePipe: "",
    allTyrePressure: "",
    batteryTerminal: "",
    steeringOperation: "",
    gearLeverFreePlay: "",
    brakeMechanismOperation: "",
    allLightsElectrical: "",
    crownOil: "",
    clusterMeterError: "",
    hydraulicLine: "",
    greesingLineBushPin: "",
    allFuelLines: "",
    allOuterInnerCleaning: "",
    airFilter: "",
    // Remarks for "not ok" selections
    engineOilLevelRemarks: "",
    hydraulicOilRemarks: "",
    engineRotationRemarks: "",
    clutchPaddlePlayRemarks: "",
    brakePaddlePlayRemarks: "",
    brakeOilLevelRemarks: "",
    gearOilRemarks: "",
    allHosePipeRemarks: "",
    allTyrePressureRemarks: "",
    batteryTerminalRemarks: "",
    steeringOperationRemarks: "",
    gearLeverFreePlayRemarks: "",
    brakeMechanismOperationRemarks: "",
    allLightsElectricalRemarks: "",
    crownOilRemarks: "",
    clusterMeterErrorRemarks: "",
    hydraulicLineRemarks: "",
    greesingLineBushPinRemarks: "",
    allFuelLinesRemarks: "",
    allOuterInnerCleaningRemarks: "",
    airFilterRemarks: "",
    generalRemarks: "",
  })

  // State for dropdown options
  const [checkedByOptions, setCheckedByOptions] = useState([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  // Fetch dropdown options from Whatsapp sheet
  useEffect(() => {
    const fetchCheckedByOptions = async () => {
      try {
        setIsLoadingOptions(true)
        const sheetName = "Whatsapp"
        
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/15gXZwRrSOVA0vVbb__EdDoq554kYO50yiWnyteGrHJ0/gviz/tq?tqx=out:json&sheet=${sheetName}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch ${sheetName} sheet data: ${response.status}`)
        }

        const text = await response.text()
        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}")
        const jsonString = text.substring(jsonStart, jsonEnd + 1)
        const data = JSON.parse(jsonString)

        const options = []
        
        // Process rows to get column B data
        data.table.rows.forEach((row, rowIndex) => {
          if (rowIndex === 0) return // Skip header row
          
          // Get column B value (index 1)
          const cellValue = row.c && row.c[1] && row.c[1].v
          
          if (cellValue && cellValue.trim() !== "") {
            options.push(cellValue.trim())
          }
        })

        // Remove duplicates and sort
        const uniqueOptions = [...new Set(options)].sort()
        setCheckedByOptions(uniqueOptions)
      } catch (error) {
        console.error("Error fetching checked by options:", error)
        // Fallback to empty array if fetch fails
        setCheckedByOptions([])
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchCheckedByOptions()
  }, [])

  const checklistItems = [
    { key: "engineOilLevel", label: "Engine Oil Level" },
    { key: "hydraulicOil", label: "Hydraulic Oil" },
    { key: "engineRotation", label: "Engine Rotation" },
    { key: "clutchPaddlePlay", label: "Clutch Paddle Play" },
    { key: "brakePaddlePlay", label: "Brake Paddle Play" },
    { key: "brakeOilLevel", label: "Brake Oil Level" },
    { key: "gearOil", label: "Gear Oil" },
    { key: "allHosePipe", label: "All Hose Pipe" },
    { key: "allTyrePressure", label: "All Tyre Pressure" },
    { key: "batteryTerminal", label: "Battery Terminal and Battery" },
    { key: "steeringOperation", label: "Steering Operation" },
    { key: "gearLeverFreePlay", label: "Gear Lever Free Play" },
    { key: "brakeMechanismOperation", label: "Brake Mechanism Operation" },
    { key: "allLightsElectrical", label: "All Lights and Electrical Components" },
    { key: "crownOil", label: "Crown Oil" },
    { key: "clusterMeterError", label: "Cluster Meter Error Indication (BSVI)" },
    { key: "hydraulicLine", label: "Hydraulic Line" },
    { key: "greesingLineBushPin", label: "Greasing Line and Bush Pin" },
    { key: "allFuelLines", label: "All Fuel Lines" },
    { key: "allOuterInnerCleaning", label: "All Outer and Inner Components Cleaning" },
    { key: "airFilter", label: "Air Filter" },
  ]

  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "ok", label: "Ok" },
    { value: "not ok", label: "Not Ok" },
    { value: "done", label: "Done" },
    { value: "n/a", label: "N/A" },
  ]

  const handleStatusChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      // Clear remarks if status is not "not ok"
      [`${key}Remarks`]: value === "not ok" ? prev[`${key}Remarks`] : "",
    }))
  }

  const handleRemarksChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [`${key}Remarks`]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.checkedBy.trim()) {
      alert("Please select who checked the vehicle")
      return
    }

    // Validate that all items have a status
    const missingItems = checklistItems.filter((item) => !formData[item.key])
    if (missingItems.length > 0) {
      alert(`Please select status for: ${missingItems.map((item) => item.label).join(", ")}`)
      return
    }

    // Validate that "not ok" items have remarks
    const notOkItems = checklistItems.filter(
      (item) => formData[item.key] === "not ok" && !formData[`${item.key}Remarks`].trim(),
    )
    if (notOkItems.length > 0) {
      alert(`Please provide remarks for "not ok" items: ${notOkItems.map((item) => item.label).join(", ")}`)
      return
    }

    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Modal Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-blue-700">Vehicle Maintenance Checklist</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task ID*</label>
                <input
                  type="text"
                  value={formData.taskId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                <input
                  type="text"
                  value={formData.date}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name*</label>
                <input
                  type="text"
                  value={formData.vehicleName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checked By*</label>
                <select
                  value={formData.checkedBy}
                  onChange={(e) => setFormData((prev) => ({ ...prev, checkedBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoadingOptions}
                >
                  <option value="">
                    {isLoadingOptions ? "Loading..." : "Select checker"}
                  </option>
                  {checkedByOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Vehicle Status Checklist
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Checkpoint</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                        Remarks (if Not Ok)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {checklistItems.map((item, index) => (
                      <tr key={item.key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.label}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={formData[item.key]}
                            onChange={(e) => handleStatusChange(item.key, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {formData[item.key] === "not ok" && (
                            <textarea
                              value={formData[`${item.key}Remarks`]}
                              onChange={(e) => handleRemarksChange(item.key, e.target.value)}
                              placeholder="Please explain why this item is not ok..."
                              rows={2}
                              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                              required
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* General Remarks Section */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-2">General Remarks</label>
                <textarea
                  value={formData.generalRemarks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, generalRemarks: e.target.value }))}
                  placeholder="Give remarks if check point is Not Ok or any additional observations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer - Fixed */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Submit Checklist
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SalesDataPage() {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStaff, setFilterStaff] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showChecklistForm, setShowChecklistForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [membersList, setMembersList] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Get current user details
  const username = sessionStorage.getItem("username") || ""
  const userRole = sessionStorage.getItem("role") || "user"

  // Helper functions for date parsing
  const parseDateFromDDMMYYYY = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null
    const parts = dateStr.split("/")
    if (parts.length !== 3) return null
    return new Date(parts[2], parts[1] - 1, parts[0])
  }

  const formatDateToDDMMYYYY = (date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateTimeToDDMMYYYY = (date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const isEmpty = (value) => {
    return value === null || value === undefined || (typeof value === "string" && value.trim() === "")
  }

  const getCellValue = (row, index) => {
    if (!row || !row.c || index >= row.c.length) return null
    const cell = row.c[index]
    return cell && "v" in cell ? cell.v : null
  }

  // Fixed parseGoogleSheetsDate function
  const parseGoogleSheetsDate = (dateStr) => {
    if (!dateStr) return ""

    // Handle Google Sheets Date format: Date(2025,7,8,9,0,0)
    if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
      const match = /Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/.exec(dateStr)
      if (match) {
        const year = parseInt(match[1], 10)
        const month = parseInt(match[2], 10) // Google Sheets uses 0-based months
        const day = parseInt(match[3], 10)
        const hour = match[4] ? parseInt(match[4], 10) : 0
        const minute = match[5] ? parseInt(match[5], 10) : 0
        const second = match[6] ? parseInt(match[6], 10) : 0
        
        // Create date object (month is already 0-based from Google Sheets)
        const date = new Date(year, month, day, hour, minute, second)
        
        // Format as DD/MM/YYYY HH:MM:SS if time components exist, otherwise DD/MM/YYYY
        const dayStr = day.toString().padStart(2, "0")
        const monthStr = (month + 1).toString().padStart(2, "0") // Convert to 1-based for display
        const yearStr = year.toString()
        
        if (hour || minute || second) {
          const hourStr = hour.toString().padStart(2, "0")
          const minuteStr = minute.toString().padStart(2, "0")
          const secondStr = second.toString().padStart(2, "0")
          return `${dayStr}/${monthStr}/${yearStr} ${hourStr}:${minuteStr}:${secondStr}`
        } else {
          return `${dayStr}/${monthStr}/${yearStr}`
        }
      }
    }

    // Handle DD/MM/YYYY format
    if (typeof dateStr === "string" && dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = dateStr.split("/")
      const day = parts[0].padStart(2, "0")
      const month = parts[1].padStart(2, "0")
      const year = parts[2]
      return `${day}/${month}/${year}`
    }

    // Handle Date objects
    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
      const day = dateStr.getDate().toString().padStart(2, "0")
      const month = (dateStr.getMonth() + 1).toString().padStart(2, "0")
      const year = dateStr.getFullYear()
      const hour = dateStr.getHours()
      const minute = dateStr.getMinutes()
      const second = dateStr.getSeconds()
      
      if (hour || minute || second) {
        const hourStr = hour.toString().padStart(2, "0")
        const minuteStr = minute.toString().padStart(2, "0")
        const secondStr = second.toString().padStart(2, "0")
        return `${day}/${month}/${year} ${hourStr}:${minuteStr}:${secondStr}`
      } else {
        return `${day}/${month}/${year}`
      }
    }

    // Try to parse as generic date string
    try {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }
    } catch (e) {
      console.error("Error parsing date:", e)
    }

    return dateStr
  }

  // Fixed isDateToday function
  const isDateToday = (dateStr) => {
    if (!dateStr) return false;
    
    try {
      let taskDate;
      
      // Handle Google Sheets Date format: Date(2025,7,8,9,0,0)
      if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
        const match = /Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/.exec(dateStr)
        if (match) {
          const year = parseInt(match[1], 10)
          const month = parseInt(match[2], 10) // Google Sheets uses 0-based months
          const day = parseInt(match[3], 10)
          taskDate = new Date(year, month, day) // month is already 0-based
        }
      }
      // Handle DD/MM/YYYY format
      else if (typeof dateStr === "string" && dateStr.includes('/')) {
        const parts = dateStr.split(' ')[0].split('/'); // Take only date part, ignore time
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Convert to 0-based
          const year = parseInt(parts[2], 10);
          taskDate = new Date(year, month, day);
        }
      }
      // Handle Date objects
      else if (dateStr instanceof Date) {
        taskDate = new Date(dateStr);
      }
      // Try generic date parsing
      else {
        taskDate = new Date(dateStr);
      }
      
      if (!taskDate || isNaN(taskDate.getTime())) {
        return false;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      taskDate.setHours(0, 0, 0, 0);
      
      return taskDate.getTime() === today.getTime();
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return false;
    }
  };

  // Fixed isDateInRange function for checking yesterday, today, tomorrow
// Fixed isDateInRange function for checking today and overdue tasks only
const isDateInRange = (dateStr) => {
  if (!dateStr) return false;
  
  try {
    let taskDate;
    
    // Handle Google Sheets Date format: Date(2025,7,8,9,0,0)
    if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
      const match = /Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/.exec(dateStr)
      if (match) {
        const year = parseInt(match[1], 10)
        const month = parseInt(match[2], 10) // Google Sheets uses 0-based months
        const day = parseInt(match[3], 10)
        taskDate = new Date(year, month, day) // month is already 0-based
      }
    }
    // Handle DD/MM/YYYY format
    else if (typeof dateStr === "string" && dateStr.includes('/')) {
      const parts = dateStr.split(' ')[0].split('/'); // Take only date part, ignore time
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Convert to 0-based
        const year = parseInt(parts[2], 10);
        taskDate = new Date(year, month, day);
      }
    }
    // Handle Date objects
    else if (dateStr instanceof Date) {
      taskDate = new Date(dateStr);
    }
    // Try generic date parsing
    else {
      taskDate = new Date(dateStr);
    }
    
    if (!taskDate || isNaN(taskDate.getTime())) {
      return false;
    }
    
    const today = new Date();
    
    // Set all times to midnight for comparison
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    const taskTime = taskDate.getTime();
    const todayTime = today.getTime();
    
    // Return true only if task date is today or before today (overdue)
    return taskTime <= todayTime;
  } catch (error) {
    console.error("Error parsing date for range check:", dateStr, error);
    return false;
  }
};

  // Fetch sheet data
  const fetchSheetData = useCallback(async () => {
    try {
      setIsLoading(true)
      const pendingTasks = []
      const historyRows = []
      const sheetName = CONFIG.SHEET_NAME

      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/15gXZwRrSOVA0vVbb__EdDoq554kYO50yiWnyteGrHJ0/gviz/tq?tqx=out:json&sheet=${sheetName}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch ${sheetName} sheet data: ${response.status}`)
      }

      const text = await response.text()
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}")
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)

      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      
      const todayStr = formatDateToDDMMYYYY(today)
      const tomorrowStr = formatDateToDDMMYYYY(tomorrow)
      const yesterdayStr = formatDateToDDMMYYYY(yesterday)

      const membersSet = new Set()

      console.log("Processing sheet data:", data.table.rows.length, "rows")
      console.log("Sheet columns:", data.table.cols ? data.table.cols.map(col => col.label) : "No columns")
      console.log("First few rows structure:", data.table.rows.slice(0, 3).map((row, i) => ({
        rowIndex: i,
        cellCount: row.c ? row.c.length : 0,
        cells: row.c ? row.c.map((cell, idx) => `[${idx}]: ${cell ? cell.v : 'null'}`) : 'No cells'
      })))

      data.table.rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return // Skip header row

        // Get basic task info
        const taskId = getCellValue(row, 1) // Column B - Task ID
        const departmentName = getCellValue(row, 2) // Column C - Department Name  
        const givenBy = getCellValue(row, 2) // Column D - Given By
        const assignedTo = getCellValue(row, 2) // Column E - Name (Assigned To)
        const taskDescription = getCellValue(row, 3) // Column F - Task Description
        const taskStartDateValue = getCellValue(row, 4) // Column G - Task Start Date
        const frequency = getCellValue(row, 5) // Column H - Frequency
        const actualDateValue = getCellValue(row, 6) // Column K - Actual Date (Completion)
        const status = getCellValue(row, 8) // Column M - Status
        const remarks = getCellValue(row, 9) // Column N - Remarks
        const remarks1 = getCellValue(row, 10) // Column N - Remarks
        const remarks2 = getCellValue(row, 11) // Column N - Remarks
        const remarks3 = getCellValue(row, 13) // Column N - Remarks
        const remarks4 = getCellValue(row, 14) // Column N - Remarks

        console.log(`Row ${rowIndex + 1}:`, {
          taskId,
          assignedTo,
          taskStartDateValue,
          actualDateValue,
          status,
          rawRow: row.c ? row.c.map(cell => cell ? cell.v : null) : 'No cells'
        })

        // Skip rows without task ID
        if (!taskId || taskId === "" || (typeof taskId === "string" && taskId.trim() === "")) {
          console.log(`Skipping row ${rowIndex + 1} - no task ID`)
          return
        }

        // Add to members list
        if (assignedTo) {
          membersSet.add(assignedTo)
        }

        // Filter by user (non-admin users only see their tasks)
        const isUserMatch = userRole === "admin" || 
                           (assignedTo && assignedTo.toLowerCase() === username.toLowerCase())

        if (!isUserMatch && userRole !== "admin") {
          console.log(`Skipping row ${rowIndex + 1} - user mismatch`)
          return
        }

        // Parse dates
        const taskStartDate = taskStartDateValue ? parseGoogleSheetsDate(String(taskStartDateValue)) : ""
        const actualDate = actualDateValue ? parseGoogleSheetsDate(String(actualDateValue)) : ""

        const stableId = `task_${taskId}_${rowIndex + 1}`

        const taskData = {
          _id: stableId,
          _rowIndex: rowIndex + 1,
          _taskId: taskId,
          id: String(taskId).trim(),
          title: taskDescription || "Untitled Task",
          assignedTo: assignedTo || "Unassigned",
          taskStartDate,
          frequency: frequency || "one-time",
          completionDate: actualDate,
          status: status || "",
          // Store all columns for reference
          col1: taskId,
          col2: departmentName || "",
          col3: givenBy || "",
          col4: assignedTo || "",
          col5: taskDescription || "",
          col6: taskStartDate,
          col7: frequency || "",
          col8: getCellValue(row, 8) || "",
          col9: getCellValue(row, 9) || "",
          col10: actualDate,
          col11: getCellValue(row, 10) || "",
          col12: status || "",
          col13: getCellValue(row, 11) || "",
          col14: getCellValue(row, 13) || "",
          col15: getCellValue(row, 14) || "",
        }

        // Determine if task should be in pending or history
        // PENDING CRITERIA: Tasks that need to be done today and are not completed
        // - Must have a task start date
        // - Task start date should be today, yesterday, or tomorrow (flexible range)
        // - Should NOT have completion date OR status should not be "Yes"
        
        const hasCompletionDate = actualDate && actualDate.trim() !== ""
        const isCompleted = status && (status.toLowerCase() === "yes" || status.toLowerCase() === "completed")
        
        if (taskStartDate) {
  const isTaskForTodayOrOverdue = isDateInRange(taskStartDate);

  if (isTaskForTodayOrOverdue && !hasCompletionDate && !isCompleted) {
    console.log(`Adding to pending:`, taskData.id, taskStartDate)
    pendingTasks.push(taskData)
  } else if (hasCompletionDate || isCompleted) {
    console.log(`Adding to history:`, taskData.id, actualDate || status)
    historyRows.push(taskData)
  }
} else {
          console.log(`Row ${rowIndex + 1} - no task start date`)
        }
      })

      console.log("Final counts:", {
        pendingTasks: pendingTasks.length,
        historyRows: historyRows.length,
        totalMembers: membersSet.size
      })

      setMembersList(Array.from(membersSet).sort())
      setTasks(pendingTasks)
      setFilteredTasks(pendingTasks)
      setHistoryData(historyRows)
    } catch (error) {
      console.error("Error fetching pending tasks:", error)
      // Show user-friendly error message
      alert("Failed to load tasks. Please refresh the page and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [username, userRole])

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.id.toLowerCase().includes(query) ||
          task.assignedTo.toLowerCase().includes(query),
      )
    }

    // Filter by staff (for admin)
    if (filterStaff !== "all" && userRole === "admin") {
      filtered = filtered.filter((task) => task.assignedTo === filterStaff)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchQuery, filterStaff, userRole])

  // Filter history data
  const filteredHistoryData = useMemo(() => {
    return historyData
      .filter((item) => {
        const matchesSearch = searchQuery
          ? Object.values(item).some(
              (value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : true

        const matchesMember = selectedMembers.length > 0 ? selectedMembers.includes(item["col4"]) : true

        let matchesDateRange = true
        if (startDate || endDate) {
          const itemDate = parseDateFromDDMMYYYY(item["col10"])
          if (!itemDate) return false
          if (startDate) {
            const startDateObj = new Date(startDate)
            startDateObj.setHours(0, 0, 0, 0)
            if (itemDate < startDateObj) matchesDateRange = false
          }
          if (endDate) {
            const endDateObj = new Date(endDate)
            endDateObj.setHours(23, 59, 59, 999)
            if (itemDate > endDateObj) matchesDateRange = false
          }
        }

        return matchesSearch && matchesMember && matchesDateRange
      })
      .sort((a, b) => {
        const dateStrA = a["col10"] || ""
        const dateStrB = b["col10"] || ""
        const dateA = parseDateFromDDMMYYYY(dateStrA)
        const dateB = parseDateFromDDMMYYYY(dateStrB)
        if (!dateA) return 1
        if (!dateB) return -1
        return dateB.getTime() - dateA.getTime()
      })
  }, [historyData, searchQuery, selectedMembers, startDate, endDate])

  // Get unique staff members for filter
  const staffMembers = [...new Set(tasks.map((task) => task.assignedTo))].sort()

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedMembers([])
    setStartDate("")
    setEndDate("")
  }

  const handleMemberSelection = (member) => {
    setSelectedMembers((prev) => {
      if (prev.includes(member)) {
        return prev.filter((item) => item !== member)
      } else {
        return [...prev, member]
      }
    })
  }

  const getFilteredMembersList = () => {
    if (userRole === "admin") {
      return membersList
    } else {
      return membersList.filter((member) => member.toLowerCase() === username.toLowerCase())
    }
  }

  const getTaskStatistics = () => {
    const totalCompleted = historyData.length
    const memberStats =
      selectedMembers.length > 0
        ? selectedMembers.reduce((stats, member) => {
            const memberTasks = historyData.filter((task) => task["col4"] === member).length
            return {
              ...stats,
              [member]: memberTasks,
            }
          }, {})
        : {}
    const filteredTotal = filteredHistoryData.length
    return {
      totalCompleted,
      memberStats,
      filteredTotal,
    }
  }

  const toggleHistory = () => {
    setShowHistory((prev) => !prev)
    resetFilters()
  }

  // Handle process button click
  const handleProcessTask = (task) => {
    setSelectedTask(task)
    setShowChecklistForm(true)
  }

  // Handle checklist form submission
  const handleChecklistSubmit = async (formData) => {
    try {
      console.log("Submitting checklist data:", formData)
  
      const today = new Date()
      const todayFormatted = formatDateTimeToDDMMYYYY(today)
  
      // Prepare submission data
      const submissionData = {
        taskId: selectedTask.col1,
        rowIndex: selectedTask._rowIndex,
        actualDate: todayFormatted, // Will go to column G
        checkedBy: formData.checkedBy, // Will go to column O
        generalRemarks: formData.generalRemarks || "Vehicle checklist completed", // Will go to column N
        status: "", // Mark as completed in column M
        okItems: [],
        notOkItems: [],
        doneItems: [],
        naItems: []
      }
  
      // List of all checklist items
      const checklistItems = [
        { key: "engineOilLevel", label: "Engine Oil Level" },
        { key: "hydraulicOil", label: "Hydraulic Oil" },
        { key: "engineRotation", label: "Engine Rotation" },
        { key: "clutchPaddlePlay", label: "Clutch Paddle Play" },
        { key: "brakePaddlePlay", label: "Brake Paddle Play" },
        { key: "brakeOilLevel", label: "Brake Oil Level" },
        { key: "gearOil", label: "Gear Oil" },
        { key: "allHosePipe", label: "All Hose Pipe" },
        { key: "allTyrePressure", label: "All Tyre Pressure" },
        { key: "batteryTerminal", label: "Battery Terminal and Battery" },
        { key: "steeringOperation", label: "Steering Operation" },
        { key: "gearLeverFreePlay", label: "Gear Lever Free Play" },
        { key: "brakeMechanismOperation", label: "Brake Mechanism Operation" },
        { key: "allLightsElectrical", label: "All Lights and Electrical Components" },
        { key: "crownOil", label: "Crown Oil" },
        { key: "clusterMeterError", label: "Cluster Meter Error Indication (BSVI)" },
        { key: "hydraulicLine", label: "Hydraulic Line" },
        { key: "greesingLineBushPin", label: "Greasing Line and Bush Pin" },
        { key: "allFuelLines", label: "All Fuel Lines" },
        { key: "allOuterInnerCleaning", label: "All Outer and Inner Components Cleaning" },
        { key: "airFilter", label: "Air Filter" },
      ]
  
      // Categorize each checklist item based on its status
      checklistItems.forEach(item => {
        const status = formData[item.key]
        const remarks = formData[`${item.key}Remarks`] || ""
        
        if (status === "ok") {
          submissionData.okItems.push(item.label)
        } 
        else if (status === "not ok") {
          submissionData.notOkItems.push({
            item: item.label,
            remarks: remarks
          })
        }
        else if (status === "done") {
          submissionData.doneItems.push(item.label)
        }
        else if (status === "n/a") {
          submissionData.naItems.push(item.label)
        }
      })
  
      // Stringify the arrays for storage in Google Sheets
      submissionData.okItemsJSON = JSON.stringify(submissionData.okItems)
      submissionData.notOkItemsJSON = JSON.stringify(submissionData.notOkItems)
      submissionData.doneItemsJSON = JSON.stringify(submissionData.doneItems)
      submissionData.naItemsJSON = JSON.stringify(submissionData.naItems)
  
      // Update local state optimistically
      setTasks((prev) => prev.filter((task) => task._id !== selectedTask._id))
      setFilteredTasks((prev) => prev.filter((task) => task._id !== selectedTask._id))
  
      // Add to history
      const completedTask = {
        ...selectedTask,
        col10: todayFormatted, // Column K - Actual Date
        col12: "Yes", // Column M - Status
        col13: formData.generalRemarks || "Vehicle checklist completed", // Column N - Remarks
        col15: formData.checkedBy // Column O - Checked By
      }
      setHistoryData((prev) => [completedTask, ...prev])
  
      // Close the form
      setShowChecklistForm(false)
      setSelectedTask(null)
  
      setSuccessMessage("Vehicle checklist submitted successfully!")
  
      // Submit to Google Sheets
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("sheetName", CONFIG.SHEET_NAME)
      formDataToSubmit.append("action", "updateChecklistData")
      formDataToSubmit.append("rowData", JSON.stringify([submissionData]))
  
      const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        body: formDataToSubmit,
      });
  
      const result = await response.json()
      if (!result.success) {
        console.error("Background submission failed:", result.error)
      }
    } catch (error) {
      console.error("Error submitting checklist:", error)
      alert("Failed to submit checklist. Please try again.")
    }
  }

  useEffect(() => {
    fetchSheetData()
  }, [fetchSheetData])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight text-purple-500">
            {showHistory ? CONFIG.PAGE_CONFIG.historyTitle : CONFIG.PAGE_CONFIG.title}
          </h1>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={showHistory ? "Search history..." : "Search tasks..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={toggleHistory}
              className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 py-2 px-4 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showHistory ? (
                <div className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Back to Tasks</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <History className="h-4 w-4 mr-1" />
                  <span>View History</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              {successMessage}
            </div>
            <button onClick={() => setSuccessMessage("")} className="text-green-500 hover:text-green-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {showHistory ? (
          /* History View */
          <div className="rounded-lg border border-purple-200 bg-white shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
              <h2 className="text-lg font-medium text-purple-700">Completed Vehicle Checklist Tasks</h2>
              <p className="text-purple-600 text-sm">
                {CONFIG.PAGE_CONFIG.historyDescription} for {userRole === "admin" ? "all" : "your"} tasks
              </p>
            </div>

            {/* History Filters */}
            <div className="p-4 border-b border-purple-100 bg-gray-50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {getFilteredMembersList().length > 0 && (
                  <div className="flex flex-col">
                    <div className="mb-2 flex items-center">
                      <span className="text-sm font-medium text-purple-700">Filter by Member:</span>
                    </div>
                    <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md bg-white">
                      {getFilteredMembersList().map((member, idx) => (
                        <div key={idx} className="flex items-center">
                          <input
                            id={`member-${idx}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            checked={selectedMembers.includes(member)}
                            onChange={() => handleMemberSelection(member)}
                          />
                          <label htmlFor={`member-${idx}`} className="ml-2 text-sm text-gray-700">
                            {member}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <div className="mb-2 flex items-center">
                    <span className="text-sm font-medium text-purple-700">Filter by Date Range:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <label htmlFor="start-date" className="text-sm text-gray-700 mr-1">
                        From
                      </label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-sm border border-gray-200 rounded-md p-1"
                      />
                    </div>
                    <div className="flex items-center">
                      <label htmlFor="end-date" className="text-sm text-gray-700 mr-1">
                        To
                      </label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-sm border border-gray-200 rounded-md p-1"
                      />
                    </div>
                  </div>
                </div>

                {(selectedMembers.length > 0 || startDate || endDate || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Task Statistics */}
            <div className="p-4 border-b border-purple-100 bg-blue-50">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Task Completion Statistics:</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="px-3 py-2 bg-white rounded-md shadow-sm">
                    <span className="text-xs text-gray-500">Total Completed</span>
                    <div className="text-lg font-semibold text-blue-600">{getTaskStatistics().totalCompleted}</div>
                  </div>
                  {(selectedMembers.length > 0 || startDate || endDate || searchQuery) && (
                    <div className="px-3 py-2 bg-white rounded-md shadow-sm">
                      <span className="text-xs text-gray-500">Filtered Results</span>
                      <div className="text-lg font-semibold text-blue-600">{getTaskStatistics().filteredTotal}</div>
                    </div>
                  )}
                  {selectedMembers.map((member) => (
                    <div key={member} className="px-3 py-2 bg-white rounded-md shadow-sm">
                      <span className="text-xs text-gray-500">{member}</span>
                      <div className="text-lg font-semibold text-indigo-600">
                        {getTaskStatistics().memberStats[member]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="h-[calc(100vh-300px)] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Task ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Doer Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Task Description
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50 min-w-[140px]">
                      Task Start Date & Time
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                      Freq
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 min-w-[140px]">
                      Actual Date & Time
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 min-w-[80px]">
                      Ok
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50 min-w-[150px]">
                      Not Ok
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 min-w-[80px]">
                      Done
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50 min-w-[150px]">
                      N/A
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 min-w-[80px]">
                      Remarks
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50 min-w-[150px]">
                      Checked By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistoryData.length > 0 ? (
                    filteredHistoryData.map((history) => (
                      <tr key={history._id} className="hover:bg-gray-50">
                        {/* Task ID */}
                        <td className="px-3 py-4 min-w-[100px]">
                          <div className="text-sm font-medium text-gray-900 break-words">{history["col1"] || "—"}</div>
                        </td>
                        
                        {/* Doer Name */}
                        <td className="px-3 py-4 min-w-[100px]">
                          <div className="text-sm text-gray-900 break-words">{history["col4"] || "—"}</div>
                        </td>
                        
                        {/* Task Description */}
                        <td className="px-3 py-4 min-w-[200px]">
                          <div className="text-sm text-gray-900 break-words" title={history["col5"]}>
                            {history["col5"] || "—"}
                          </div>
                        </td>
                        
                        {/* Task Start Date & Time */}
                        <td className="px-3 py-4 bg-yellow-50 min-w-[140px]">
                          <div className="text-sm text-gray-900 break-words">
                            {history["col6"] ? (
                              <div>
                                <div className="font-medium break-words">
                                  {history["col6"].includes(" ") ? history["col6"].split(" ")[0] : history["col6"]}
                                </div>
                                {history["col6"].includes(" ") && (
                                  <div className="text-xs text-gray-500 break-words">
                                    {history["col6"].split(" ")[1]}
                                  </div>
                                )}
                              </div>
                            ) : (
                              "—"
                            )}
                          </div>
                        </td>
                        
                        {/* Frequency */}
                        <td className="px-3 py-4 min-w-[80px]">
                          <div className="text-sm text-gray-900 break-words">{history["col7"] || "—"}</div>
                        </td>
            
            {/* Actual Date & Time */}
            <td className="px-3 py-4 bg-green-50 min-w-[140px]">
              <div className="text-sm text-gray-900 break-words">
                {history["col10"] ? (
                  <div>
                    <div className="font-medium break-words">
                      {history["col10"].includes(" ") ? history["col10"].split(" ")[0] : history["col10"]}
                    </div>
                    {history["col10"].includes(" ") && (
                      <div className="text-xs text-gray-500 break-words">
                        {history["col10"].split(" ")[1]}
                      </div>
                    )}
                  </div>
                ) : (
                  "—"
                )}
              </div>
            </td>
            
            {/* Ok */}
            <td className="px-3 py-4 bg-blue-50 min-w-[80px]">
              <div className="text-sm text-gray-900 break-words">
                {history["col8"] || "—"}
              </div>
            </td>
            
            {/* Not Ok */}
            <td className="px-3 py-4 bg-purple-50 min-w-[150px]">
              <div className="text-sm text-gray-900 break-words">
                {history["col9"] || "—"}
              </div>
            </td>
            
            {/* Done */}
            <td className="px-3 py-4 bg-blue-50 min-w-[80px]">
              <div className="text-sm text-gray-900 break-words">
                {history["col11"] || "—"}
              </div>
            </td>
            
            {/* N/A */}
            <td className="px-3 py-4 bg-purple-50 min-w-[150px]">
              <div className="text-sm text-gray-900 break-words">
                {history["col13"] || "—"}
              </div>
            </td>
            
            {/* Remarks */}
            <td className="px-3 py-4 bg-blue-50 min-w-[80px]">
              <div className="text-sm text-gray-900 break-words">
                {history["col14"] || "—"}
              </div>
            </td>
            
            {/* Checked By */}
            <td className="px-3 py-4 bg-purple-50 min-w-[150px]">
              <div className="text-sm text-gray-900 break-words">
                {history["col15"] || "—"}
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={12} className="px-6 py-4 text-center text-gray-500">
            {searchQuery || selectedMembers.length > 0 || startDate || endDate
              ? "No historical records matching your filters"
              : "No completed records found"}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
          </div>
        ) : (
          /* Pending Tasks View */
          <>
            {/* Filters */}
            <div className="rounded-lg border border-purple-200 bg-white shadow-md">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
                <h2 className="text-lg font-medium text-purple-700">Filter Tasks</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1 space-y-2">
                    <label htmlFor="search" className="flex items-center text-purple-700">
                      <Search className="h-4 w-4 mr-2" />
                      Search Tasks
                    </label>
                    <input
                      id="search"
                      placeholder="Search by task title, ID, or assigned person"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  {userRole === "admin" && (
                    <div className="space-y-2 md:w-[200px]">
                      <label htmlFor="staff-filter" className="flex items-center text-purple-700">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter by Staff
                      </label>
                      <select
                        id="staff-filter"
                        value={filterStaff}
                        onChange={(e) => setFilterStaff(e.target.value)}
                        className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="all">All Staff</option>
                        {staffMembers.map((staff) => (
                          <option key={staff} value={staff}>
                            {staff}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="rounded-lg border border-purple-200 bg-white shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
                <h2 className="text-lg font-medium text-purple-700">
                  Today's Pending Vehicle Checklists ({filteredTasks.length})
                </h2>
                <p className="text-purple-600 text-sm">Tasks that need to be processed today</p>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">No pending tasks for today!</p>
                  <p className="text-sm">All vehicle checklists have been completed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
  <tr>
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Action
    </th>
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Task ID
    </th>
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Doer Name
    </th>
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Task Description
    </th>
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Task Start Date
    </th>
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Frequency
    </th>
  </tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
  {filteredTasks.map((task) => (
    <tr key={task.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => handleProcessTask(task)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Eye className="h-4 w-4 mr-1" />
          Process
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.col1 || "—"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.col2 || "—"}</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        <div className="max-w-xs truncate" title={task.col5}>
          {task.col5 || "—"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {task.col6 ? (
          <div>
            <div className="font-medium break-words">
              {task.col6.includes(" ") ? task.col6.split(" ")[0] : task.col6}
            </div>
            {task.col6.includes(" ") && (
              <div className="text-xs text-gray-500 break-words">
                {task.col6.split(" ")[1]}
              </div>
            )}
          </div>
        ) : "—"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {task.col7 || "—"}
        </span>
      </td>
    </tr>
  ))}
</tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Vehicle Checklist Form Modal */}
        {showChecklistForm && selectedTask && (
          <VehicleChecklistForm
            task={selectedTask}
            onClose={() => {
              setShowChecklistForm(false)
              setSelectedTask(null)
            }}
            onSubmit={handleChecklistSubmit}
          />
        )}
      </div>
    </AdminLayout>
  )
}
