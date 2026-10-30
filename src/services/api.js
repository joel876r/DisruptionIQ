const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('disruption_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('disruption_token', data.access_token);
    localStorage.setItem('disruption_user', JSON.stringify(data.user));
    localStorage.setItem('disruption_company', JSON.stringify(data.company));
    return data;
  },

  switchDemo: async (email) => {
    const data = await apiRequest(`/auth/demo-switch?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });
    localStorage.setItem('disruption_token', data.access_token);
    localStorage.setItem('disruption_user', JSON.stringify(data.user));
    localStorage.setItem('disruption_company', JSON.stringify(data.company));
    return data;
  },

  getMe: async () => {
    return await apiRequest('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('disruption_token');
    localStorage.removeItem('disruption_user');
    localStorage.removeItem('disruption_company');
  },

  // Dashboard
  getSummary: () => apiRequest('/dashboard/summary'),

  // Disruptions & Impact
  getDisruptions: (statusFilter) => {
    const q = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiRequest(`/disruptions${q}`);
  },

  getImpact: (disruptionId) => apiRequest(`/disruptions/${disruptionId}/impact`),

  getAiBriefing: (disruptionId) => apiRequest(`/disruptions/${disruptionId}/briefing`),

  getRecoveryOptions: (disruptionId) => apiRequest(`/disruptions/${disruptionId}/recovery-options`),

  // Orders & Risk Ranking
  getOrders: (statusFilter) => {
    const q = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiRequest(`/orders${q}`);
  },

  reevaluateOrderRisk: (orderId) => apiRequest(`/orders/${orderId}/evaluate-risk`, { method: 'POST' }),

  // Recovery Plans & Approvals
  getRecoveryPlans: (statusFilter) => {
    const q = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiRequest(`/recovery-plans${q}`);
  },

  requestPlanApproval: (planId) => apiRequest(`/recovery-plans/${planId}/request-approval`, { method: 'POST' }),

  decidePlanApproval: (planId, decision, decisionNotes) =>
    apiRequest(`/recovery-plans/${planId}/approval`, {
      method: 'POST',
      body: JSON.stringify({ decision, decision_notes: decisionNotes }),
    }),

  simulatePlanExecution: (planId, notes) =>
    apiRequest(`/recovery-plans/${planId}/simulate-execution`, {
      method: 'POST',
      body: JSON.stringify({ force_revalidation: true, notes }),
    }),

  getRecoveryOutcomes: () => apiRequest('/recovery-outcomes'),

  // Field Incidents
  submitFieldIncident: (incidentData) =>
    apiRequest('/field-incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    }),

  getFieldIncidents: () => apiRequest('/field-incidents'),

  // Notifications & Audit
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
  getAuditLogs: () => apiRequest('/audit-logs'),

  // Carrier Webhook Simulator
  triggerCarrierWebhook: (payload) =>
    apiRequest('/webhooks/carrier', {
      method: 'POST',
      headers: { 'x-carrier-secret': 'carrier-secure-demo-secret-2026' },
      body: JSON.stringify(payload),
    }),

  // Entities
  getWarehouses: () => apiRequest('/warehouses'),
  getSuppliers: () => apiRequest('/suppliers'),
  getProducts: () => apiRequest('/products'),
  getInventory: () => apiRequest('/inventory'),
  adjustInventory: (inventoryId, payload) =>
    apiRequest(`/inventory/${inventoryId}/adjust`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getShipments: () => apiRequest('/shipments'),

  // CSV Bulk Import
  importCsv: async (entityType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('disruption_token');

    const res = await fetch(`${API_BASE}/import/csv/${entityType}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Import failed');
    }
    return res.json();
  },

  // Reset Demo Data
  resetDemoData: () => apiRequest('/demo/reset', { method: 'POST' }),
  seedBenchmarkData: () => apiRequest('/demo/seed-benchmark', { method: 'POST' }),
};
