"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import AdminLayout from "../../components/layout/AdminLayout"

// Calendar Component (same as before)
const CalendarComponent = ({ date, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selectedDate)
    onClose()
  }

  const renderDays = () => {
    const days = []
    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth())

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        date &&
        date.getDate() === day &&
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
            isSelected ? "bg-purple-600 text-white" : "hover:bg-purple-100 text-gray-700"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <div className="p-2 bg-white border border-gray-200 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-2">
        <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
          &lt;
        </button>
        <div className="text-sm font-medium">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </div>
        <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  )
}

// Helper functions for date manipulation
const addDays = (date, days) => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

const addMonths = (date, months) => {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}

const addYears = (date, years) => {
  const newDate = new Date(date)
  newDate.setFullYear(newDate.getFullYear() + years)
  return newDate
}

export default function VehicleChecklistAssignment() {
  const [date, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState("09:00")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(false)

  // Simplified state for vehicle checklist
  const [doerOptions, setDoerOptions] = useState([])

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ]

  const [formData, setFormData] = useState({
    taskDescription: "",
    doer: "",
    frequency: "daily",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Fetch doer options from master sheet
  const fetchDoerOptions = async () => {
    try {
      const APPS_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbypYVWE9dVvRsFBoOyJurc3i3ksZ3vd9y-QietOEEZfC8ezi5VlJb1F4jmJ1_v_agrThA/exec"
      const masterSheetName = "master"
      const url = `${APPS_SCRIPT_URL}?sheet=${masterSheetName}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch master data: ${response.status}`)
      }
      const data = await response.json()

      const doers = []
      let rows = []
      if (Array.isArray(data)) {
        rows = data
      } else if (data.table && data.table.rows) {
        rows = data.table.rows
      }

      rows.forEach((row, index) => {
        if (
          index === 0 &&
          ((Array.isArray(row) && row[0] === "Department") || (row.c && row.c[0] && row.c[0].v === "Department"))
        ) {
          return
        }

        if (Array.isArray(row)) {
          if (row[2] && row[2].toString().trim() !== "") {
            doers.push(row[2].toString().trim())
          }
        } else if (row.c) {
          if (row.c && row.c[2] && row.c[2].v) {
            const value = row.c[2].v.toString().trim()
            if (value !== "") {
              doers.push(value)
            }
          }
        }
      })

      setDoerOptions([...new Set(doers)].sort())
    } catch (error) {
      console.error("Error fetching doer options:", error)
      setDoerOptions(["Doer 1", "Doer 2"])
    }
  }

  const getFormattedDate = (date) => {
    if (!date) return "Select a date"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTimeToSubmit = (date, time) => {
    if (!date || !time) return ""

    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, "0")
    const month = (d.getMonth() + 1).toString().padStart(2, "0")
    const year = d.getFullYear()

    const [hours, minutes] = time.split(":")
    const seconds = "00"

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, "0")
    const month = (d.getMonth() + 1).toString().padStart(2, "0")
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    fetchDoerOptions()
  }, [])

  const getLastTaskId = async (sheetName) => {
    try {
      const APPS_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbypYVWE9dVvRsFBoOyJurc3i3ksZ3vd9y-QietOEEZfC8ezi5VlJb1F4jmJ1_v_agrThA/exec"
      const url = `${APPS_SCRIPT_URL}?sheet=${sheetName}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet data: ${response.status}`)
      }
      const text = await response.text()
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}")
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)
      if (!data.table || !data.table.rows.length === 0) {
        return 0
      }
      let lastTaskId = 0
      data.table.rows.forEach((row) => {
        if (row.c && row.c[1] && row.c[1].v) {
          const taskId = Number.parseInt(row.c[1].v)
          if (!isNaN(taskId) && taskId > lastTaskId) {
            lastTaskId = taskId
          }
        }
      })
      return lastTaskId
    } catch (error) {
      console.error("Error fetching last task ID:", error)
      return 0
    }
  }

  const fetchWorkingDays = async () => {
    try {
      const sheetId = "15gXZwRrSOVA0vVbb__EdDoq554kYO50yiWnyteGrHJ0";
      const sheetName = "Working Day Calendar";

      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        sheetName
      )}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch working days: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);

      if (!data.table || !data.table.rows) {
        console.log("No working day data found");
        return [];
      }

      // Extract dates from column A
      const workingDays = [];
      data.table.rows.forEach((row) => {
        if (row.c && row.c[0] && row.c[0].v) {
          let dateValue = row.c[0].v;

          // Handle Google Sheets Date(year,month,day) format
          if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
            const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateValue);
            if (match) {
              const year = parseInt(match[1], 10);
              const month = parseInt(match[2], 10); // 0-indexed in Google's format
              const dateDay = parseInt(match[3], 10);

              dateValue = `${dateDay.toString().padStart(2, "0")}/${(month + 1)
                .toString()
                .padStart(2, "0")}/${year}`;
            }
          } else if (dateValue instanceof Date) {
            // If it's a Date object
            dateValue = formatDateToDDMMYYYY(dateValue);
          }

          if (
            typeof dateValue === "string" &&
            dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/) // DD/MM/YYYY pattern
          ) {
            workingDays.push(dateValue);
          }
        }
      });

      console.log(`Fetched ${workingDays.length} working days`);
      return workingDays;
    } catch (error) {
      console.error("Error fetching working days:", error);
      return []; // Return empty array if fetch fails
    }
  };

  const findNextWorkingDay = (date, workingDays, usedWorkingDays) => {
    const formattedDate = formatDateToDDMMYYYY(date)

    if (workingDays.includes(formattedDate) && !usedWorkingDays.includes(formattedDate)) {
      usedWorkingDays.push(formattedDate)
      return date
    }

    let nextDate = new Date(date)
    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      nextDate = addDays(nextDate, 1)
      const nextDateFormatted = formatDateToDDMMYYYY(nextDate)

      if (workingDays.includes(nextDateFormatted) && !usedWorkingDays.includes(nextDateFormatted)) {
        usedWorkingDays.push(nextDateFormatted)
        return nextDate
      }

      attempts++
    }

    return date
  }

  const generateTasks = async () => {
    if (!date || !formData.doer || !formData.taskDescription || !formData.frequency) {
      alert("Please fill in all required fields.")
      return
    }

    const workingDays = await fetchWorkingDays()
    console.log(`Using ${workingDays.length} working days for task generation`)

    const tasks = []
    const startDate = new Date(date)
    const lastWorkingDay =
      workingDays.length > 0
        ? new Date(workingDays[workingDays.length - 1].split("/").reverse().join("-"))
        : addYears(startDate, 2)
    const endDate = workingDays.length > 0 ? lastWorkingDay : addYears(startDate, 2)

    let currentDate = new Date(startDate)
    const usedWorkingDays = []

    // Generate tasks based on frequency
    while (currentDate <= endDate) {
      const taskDate =
        workingDays.length > 0 ? findNextWorkingDay(currentDate, workingDays, usedWorkingDays) : currentDate

      if (taskDate > endDate) break

      const formattedTaskDate = formatDateTimeToSubmit(taskDate, selectedTime)
      if (!tasks.some((task) => task.dueDate === formattedTaskDate)) {
        tasks.push({
          title: "Vehicle Checklist",
          description: formData.taskDescription,
          department: "Vehicle Management",
          givenBy: "System",
          doer: formData.doer,
          dueDate: formattedTaskDate,
          status: "pending",
          frequency: formData.frequency,
          enableReminders: true,
          requireAttachment: false,
        })
      }

      // Date increment based on frequency
      switch (formData.frequency) {
        case "daily":
          currentDate = addDays(currentDate, 1)
          break
        case "weekly":
          currentDate = addDays(currentDate, 7)
          break
        case "monthly":
          currentDate = addMonths(currentDate, 1)
          break
        case "quarterly":
          currentDate = addMonths(currentDate, 3)
          break
        case "yearly":
          currentDate = addYears(currentDate, 1)
          break
        default:
          currentDate = addDays(currentDate, 1)
      }
    }

    if (tasks.length === 0) {
      alert("No tasks were generated. Please check your date selection.")
      return
    }

    setGeneratedTasks(tasks)
    setAccordionOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (generatedTasks.length === 0) {
        alert("Please generate tasks first by clicking Preview Generated Tasks")
        setIsSubmitting(false)
        return
      }

      const checklistLastId = await getLastTaskId("CHECKLIST")
      const currentDateTime = formatDateTimeToSubmit(new Date(), new Date().toTimeString().slice(0, 5))

      const allTasksData = generatedTasks.map((task, index) => ({
        timestamp: currentDateTime,
        taskId: (checklistLastId + 1 + index).toString(),
        department: task.department,
        givenBy: task.givenBy,
        doer: task.doer,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        frequency: task.frequency,
        enableReminders: task.enableReminders ? "Yes" : "No",
        requireAttachment: task.requireAttachment ? "Yes" : "No",
      }))

      const checklistPayload = new FormData()
      checklistPayload.append("sheetName", "Checklist")
      checklistPayload.append("action", "insert")
      checklistPayload.append("rowData", JSON.stringify(allTasksData))
      checklistPayload.append("batchInsert", "true")

      const checklistResponse = await fetch(
        "https://script.google.com/macros/s/AKfycbypYVWE9dVvRsFBoOyJurc3i3ksZ3vd9y-QietOEEZfC8ezi5VlJb1F4jmJ1_v_agrThA/exec",
        {
          method: "POST",
          body: checklistPayload,
        },
      )

      if (!checklistResponse.ok) {
        throw new Error("Failed to submit to CHECKLIST sheet")
      }

      alert(`Successfully assigned ${generatedTasks.length} vehicle checklist tasks!`)

      // Reset form
      setFormData({
        taskDescription: "",
        doer: "",
        frequency: "daily",
      })
      setSelectedDate(null)
      setSelectedTime("09:00")
      setGeneratedTasks([])
      setAccordionOpen(false)
    } catch (error) {
      console.error("Submission error:", error)
      alert("Failed to assign vehicle checklist tasks. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-purple-600 text-center">
          Vehicle Checklist Assignment
        </h1>
        <div className="rounded-lg border border-purple-200 bg-white shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-purple-100">
              <h2 className="text-xl font-semibold text-purple-700">Vehicle Checklist Details</h2>
              <p className="text-purple-600">Create vehicle checklist tasks for staff members.</p>
            </div>
            <div className="p-8 space-y-6">
              {/* Task Description */}
              <div className="space-y-2">
                <label htmlFor="taskDescription" className="block text-sm font-medium text-purple-700">
                  Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="taskDescription"
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleChange}
                  placeholder="Enter vehicle checklist task description"
                  rows={4}
                  required
                  className="w-full rounded-md border border-purple-200 p-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Doer's Name */}
              <div className="space-y-2">
                <label htmlFor="doer" className="block text-sm font-medium text-purple-700">
                  Doer's Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="doer"
                  name="doer"
                  value={formData.doer}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-purple-200 p-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Doer</option>
                  {doerOptions.map((doer, index) => (
                    <option key={index} value={doer}>
                      {doer}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Frequency */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-700">
                    Task Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full flex justify-start items-center rounded-md border border-purple-200 p-3 text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                      {date ? getFormattedDate(date) : "Select a date"}
                    </button>
                    {showCalendar && (
                      <div className="absolute z-10 mt-1">
                        <CalendarComponent
                          date={date}
                          onChange={setSelectedDate}
                          onClose={() => setShowCalendar(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="frequency" className="block text-sm font-medium text-purple-700">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full rounded-md border border-purple-200 p-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={generateTasks}
                  className="w-full rounded-md border border-purple-200 bg-purple-50 py-3 px-4 text-purple-700 hover:bg-purple-100 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium"
                >
                  Preview Generated Tasks
                </button>

                {generatedTasks.length > 0 && (
                  <div className="w-full">
                    <div className="border border-purple-200 rounded-md">
                      <button
                        type="button"
                        onClick={() => setAccordionOpen(!accordionOpen)}
                        className="w-full flex justify-between items-center p-4 text-purple-700 hover:bg-purple-50 focus:outline-none"
                      >
                        <span className="font-medium">{generatedTasks.length} Tasks Generated</span>
                        <svg
                          className={`w-5 h-5 transition-transform ${accordionOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {accordionOpen && (
                        <div className="p-4 border-t border-purple-200">
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {generatedTasks.slice(0, 20).map((task, index) => (
                              <div key={index} className="text-sm p-3 border rounded-md border-purple-200 bg-purple-50">
                                <div className="font-medium text-purple-700">{task.title}</div>
                                <div className="text-xs text-purple-600 mt-1">Due: {task.dueDate}</div>
                                <div className="text-xs text-purple-600 mt-1">Assigned to: {task.doer}</div>
                              </div>
                            ))}
                            {generatedTasks.length > 20 && (
                              <div className="text-sm text-center text-purple-600 py-2">
                                ...and {generatedTasks.length - 20} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-t border-purple-100">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    taskDescription: "",
                    doer: "",
                    frequency: "daily",
                  })
                  setSelectedDate(null)
                  setSelectedTime("09:00")
                  setGeneratedTasks([])
                  setAccordionOpen(false)
                }}
                className="rounded-md border border-purple-200 py-2 px-6 text-purple-700 hover:border-purple-300 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 py-2 px-6 text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? "Assigning..." : "Assign Vehicle Checklist"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
