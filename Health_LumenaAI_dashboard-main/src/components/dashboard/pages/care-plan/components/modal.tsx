import { X } from 'lucide-react';

interface CarePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CarePlanModal = ({ isOpen, onClose }: CarePlanModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Daily Living Support Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Comprehensive support plan focusing on daily activities and independence.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Patient</span>
                  <span className="font-medium text-gray-900">John Smith</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">Weekly</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">8 weeks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium text-gray-900">1/15/2025</span>
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Days of Week</span>
                  <span className="font-medium text-gray-900">MON, WED, FRI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shifts</span>
                  <span className="font-medium text-gray-900">Morning, Evening</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Goals and Activities */}
          <div className="space-y-6">
            {/* Service Categories */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Service Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Personal Care', 'Community Access'].map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Care Goals */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Care Goals</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Increase independence</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Improve social engagement</span>
                </li>
              </ul>
            </div>

            {/* Support Activities */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Support Activities</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Personal Care',
                  'Community Access',
                  'Exercise',
                  'Meal Preparation'
                ].map((activity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Edit Plan
          </button>
          <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Approve Plan
          </button>
          <button className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};