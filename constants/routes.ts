export const ROUTES = {
  // Auth Group
  WELCOME: '/(auth)/welcome',
  USER_LOGIN: '/(auth)/user-login',
  USER_REGISTER: '/(auth)/user-register',
  PENDING_VERIFICATION: '/(auth)/pending-verification',
  VERIFICATION_SUCCESS: '/(auth)/verification-success',
  ADMIN_LOGIN: '/(auth)/admin-login',

  // User Main Tab Group
  HOME: '/(user)/home',
  RESOURCES: '/(user)/resources',
  COMMUNITY: '/(user)/community',
  EVENTS: '/(user)/events',
  NOTIFICATIONS: '/(user)/notifications',
  PROFILE: '/(user)/profile',

  // User Phase 3B Resource & Request Stack Routes
  RESOURCE_DETAILS: '/(user)/resource-details',
  SHARE_RESOURCE: '/(user)/share-resource',
  MY_RESOURCES: '/(user)/my-resources',
  EDIT_RESOURCE: '/(user)/edit-resource',
  MY_RESOURCE_REQUESTS: '/(user)/my-resource-requests',
  RECEIVED_REQUESTS: '/(user)/received-requests',
  REQUEST_DETAILS: '/(user)/request-details',
  CONTACT_OWNER: '/(user)/contact-owner',

  // User Phase 4 Community & Feed Stack Routes
  CREATE_POST: '/(user)/create-post',
  POST_DETAILS: '/(user)/post-details',
  EDIT_POST: '/(user)/edit-post',
  MY_POSTS: '/(user)/my-posts',
  COMMUNITY_INFO: '/(user)/community-information',
  ANNOUNCEMENTS: '/(user)/announcements',

  // User Phase 5 Event & Problem Stack Routes
  EVENT_DETAILS: '/(user)/event-details',
  JOINED_EVENTS: '/(user)/joined-events',
  REPORT_PROBLEM: '/(user)/report-problem',
  MY_PROBLEMS: '/(user)/my-problems',
  PROBLEM_DETAILS: '/(user)/problem-details',

  // User Phase 6 Profile & Settings Stack Routes
  EDIT_PROFILE: '/(user)/edit-profile',
  SETTINGS: '/(user)/settings',

  // Admin Group Main Tabs
  ADMIN_DASHBOARD: '/(admin)/dashboard',
  ADMIN_USERS: '/(admin)/users',
  ADMIN_RESOURCES: '/(admin)/resources',
  ADMIN_POSTS: '/(admin)/posts',
  ADMIN_EVENTS: '/(admin)/events',
  ADMIN_PROBLEMS: '/(admin)/problems',
  ADMIN_ANALYTICS: '/(admin)/analytics',
  ADMIN_PROFILE: '/(admin)/profile',

  // Admin Stack Sub-routes
  ADMIN_USER_VERIFICATION: '/(admin)/user-verification',
  ADMIN_MEMBER_PROFILE: '/(admin)/member-profile',
  ADMIN_RESOURCE_DETAILS: '/(admin)/resource-details',
  ADMIN_POST_DETAILS: '/(admin)/post-details',
  ADMIN_CREATE_ANNOUNCEMENT: '/(admin)/create-announcement',
  ADMIN_CREATE_EVENT: '/(admin)/create-event',
  ADMIN_EDIT_EVENT: '/(admin)/edit-event',
  ADMIN_PROBLEM_DETAILS: '/(admin)/problem-details',
} as const;
