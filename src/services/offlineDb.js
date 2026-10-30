import Dexie from 'dexie';

export const offlineDb = new Dexie('DisruptionIQOfflineDB');

offlineDb.version(1).stores({
  fieldReports: '++id, client_event_id, report_type, sync_status, created_at',
  cachedDisruptions: 'id, code, severity, status',
  cachedInventory: 'id, warehouse_id, product_sku',
});

export async function saveLocalFieldReport(report) {
  const eventId = report.client_event_id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const record = {
    ...report,
    client_event_id: eventId,
    sync_status: 'PENDING_SYNC',
    created_at: new Date().toISOString(),
  };
  const id = await offlineDb.fieldReports.add(record);
  return { ...record, id };
}

export async function getLocalFieldReports() {
  return await offlineDb.fieldReports.orderBy('created_at').reverse().toArray();
}

export async function markReportSynced(id, serverResponse) {
  return await offlineDb.fieldReports.update(id, {
    sync_status: 'SYNCED',
    server_id: serverResponse?.id,
    synced_at: new Date().toISOString(),
  });
}

export async function markReportFailed(id, errorMessage) {
  return await offlineDb.fieldReports.update(id, {
    sync_status: 'FAILED',
    sync_error: errorMessage,
    failed_at: new Date().toISOString(),
  });
}
