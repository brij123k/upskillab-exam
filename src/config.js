// Central place for values that are still pending confirmation or will be replaced later.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const UPSKILLAB_URL = 'https://upskillab.com/';

// Seconds to wait on the thank-you page before redirecting.
export const REDIRECT_DELAY = 8;

// TODO: replace with the domains API once available.
export const DOMAINS = [
  { id: '6acbbb09c484998ad3a1d97b', name: 'Psychometric Assessment' },
];

export const INSTITUTE_NAME = 'Ashoka Institute of Technology & Management, Varanasi';

export const VERTICALS = ['Technology', 'Management', 'Pharmacy', 'Other'];

export const COURSES = ['B.Tech', 'Diploma', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Pharm', 'D.Pharm', 'Other'];

export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical',
  'Mechanical',
  'Civil',
  'Not applicable',
  'Other',
];

export const COURSE_YEARS = [1, 2, 3, 4, 5];
