"use client"

import { useState, useEffect } from "react"
import { FuelIcon, Plus, Search, Upload, X } from "lucide-react"
import AdminLayout from "../../components/layout/AdminLayout"

export default function Fuel() {
  const [fuelRecords, setFuelRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showFuelForm, setShowFuelForm] = useState(false)
  const [formData, setFormData] = useState({
    vehicleNo: "",
    issueTo: "",
    lastReading: "",
    image: null,
    dateOfFilling: "",
    status: "active",
    fuelType: "petrol",
    qtyInLiter: "",
    rate: "",
    currentKmReading: "",
    fuelBillNo: "",
    billPhoto: null,
    currentKmImage: null,
  })

  // Mock data for fuel records
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        vehicleNo: "MH-12-AB-1234",
        issueTo: "John Doe",
        lastReading: "15,250",
        dateOfFilling: "2024-01-20",
        status: "active",
        fuelType: "petrol",
        qtyInLiter: "45",
        rate: "102.50",
        currentKmReading: "15,295",
        fuelBillNo: "FB001234",
        totalAmount: "4,612.50",
      },
      {
        id: 2,
        vehicleNo: "MH-12-CD-5678",
        issueTo: "Jane Smith",
        lastReading: "28,750",
        dateOfFilling: "2024-01-19",
        status: "active",
        fuelType: "diesel",
        qtyInLiter: "60",
        rate: "89.75",
        currentKmReading: "28,810",
        fuelBillNo: "FB001235",
        totalAmount: "5,385.00",
      },
      {
        id: 3,
        vehicleNo: "MH-12-EF-9012",
        issueTo: "Mike Johnson",
        lastReading: "42,100",
        dateOfFilling: "2024-01-18",
        status: "active",
        fuelType: "petrol",
        qtyInLiter: "40",
        rate: "102.50",
        currentKmReading: "42,140",
        fuelBillNo: "FB001236",
        totalAmount: "4,100.00",
      },
    ]
    setFuelRecords(mockData)
  }, [])

  const handleFormChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }))
  }

  const handleFileUpload = (field, file) => {
    setFormData((prevData) => ({ ...prevData, [field]: file }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Calculate total amount
    const totalAmount = (Number.parseFloat(formData.qtyInLiter) * Number.parseFloat(formData.rate)).toFixed(2)

    const newRecord = {
      id: fuelRecords.length + 1,
      ...formData,
      totalAmount,
    }

    setFuelRecords([newRecord, ...fuelRecords])
    setShowFuelForm(false)

    // Reset form
    setFormData({
      vehicleNo: "",
      issueTo: "",
      lastReading: "",
      image: null,
      dateOfFilling: "",
      status: "active",
      fuelType: "petrol",
      qtyInLiter: "",
      rate: "",
      currentKmReading: "",
      fuelBillNo: "",
      billPhoto: null,
      currentKmImage: null,
    })
  }

  const FuelForm = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Fuel Record</h2>
          <button
            onClick={() => setShowFuelForm(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
              <input
                type="text"
                required
                value={formData.vehicleNo}
                onChange={(e) => handleFormChange("vehicleNo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MH-12-AB-1234"
                autoComplete="off"
              />
            </div>

            {/* Issue To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue To *</label>
              <input
                type="text"
                required
                value={formData.issueTo}
                onChange={(e) => handleFormChange("issueTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Driver name"
                autoComplete="off"
              />
            </div>

            {/* Last Reading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Reading (KM) *</label>
              <input
                type="text"
                required
                value={formData.lastReading}
                onChange={(e) => handleFormChange("lastReading", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15,250"
                autoComplete="off"
              />
            </div>

            {/* Date of Filling */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Filling *</label>
              <input
                type="date"
                required
                value={formData.dateOfFilling}
                onChange={(e) => handleFormChange("dateOfFilling", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
              <select
                required
                value={formData.fuelType}
                onChange={(e) => handleFormChange("fuelType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Quantity in Liter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Liters) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.qtyInLiter}
                onChange={(e) => handleFormChange("qtyInLiter", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="45.00"
                autoComplete="off"
              />
            </div>

            {/* Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Liter *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.rate}
                onChange={(e) => handleFormChange("rate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="102.50"
                autoComplete="off"
              />
            </div>

            {/* Current KM Reading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current KM Reading *</label>
              <input
                type="text"
                required
                value={formData.currentKmReading}
                onChange={(e) => handleFormChange("currentKmReading", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15,295"
                autoComplete="off"
              />
            </div>

            {/* Fuel Bill Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Bill Number *</label>
              <input
                type="text"
                required
                value={formData.fuelBillNo}
                onChange={(e) => handleFormChange("fuelBillNo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="FB001234"
                autoComplete="off"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vehicle Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("image", e.target.files[0])}
                  className="hidden"
                  id="vehicleImage"
                />
                <label htmlFor="vehicleImage" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600 text-center">
                    {formData.image ? formData.image.name : "Upload vehicle image"}
                  </span>
                </label>
              </div>
            </div>

            {/* Bill Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Photo *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("billPhoto", e.target.files[0])}
                  className="hidden"
                  id="billPhoto"
                  required
                />
                <label htmlFor="billPhoto" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600 text-center">
                    {formData.billPhoto ? formData.billPhoto.name : "Upload bill photo"}
                  </span>
                </label>
              </div>
            </div>

            {/* Current KM Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current KM Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("currentKmImage", e.target.files[0])}
                  className="hidden"
                  id="currentKmImage"
                />
                <label htmlFor="currentKmImage" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600 text-center">
                    {formData.currentKmImage ? formData.currentKmImage.name : "Upload KM reading"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowFuelForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Fuel Record
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
            <FuelIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fuel Management</h1>
          </div>
          <button
            onClick={() => setShowFuelForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Fuel Record
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle number or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Fuel Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
            <h3 className="text-blue-700 font-medium">Fuel Records ({fuelRecords.length})</h3>
            <p className="text-blue-600 text-sm">Track fuel consumption and expenses</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity (L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM Reading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fuelRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.vehicleNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.issueTo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.dateOfFilling}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{record.fuelType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.qtyInLiter}L</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{record.rate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{record.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.currentKmReading}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === "active"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fuelRecords.length === 0 && (
            <div className="text-center py-12">
              <FuelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No fuel records</h3>
              <p className="mt-1 text-sm text-gray-500">Start by adding a fuel record.</p>
            </div>
          )}
        </div>

        {/* Fuel Form Modal */}
        {showFuelForm && <FuelForm />}
      </div>
    </AdminLayout>
  )
}
