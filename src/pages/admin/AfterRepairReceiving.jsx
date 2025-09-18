"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Search, Upload, X, History } from "lucide-react"
import AdminLayout from "../../components/layout/AdminLayout"

export default function AfterRepairReceiving() {
  const [completedRepairs, setCompletedRepairs] = useState([])
  const [processedHistory, setProcessedHistory] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState(null)
  const [activeTab, setActiveTab] = useState("pending") // "pending" or "history"
  const [formData, setFormData] = useState({
    billNo: "",
    billImage: null,
    vendorName: "",
    totalAmount: "",
    advanceAmount: "",
    actualGivenAmount: "",
    pendingAmount: 0,
  })

  // Mock data for completed repairs
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        vehicleNo: "MH-12-AB-1234",
        repairType: "Engine Oil Change",
        description: "Regular engine oil change and filter replacement",
        completedDate: "2024-01-20",
        status: "complete",
        vendor: "ABC Auto Service",
        estimatedCost: "₹2,500",
      },
      {
        id: 2,
        vehicleNo: "MH-12-CD-5678",
        repairType: "Brake Pad Replacement",
        description: "Front brake pads worn out, replaced with new ones",
        completedDate: "2024-01-19",
        status: "complete",
        vendor: "XYZ Motors",
        estimatedCost: "₹4,200",
      },
      {
        id: 3,
        vehicleNo: "MH-12-EF-9012",
        repairType: "AC Service",
        description: "Air conditioning serviced and gas refilled",
        completedDate: "2024-01-18",
        status: "complete",
        vendor: "Cool Air Services",
        estimatedCost: "₹1,800",
      },
    ]
    setCompletedRepairs(mockData)
  }, [])

  const filteredRepairs = completedRepairs.filter(
    (repair) =>
      repair.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.repairType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleProcessClick = (repair) => {
    setSelectedRepair(repair)
    setShowProcessModal(true)
    setFormData({
      billNo: "",
      billImage: null,
      vendorName: repair.vendor,
      totalAmount: "",
      advanceAmount: "",
      actualGivenAmount: "",
      pendingAmount: 0,
    })
  }

  const handleFormChange = (field, value) => {
    setFormData((prevData) => {
      const newFormData = { ...prevData, [field]: value }

      // Calculate pending amount automatically: total - advance - actual given
      if (field === "totalAmount" || field === "advanceAmount" || field === "actualGivenAmount") {
        const total = Number.parseFloat(newFormData.totalAmount) || 0
        const advance = Number.parseFloat(newFormData.advanceAmount) || 0
        const given = Number.parseFloat(newFormData.actualGivenAmount) || 0
        newFormData.pendingAmount = total - advance - given
      }

      return newFormData
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prevData) => ({ ...prevData, billImage: file }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Create history entry
    const historyEntry = {
      id: Date.now(),
      vehicleNo: selectedRepair.vehicleNo,
      repairType: selectedRepair.repairType,
      billNo: formData.billNo,
      vendorName: formData.vendorName,
      totalAmount: Number.parseFloat(formData.totalAmount),
      advanceAmount: Number.parseFloat(formData.advanceAmount) || 0,
      actualGivenAmount: Number.parseFloat(formData.actualGivenAmount),
      pendingAmount: formData.pendingAmount,
      processedDate: new Date().toISOString().split("T")[0],
      billImage: formData.billImage?.name || "bill-image.jpg",
    }

    // Add to history
    setProcessedHistory((prev) => [historyEntry, ...prev])

    // Remove from pending repairs
    setCompletedRepairs((prev) => prev.filter((repair) => repair.id !== selectedRepair.id))

    console.log("Processing repair bill:", formData)
    setShowProcessModal(false)
  }

const ProcessModal = ({ onClose, onSubmit, formData, onFormChange, onFileUpload, selectedRepair }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Process Repair Bill</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Content */}
      <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
        {/* Vehicle Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800">Vehicle: {selectedRepair?.vehicleNo}</h3>
          <p className="text-blue-600 text-sm">{selectedRepair?.repairType}</p>
        </div>

        {/* Bill Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number *</label>
          <input
            type="text"
            required
            value={formData.billNo}
            onChange={(e) => onFormChange("billNo", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter bill number"
            autoComplete="off"
          />
        </div>

        {/* Bill Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bill Image *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              className="hidden"
              id="billImage"
              required
            />
            <label htmlFor="billImage" className="cursor-pointer flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {formData.billImage ? formData.billImage.name : "Click to upload bill image"}
              </span>
            </label>
          </div>
        </div>

        {/* Vendor Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
          <input
            type="text"
            required
            value={formData.vendorName}
            onChange={(e) => onFormChange("vendorName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter vendor name"
            autoComplete="off"
          />
        </div>

        {/* Amount Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.totalAmount}
              onChange={(e) => onFormChange("totalAmount", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.advanceAmount}
              onChange={(e) => onFormChange("advanceAmount", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actual Given Amount *</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.actualGivenAmount}
            onChange={(e) => onFormChange("actualGivenAmount", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            autoComplete="off"
          />
        </div>

        {/* Pending Amount (Auto-calculated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pending Amount</label>
          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
            ₹{formData.pendingAmount.toFixed(2)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Formula: Total Amount - Advance Amount - Actual Given Amount</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Process Bill
          </button>
        </div>
      </form>
    </div>
  </div>
)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">After Repair Receiving</h1>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "pending" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending Processing ({filteredRepairs.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <History className="h-4 w-4 inline mr-1" />
            History ({processedHistory.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle number or repair type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {activeTab === "pending" ? (
          /* Completed Repairs Table */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-4">
              <h3 className="text-green-700 font-medium">Completed Repairs ({filteredRepairs.length})</h3>
              <p className="text-green-600 text-sm">Process bills for completed repairs</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
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
                      Completed Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRepairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleProcessClick(repair)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                        >
                          Process
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {repair.vehicleNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{repair.repairType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{repair.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.completedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{repair.vendor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                          pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRepairs.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No completed repairs</h3>
                <p className="mt-1 text-sm text-gray-500">No repairs are ready for processing.</p>
              </div>
            )}
          </div>
        ) : (
          /* Added History Table */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4">
              <h3 className="text-blue-700 font-medium">Processed Bills History ({processedHistory.length})</h3>
              <p className="text-blue-600 text-sm">View all processed repair bills</p>
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
                      Bill No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Advance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Given Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedHistory.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.vehicleNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.repairType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.billNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.vendorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{entry.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{entry.advanceAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{entry.actualGivenAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.pendingAmount > 0
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}
                        >
                          ₹{entry.pendingAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.processedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {processedHistory.length === 0 && (
              <div className="text-center py-12">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No processed bills</h3>
                <p className="mt-1 text-sm text-gray-500">Processed repair bills will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* Process Modal */}
        {/* {showProcessModal && <ProcessModal />} */}
        {/* Process Modal */}
{showProcessModal && (
  <ProcessModal
    onClose={() => setShowProcessModal(false)}
    onSubmit={handleSubmit}
    formData={formData}
    onFormChange={handleFormChange}
    onFileUpload={handleFileUpload}
    selectedRepair={selectedRepair}
  />
)}
      </div>
    </AdminLayout>
  )
}
