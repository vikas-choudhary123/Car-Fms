"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Search, Filter, Plus, X } from "lucide-react"
import AdminLayout from "../../components/layout/AdminLayout"

export default function ApprovalPending() {
  const [pendingRepairs, setPendingRepairs] = useState([])
  const [completedApprovals, setCompletedApprovals] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("pending")
  const [showIndentForm, setShowIndentForm] = useState(false)
  const [indentFormData, setIndentFormData] = useState({
    vehicleNo: "",
    repairType: "",
    description: "",
    reportedDate: "",
    priority: "medium",
    cost: "",
    fuelRecord: {
      vehicleNo: "",
    },
  })

  // Mock data for pending repairs
  useEffect(() => {
    const mockPendingData = [
      {
        id: 1,
        vehicleNo: "MH-12-AB-1234",
        repairType: "Engine Oil Change",
        description: "Regular engine oil change and filter replacement",
        reportedDate: "2024-01-15",
        status: "pending",
        priority: "medium",
        estimatedCost: "₹2,500",
      },
      {
        id: 2,
        vehicleNo: "MH-12-CD-5678",
        repairType: "Brake Pad Replacement",
        description: "Front brake pads worn out, need immediate replacement",
        reportedDate: "2024-01-14",
        status: "pending",
        priority: "high",
        estimatedCost: "₹4,200",
      },
      {
        id: 3,
        vehicleNo: "MH-12-EF-9012",
        repairType: "AC Service",
        description: "Air conditioning not cooling properly, needs servicing",
        reportedDate: "2024-01-13",
        status: "pending",
        priority: "low",
        estimatedCost: "₹1,800",
      },
      {
        id: 4,
        vehicleNo: "MH-12-GH-3456",
        repairType: "Tire Replacement",
        description: "Rear tire punctured, needs replacement",
        reportedDate: "2024-01-12",
        status: "pending",
        priority: "high",
        estimatedCost: "₹3,500",
      },
    ]

    const mockCompletedData = [
      {
        id: 5,
        vehicleNo: "MH-12-XY-7890",
        repairType: "Battery Replacement",
        description: "Battery dead, replaced with new one",
        reportedDate: "2024-01-10",
        approvedDate: "2024-01-11",
        status: "approved",
        priority: "high",
        estimatedCost: "₹5,500",
      },
      {
        id: 6,
        vehicleNo: "MH-12-PQ-4567",
        repairType: "Clutch Repair",
        description: "Clutch slipping, needs adjustment",
        reportedDate: "2024-01-08",
        approvedDate: "2024-01-09",
        status: "approved",
        priority: "medium",
        estimatedCost: "₹8,200",
      },
    ]

    setPendingRepairs(mockPendingData)
    setCompletedApprovals(mockCompletedData)
  }, [])

  const vehicleOptions = [
    "MH-12-AB-1234",
    "MH-12-CD-5678",
    "MH-12-EF-9012",
    "MH-12-GH-3456",
    "MH-12-XY-7890",
    "MH-12-PQ-4567",
  ]

  const filteredRepairs = pendingRepairs.filter((repair) => {
    const matchesSearch =
      repair.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.repairType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || repair.priority === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredCompletedApprovals = completedApprovals.filter((approval) => {
    const matchesSearch =
      approval.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.repairType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || approval.priority === filterStatus
    return matchesSearch && matchesFilter
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleIndentFormChange = (field, value) => {
    if (field.startsWith("fuelRecord.")) {
      const fuelField = field.split(".")[1]
      setIndentFormData((prevData) => ({
        ...prevData,
        fuelRecord: {
          ...prevData.fuelRecord,
          [fuelField]: value,
        },
      }))
    } else {
      setIndentFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }))
    }
  }

  const handleIndentSubmit = (e) => {
    e.preventDefault()
    console.log("Indent form submitted:", indentFormData)
    // Add logic to save the indent data
    setShowIndentForm(false)
    // Reset form
    setIndentFormData({
      vehicleNo: "",
      repairType: "",
      description: "",
      reportedDate: "",
      priority: "medium",
      cost: "",
      fuelRecord: {
        vehicleNo: "",
      },
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-3">
            {/* <AlertCircle className="h-8 w-8 text-orange-600" /> */}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Approval</h1>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approvals ({filteredRepairs.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Completed History ({filteredCompletedApprovals.length})
            </button>
            <button
              onClick={() => setShowIndentForm(true)}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Indent
            </button>
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle number or repair type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 p-4">
              <h3 className="text-orange-700 font-medium">Repairs Awaiting Approval ({filteredRepairs.length})</h3>
              <p className="text-orange-600 text-sm">Review and approve repair requests</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repair Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Est. Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRepairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {repair.vehicleNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{repair.repairType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{repair.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.reportedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(repair.priority)}`}
                        >
                          {repair.priority.charAt(0).toUpperCase() + repair.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{repair.estimatedCost}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRepairs.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending repairs</h3>
                <p className="mt-1 text-sm text-gray-500">All repair requests have been processed.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 p-4">
              <h3 className="text-green-700 font-medium">Completed Approvals ({filteredCompletedApprovals.length})</h3>
              <p className="text-green-600 text-sm">History of approved repair requests</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repair Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Est. Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompletedApprovals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {approval.vehicleNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{approval.repairType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{approval.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{approval.reportedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{approval.approvedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(approval.priority)}`}
                        >
                          {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{approval.estimatedCost}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                          Approved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCompletedApprovals.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No completed approvals</h3>
                <p className="mt-1 text-sm text-gray-500">No repair requests have been approved yet.</p>
              </div>
            )}
          </div>
        )}

        {showIndentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create New Indent</h2>
                <button onClick={() => setShowIndentForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleIndentSubmit} className="p-6 space-y-6">
                {/* Repair Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Repair Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No. *</label>
                      <input
                        type="text"
                        required
                        value={indentFormData.vehicleNo}
                        onChange={(e) => handleIndentFormChange("vehicleNo", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter vehicle number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repair Type *</label>
                      <input
                        type="text"
                        required
                        value={indentFormData.repairType}
                        onChange={(e) => handleIndentFormChange("repairType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter repair type"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={indentFormData.description}
                      onChange={(e) => handleIndentFormChange("description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the repair needed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date *</label>
                      <input
                        type="date"
                        required
                        value={indentFormData.reportedDate}
                        onChange={(e) => handleIndentFormChange("reportedDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                      <select
                        required
                        value={indentFormData.priority}
                        onChange={(e) => handleIndentFormChange("priority", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={indentFormData.cost}
                        onChange={(e) => handleIndentFormChange("cost", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter estimated cost"
                      />
                    </div>
                  </div>
                </div>

                {/* Fuel Record Section */}
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Fuel Record</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No.</label>
                    <select
                      value={indentFormData.fuelRecord.vehicleNo}
                      onChange={(e) => handleIndentFormChange("fuelRecord.vehicleNo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select vehicle</option>
                      {vehicleOptions.map((vehicle) => (
                        <option key={vehicle} value={vehicle}>
                          {vehicle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowIndentForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Indent
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
