/**
 * Sequential and formatted code generators for government examinations
 */

const generateCandidateNumber = (seq = Math.floor(1000 + Math.random() * 9000)) => {
  const year = new Date().getFullYear();
  return `CND-${year}-${seq}`;
};

const generateApplicationNumber = (seq = Math.floor(1000 + Math.random() * 9000)) => {
  const year = new Date().getFullYear();
  return `APP-${year}-${seq}`;
};

const generateAdmitCardNumber = (seq = Math.floor(1000 + Math.random() * 9000)) => {
  const year = new Date().getFullYear();
  return `AC-${year}-${seq}`;
};

const generateRollNumber = (examCode = 'EXAM', seq = Math.floor(10000 + Math.random() * 90000)) => {
  const cleanedCode = examCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return `ROLL-${cleanedCode}-${seq}`;
};

module.exports = {
  generateCandidateNumber,
  generateApplicationNumber,
  generateAdmitCardNumber,
  generateRollNumber
};

