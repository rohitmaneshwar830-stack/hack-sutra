/**
 * Utility functions for shared styles across the frontend.
 */

export const getStatusStyle = (status) => {
  switch (status) {
    case 'Verified':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Action Taken':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Resolved':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'Under Review':
    case 'Pending':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'; // updated to match unified colors
  }
};

export const getRiskStyle = (risk) => {
  switch (risk?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'ALERT':
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'GOOD':
    case 'OPTIMAL':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getAlertStyle = (severity) => {
  if (severity === 'Critical') return 'border-l-alert-red bg-red-50/20';
  if (severity === 'Warning') return 'border-l-accent bg-orange-50/20';
  return 'border-l-safe-green bg-green-50/20';
};
