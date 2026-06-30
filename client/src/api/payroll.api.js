import api from './axios'

export const payrollAPI = {
  getRuns: (params) => api.get('/payroll/runs', { params }),
  getRunById: (id) => api.get(`/payroll/runs/${id}`),
  createRun: (data) => api.post('/payroll/runs', data),
  runPayroll: (id) => id ? api.post(`/payroll/runs/${id}/process`) : api.post('/payroll/runs'),
  approveRun: (id) => api.patch(`/payroll/runs/${id}/approve`),
  getPayslips: (params) => api.get('/payroll/payslips', { params }),
  getPayslipById: (id) => api.get(`/payroll/payslips/${id}`),
  getSalaryStructures: () => api.get('/payroll/salary-structures'),
  createSalaryStructure: (data) => api.post('/payroll/salary-structures', data),
  updateSalaryStructure: (id, data) => api.patch(`/payroll/salary-structures/${id}`, data),
}