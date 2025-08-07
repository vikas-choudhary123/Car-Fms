"use client";

import React from "react";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function VehicleDashboard() {
  const [selectedVehicleType, setSelectedVehicleType] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStaff, setFilterStaff] = useState("all");
  const [tableFormat, setTableFormat] = useState("normal"); // 'normal' or 'compact'

  // Modal states for different card types
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [showUnderMaintenanceModal, setShowUnderMaintenanceModal] =
    useState(false);

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
  });

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
  ];

  // Helper functions for date parsing
  const parseDateFromDDMMYYYY = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateToday = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr);
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isDateOverdue = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr);
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getCellValue = (row, index) => {
    if (!row || !row.c || index >= row.c.length) return null;
    const cell = row.c[index];
    return cell && "v" in cell ? cell.v : null;
  };

  // Improved vehicle type detection from description
  const getVehicleTypeFromDescription = (description) => {
    if (!description) return "car";
    const desc = description.toLowerCase();
    // Check each vehicle type's keywords
    for (const vehicleType of vehicleTypes) {
      if (vehicleType.value === "all") continue;
      for (const keyword of vehicleType.keywords) {
        if (desc.includes(keyword)) {
          return vehicleType.value;
        }
      }
    }
    return "car"; // Default to car if no match found
  };

  // Get today's date in DD/MM/YYYY format
  const getTodayDate = () => {
    return formatDateToDDMMYYYY(new Date());
  };

  // Fetch and process vehicle data
const fetchVehicleData = async () => {
  try {
    const appScriptUrl =
      "https://script.google.com/macros/s/AKfycbypYVWE9dVvRsFBoOyJurc3i3ksZ3vd9y-QietOEEZfC8ezi5VlJb1F4jmJ1_v_agrThA/exec";
    const sheetName = "Checklist";

    const response = await fetch(`${appScriptUrl}?sheet=${sheetName}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${sheetName} sheet data: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch data");
    }

    // Get current user details
    const username = sessionStorage.getItem("username");
    const userRole = sessionStorage.getItem("role");

    // Process vehicle data
    const vehicleMap = new Map();
    const maintenanceHistory = [];
    const upcomingMaintenance = [];
    const criticalAlerts = [];
    const completedTasks = [];
    const pendingTasksData = [];
    const overdueTasksData = [];
    const underMaintenanceTasks = [];

    let totalFleet = 0;
    let completedChecks = 0;
    let pendingChecks = 0;
    let overdueChecks = 0;
    let underMaintenanceCount = 0;

    const todayDate = getTodayDate();

    data.table.rows.forEach((row, rowIndex) => {
      if (rowIndex === 0) return; // Skip header

      // Get data from columns
      const taskId = getCellValue(row, 1) || ""; // Column B
      const doer = getCellValue(row, 2) || ""; // Column C
      const taskDescription = getCellValue(row, 3) || ""; // Column D
      const dueDate = getCellValue(row, 4) || ""; // Column E
      const frequency = getCellValue(row, 5) || ""; // Column F
      const actualDate = getCellValue(row, 6) || ""; // Column G
      const underMaintenanceValue = getCellValue(row, 9) || ""; // Column J

      // Check if user should see this task
      const isUserMatch =
        userRole === "admin" || doer.toLowerCase() === username.toLowerCase();
      if (!isUserMatch) return;

      if (!taskId) return;

      // Extract vehicle info from task description
      const vehicleType = getVehicleTypeFromDescription(taskDescription);
      const vehicleId = `${vehicleType}_${taskId}`;
      const vehicleName = taskDescription.split(" ")[0] || `Vehicle ${taskId}`;

      // Skip if a specific vehicle is selected and this task doesn't match
      if (selectedVehicleId !== "all" && selectedVehicleId !== vehicleName) {
        return;
      }

      // Count total fleet (total rows with task ID)
      totalFleet++;

      // Determine check status based on your requirements
      let checkStatus = "pending";

      if (actualDate && actualDate.trim() !== "") {
        // Column G is not null - completed check
        checkStatus = "completed";
        completedChecks++;

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
        });

        maintenanceHistory.push({
          vehicleId,
          vehicleName,
          type: vehicleType,
          checkType: taskDescription,
          completedDate: actualDate,
          assignedTo: doer,
        });
      } else {
        // Column G is null - check if it's pending or overdue
        if (isDateToday(dueDate)) {
          // Due date matches today - pending
          checkStatus = "pending";
          pendingChecks++;

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
          });
        } else if (isDateOverdue(dueDate)) {
          // Due date is overdue
          checkStatus = "overdue";
          overdueChecks++;

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
          });

          criticalAlerts.push({
            vehicleId,
            vehicleName,
            issue: "Overdue Maintenance",
            dueDate: dueDate,
            severity: "high",
          });
        }

        upcomingMaintenance.push({
          vehicleId,
          vehicleName,
          type: vehicleType,
          checkType: taskDescription,
          dueDate: dueDate,
          assignedTo: doer,
          status: checkStatus,
        });
      }

      // Count under maintenance based on Column J value
      if (
        underMaintenanceValue &&
        underMaintenanceValue.toString().trim() !== ""
      ) {
        underMaintenanceCount++;

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
        });
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
        });
      }

      const vehicle = vehicleMap.get(vehicleId);
      vehicle.totalChecks++;

      if (checkStatus === "completed") {
        vehicle.completedChecks++;
        vehicle.lastCheckDate = actualDate;
      } else if (checkStatus === "overdue") {
        vehicle.overdueChecks++;
        vehicle.criticalIssues++;
      } else if (checkStatus === "pending") {
        vehicle.pendingChecks++;
      }
    });

    // Calculate vehicle statistics
    const allVehicles = Array.from(vehicleMap.values()).map((vehicle) => {
      vehicle.efficiency =
        vehicle.totalChecks > 0
          ? Math.round((vehicle.completedChecks / vehicle.totalChecks) * 100)
          : 0;

      if (vehicle.criticalIssues > 0) {
        vehicle.status = "critical";
      } else if (vehicle.overdueChecks > 0) {
        vehicle.status = "overdue";
      } else if (vehicle.pendingChecks > 0) {
        vehicle.status = "maintenance";
      } else {
        vehicle.status = "operational";
      }

      return vehicle;
    });

    // Filter vehicles by selected type and vehicle ID
    let filteredVehicles =
      selectedVehicleType === "all"
        ? allVehicles
        : allVehicles.filter((v) => v.type === selectedVehicleType);

    if (selectedVehicleId !== "all") {
      filteredVehicles = filteredVehicles.filter(
        (v) => v.name === selectedVehicleId
      );
    }

    // Calculate type statistics
    const typeStats = {
      cars: { count: 0, operational: 0, maintenance: 0 },
      trucks: { count: 0, operational: 0, maintenance: 0 },
      bikes: { count: 0, operational: 0, maintenance: 0 },
      buses: { count: 0, operational: 0, maintenance: 0 },
    };

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
          : null;
      if (type) {
        typeStats[type].count++;
        if (vehicle.status === "operational") {
          typeStats[type].operational++;
        } else {
          typeStats[type].maintenance++;
        }
      }
    });

    const maintenanceEfficiency =
      totalFleet > 0 ? Math.round((completedChecks / totalFleet) * 100) : 0;

    // Auto-detect if we should use compact format based on data size
    const shouldUseCompactFormat =
      completedTasks.length > 50 ||
      pendingTasksData.length > 50 ||
      overdueTasksData.length > 50 ||
      underMaintenanceTasks.length > 50;

    setVehicleData({
      vehicles: filteredVehicles,
      allVehicles: allVehicles,
      maintenanceStats: {
        totalVehicles: totalFleet,
        activeVehicles: filteredVehicles.filter(
          (v) => v.status === "operational"
        ).length,
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
    });

    // Set compact format if data is large
    if (shouldUseCompactFormat) {
      setTableFormat("compact");
    }
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
  }
};

  useEffect(() => {
    fetchVehicleData();
  }, [selectedVehicleType, selectedVehicleId]);

  // Get current vehicle type config
  const currentVehicleType =
    vehicleTypes.find((type) => type.value === selectedVehicleType) ||
    vehicleTypes[0];

  // Get available vehicles for dropdown
  const availableVehicles = vehicleData.allVehicles || [];

  // Vehicle Status Card Component with click handler
  const VehicleStatusCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    borderColor,
    subtitle,
    onClick,
  }) => (
    <div
      className={`rounded-lg border-l-4 ${borderColor} shadow-md hover:shadow-lg transition-all bg-white ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`flex flex-row items-center justify-between space-y-0 pb-2 ${bgColor} rounded-tr-lg p-4`}
      >
        <h3 className={`text-sm font-medium ${color.replace("bg-", "text-")}`}>
          {title}
        </h3>
        <Icon className={`h-5 w-5 ${color.replace("bg-", "text-")}`} />
      </div>
      <div className="p-4">
        <div className={`text-3xl font-bold ${color.replace("bg-", "text-")}`}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  // Render table cell based on format
  const renderTableCell = (content, isHeader = false, className = "") => {
    if (tableFormat === "compact") {
      return (
        <td
          className={`px-2 py-1 text-xs ${
            isHeader ? "font-medium" : ""
          } ${className}`}
        >
          {content}
        </td>
      );
    }
    return (
      <td className={`px-6 py-4 ${isHeader ? "font-medium" : ""} ${className}`}>
        {content}
      </td>
    );
  };

  // Render table row based on format
  const renderTableRow = (cells, key, className = "") => {
    if (tableFormat === "compact") {
      return (
        <tr key={key} className={`text-xs hover:bg-gray-50 ${className}`}>
          {cells}
        </tr>
      );
    }
    return (
      <tr key={key} className={`hover:bg-gray-50 ${className}`}>
        {cells}
      </tr>
    );
  };

  // Modal Component for showing task details
  const TaskModal = ({ isOpen, onClose, title, tasks, type }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-blue-700">{title}</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  setTableFormat(
                    tableFormat === "normal" ? "compact" : "normal"
                  )
                }
                className="text-xs px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {tableFormat === "normal" ? "Compact View" : "Normal View"}
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
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
                <table
                  className={`min-w-full divide-y divide-gray-200 ${
                    tableFormat === "compact" ? "text-xs" : ""
                  }`}
                >
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
      "header-pending"
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
      "header-completed"
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
      "header-maintenance"
    )
  : renderTableRow(
      [
        renderTableCell("Task ID", true, "text-left"),
        renderTableCell("Doer Name", true, "text-left"),
        renderTableCell("Task Description", true, "text-left"),
        renderTableCell("Task Start Date", true, "text-left"),
        renderTableCell("Freq", true, "text-left"),
      ],
      "header-other"
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
                                  tableFormat === "compact"
                                    ? "max-w-[100px] truncate"
                                    : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>
                            ),
                            renderTableCell(task.frequency),
                            renderTableCell(task.checkedBy || "N/A"),
                            renderTableCell(task.completionDate),
                            renderTableCell(task.okStatus),
                          ],
                          `completed-${index}`
                        );
                      } else if (type === "overdue") {
                        return renderTableRow(
                          [
                            renderTableCell(task.id),
                            renderTableCell(task.assignedTo),
                            renderTableCell(
                              <div
                                className={`${
                                  tableFormat === "compact"
                                    ? "max-w-[100px] truncate"
                                    : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>
                            ),
                            renderTableCell(task.taskStartDate),
                            renderTableCell(task.frequency),
                          ],
                          `overdue-${index}`
                        );
                      }
                        // For pending tasks
else if (type === "pending") {
  return renderTableRow(
    [
      renderTableCell(task.id),
      renderTableCell(
        <div
          className={`${
            tableFormat === "compact"
              ? "max-w-[100px] truncate"
              : "max-w-xs truncate"
          }`}
          title={task.taskDescription}
        >
          {task.taskDescription}
        </div>
      ),
      renderTableCell(task.assignedTo),
      renderTableCell(task.taskStartDate),
      renderTableCell(
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      ),
    ],
    `pending-${index}`
  );
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
            tableFormat === "compact"
              ? "max-w-[100px] truncate"
              : "max-w-xs truncate"
          }`}
          title={task.taskDescription}
        >
          {task.taskDescription}
        </div>
      ),
      renderTableCell(task.assignedTo),
      renderTableCell(task.maintenanceDetails || "N/A"),
      renderTableCell(
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Under Maintenance
        </span>
      ),
    ],
    `maintenance-${index}`
  );
}
                      else {
                        const VehicleIcon =
                          vehicleTypes.find((t) => t.value === task.vehicleType)
                            ?.icon || Car;
                        return renderTableRow(
                          [
                            renderTableCell(task.id),
                            renderTableCell(task.vehicleName),
                            renderTableCell(
                              <div
                                className={`${
                                  tableFormat === "compact"
                                    ? "max-w-[100px] truncate"
                                    : "max-w-xs truncate"
                                }`}
                                title={task.taskDescription}
                              >
                                {task.taskDescription}
                              </div>
                            ),
                            renderTableCell(
                              <div className="flex items-center space-x-2">
                                <VehicleIcon className="h-4 w-4" />
                                <span className="capitalize">
                                  {task.vehicleType}
                                </span>
                              </div>
                            ),
                            renderTableCell(task.assignedTo),
                            renderTableCell(
                              type === "completed"
                                ? task.completionDate
                                : type === "maintenance"
                                ? task.maintenanceDetails || "Under maintenance"
                                : task.taskStartDate
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
                              </span>
                            ),
                          ],
                          `${type}-${index}`
                        );
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
    );
  };

  // Vehicle Type Overview Component
  const VehicleTypeOverview = () => {
    const typeData = Object.entries(vehicleData.vehicleTypes).map(
      ([type, data]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        operational: data.operational,
        maintenance: data.maintenance,
        total: data.count,
      })
    );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={typeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" fontSize={12} stroke="#888888" />
          <YAxis fontSize={12} stroke="#888888" />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="operational"
            stackId="a"
            fill="#22c55e"
            name="Operational"
          />
          <Bar
            dataKey="maintenance"
            stackId="a"
            fill="#f59e0b"
            name="Under Maintenance"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-3">
            {React.createElement(currentVehicleType.icon, {
              className: `h-8 w-8 ${currentVehicleType.color.replace(
                "bg-",
                "text-"
              )}`,
            })}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Vehicle Fleet Management
            </h1>
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
        .filter(
          (vehicle) =>
            selectedVehicleType === "all" || vehicle.type === selectedVehicleType
        )
        .map((vehicle) => vehicle.name)
    )
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
                  <h3 className="text-blue-700 font-medium">
                    Fleet Status by Type
                  </h3>
                  <p className="text-blue-600 text-sm">
                    Operational vs Under Maintenance
                  </p>
                </div>
                <div className="p-4">
                  <VehicleTypeOverview />
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
                            <p className="font-medium text-red-900">
                              {alert.vehicleName}
                            </p>
                            <p className="text-sm text-red-700">
                              {alert.issue}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-900">
                            Due: {alert.dueDate}
                          </p>
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
  );
}
