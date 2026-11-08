/**
 * Format ISO date string into DD MMM YYYY (e.g. 15 Apr 2026)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format Currency in Indian Rupees (INR)
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Format Time string (e.g. '08:30:00' -> '08:30 AM')
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '09:00 AM';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }
  return timeStr;
};

/**
 * Calculate age in completed years from Date of Birth
 */
export const calculateAge = (dobStr) => {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

/**
 * Map status strings to color schemes
 */
export const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
    case 'published':
    case 'paid':
    case 'pass':
    case 'completed':
      return 'success';
    case 'submitted':
    case 'under_review':
    case 'under review':
    case 'pending':
    case 'draft':
      return 'warning';
    case 'rejected':
    case 'closed':
    case 'fail':
    case 'withdrawn':
      return 'danger';
    case 'withheld':
    case 'waived':
      return 'blue';
    default:
      return 'neutral';
  }
};

