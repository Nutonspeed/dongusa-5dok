"use client"

import type React from "react"

import { useState } from "react"
import { Calculator, MessageCircle } from "lucide-react"

export default function CustomCoversPage() {
  const [measurements, setMeasurements] = useState({
    sofaType: "",
    width: "",
    depth: "",
    height: "",
    armHeight: "",
    backHeight: "",
    additionalNotes: "",
  })

  const [selectedFabric, setSelectedFabric] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  const sofaTypes = [
    { value: "single", label: "Single Seat / Armchair", basePrice: 89 },
    { value: "loveseat", label: "2-Seat Loveseat", basePrice: 129 },
    { value: "sofa", label: "3-Seat Sofa", basePrice: 149 },
    { value: "sectional-small", label: "Small Sectional", basePrice: 199 },
    { value: "sectional-large", label: "Large Sectional", basePrice: 249 },
    { value: "recliner", label: "Recliner", basePrice: 99 },
    { value: "chaise", label: "Chaise Lounge", basePrice: 119 },
  ]

  const fabricTypes = [
    { value: "cotton", label: "Cotton Blend", multiplier: 1.0 },
    { value: "linen", label: "Linen", multiplier: 1.2 },
    { value: "velvet", label: "Velvet", multiplier: 1.5 },
    { value: "leather-look", label: "Faux Leather", multiplier: 1.3 },
    { value: "performance", label: "Performance Fabric", multiplier: 1.4 },
    { value: "outdoor", label: "Outdoor Fabric", multiplier: 1.6 },
  ]

  const calculatePrice = () => {
    const sofaType = sofaTypes.find((type) => type.value === measurements.sofaType)
    const fabric = fabricTypes.find((type) => type.value === selectedFabric)

    if (sofaType && fabric) {
      let price = sofaType.basePrice * fabric.multiplier

      // Add complexity based on measurements
      const width = Number.parseFloat(measurements.width) || 0
      const depth = Number.parseFloat(measurements.depth) || 0

      if (width > 90 || depth > 40) {
        price *= 1.2 // 20% surcharge for oversized
      }

      setEstimatedPrice(Math.round(price))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const orderDetails = `
Custom Sofa Cover Order Request:

Sofa Type: ${sofaTypes.find((type) => type.value === measurements.sofaType)?.label}
Fabric: ${fabricTypes.find((type) => type.value === selectedFabric)?.label}

Measurements:
- Width: ${measurements.width} inches
- Depth: ${measurements.depth} inches  
- Height: ${measurements.height} inches
- Arm Height: ${measurements.armHeight} inches
- Back Height: ${measurements.backHeight} inches

Additional Notes: ${measurements.additionalNotes}

Estimated Price: $${estimatedPrice}

Please provide a detailed quote and timeline for this custom order.
    `

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(orderDetails)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Custom Sofa Covers</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get a perfectly fitted cover made specifically for your furniture. Fill out the form below to get your
            custom quote.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Measurement Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-blue-600" />
              Measurements & Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sofa Type *</label>
                <select
                  value={measurements.sofaType}
                  onChange={(e) => {
                    setMeasurements({ ...measurements, sofaType: e.target.value })
                    calculatePrice()
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your sofa type</option>
                  {sofaTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} (from ${type.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Type *</label>
                <select
                  value={selectedFabric}
                  onChange={(e) => {
                    setSelectedFabric(e.target.value)
                    calculatePrice()
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select fabric type</option>
                  {fabricTypes.map((fabric) => (
                    <option key={fabric.value} value={fabric.value}>
                      {fabric.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width (inches) *</label>
                  <input
                    type="number"
                    value={measurements.width}
                    onChange={(e) => {
                      setMeasurements({ ...measurements, width: e.target.value })
                      calculatePrice()
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 84"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depth (inches) *</label>
                  <input
                    type="number"
                    value={measurements.depth}
                    onChange={(e) => {
                      setMeasurements({ ...measurements, depth: e.target.value })
                      calculatePrice()
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 36"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Height (inches)</label>
                  <input
                    type="number"
                    value={measurements.height}
                    onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arm Height (inches)</label>
                  <input
                    type="number"
                    value={measurements.armHeight}
                    onChange={(e) => setMeasurements({ ...measurements, armHeight: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Back Height (inches)</label>
                  <input
                    type="number"
                    value={measurements.backHeight}
                    onChange={(e) => setMeasurements({ ...measurements, backHeight: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 32"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={measurements.additionalNotes}
                  onChange={(e) => setMeasurements({ ...measurements, additionalNotes: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements, unusual features, or questions..."
                />
              </div>

              {estimatedPrice > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Estimated Price: ${estimatedPrice}</h3>
                  <p className="text-blue-700 text-sm">
                    This is a preliminary estimate. Final pricing will be confirmed after reviewing your specifications.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={!measurements.sofaType || !selectedFabric}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Quote via Facebook
              </button>
            </form>
          </div>

          {/* Measurement Guide */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Measure Your Sofa</h2>

              <div className="space-y-6">
                <div>
                  <img
                    src="/placeholder.svg?height=300&width=400"
                    alt="Sofa measurement guide"
                    className="w-full rounded-lg mb-4"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Width</h3>
                    <p className="text-gray-600">
                      Measure from the outside of one arm to the outside of the other arm.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Depth</h3>
                    <p className="text-gray-600">Measure from the front edge of the seat to the back of the sofa.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Height</h3>
                    <p className="text-gray-600">Measure from the floor to the highest point of the back.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Need Help Measuring?</h3>
              <p className="text-green-700 mb-4">
                Our team can guide you through the measurement process via video call or provide detailed instructions.
              </p>
              <button
                onClick={() => {
                  const message = "Hi! I need help measuring my sofa for a custom cover. Can someone assist me?"
                  const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                  window.open(facebookUrl, "_blank")
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Measurement Help
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What's Included</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Perfect fit guarantee
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Premium fabric of your choice
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Professional construction
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Easy installation instructions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  7-10 business day turnaround
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Free shipping on orders over $100
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
