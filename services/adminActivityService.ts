export interface AdminActivityLog {
  id: string;
  action: string;
  description: string;
  adminName: string;
  timestamp: string;
  type: 'user' | 'resource' | 'post' | 'event' | 'problem' | 'general';
}

const INITIAL_LOGS: AdminActivityLog[] = [
  {
    id: 'log-1',
    action: 'Member Approved',
    description: 'Eleanor Vance approved Sarah Jenkins for Greenwood Sector 4.',
    adminName: 'Eleanor Vance',
    timestamp: '2026-10-05T09:00:00Z',
    type: 'user',
  },
  {
    id: 'log-2',
    action: 'Announcement Published',
    description: 'Published announcement regarding water supply maintenance.',
    adminName: 'Eleanor Vance',
    timestamp: '2026-10-04T16:30:00Z',
    type: 'post',
  },
  {
    id: 'log-3',
    action: 'Problem Under Review',
    description: 'Updated status of Water Leakage Near Block B to Under Review.',
    adminName: 'Eleanor Vance',
    timestamp: '2026-10-04T10:00:00Z',
    type: 'problem',
  },
  {
    id: 'log-4',
    action: 'Event Scheduled',
    description: 'Created Community Clean-Up Drive for Oct 15.',
    adminName: 'Eleanor Vance',
    timestamp: '2026-10-01T09:00:00Z',
    type: 'event',
  },
];

let mockLogs: AdminActivityLog[] = [...INITIAL_LOGS];

export const adminActivityService = {
  async getLogs(): Promise<AdminActivityLog[]> {
    return [...mockLogs];
  },

  async logActivity(
    action: string,
    description: string,
    type: AdminActivityLog['type'],
    adminName: string = 'Admin'
  ): Promise<AdminActivityLog> {
    const newLog: AdminActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      description,
      adminName,
      timestamp: new Date().toISOString(),
      type,
    };
    mockLogs.unshift(newLog);
    return { ...newLog };
  },
};
