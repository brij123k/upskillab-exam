
// const API_BASE_URL ="https://exam-api.upskillab.com";
const API_BASE_URL ="http://localhost:3000";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,

  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },

  USERS: {
    REGISTER:"/public/registrations",
    LOGIN:"request-otp",
    VARIFYOTP:"verify-otp",
  },
  DOMAINS: {
    DOMAINS: "/domains/active/public",
    BY_ID: (id) => `/domains/${id}`,
  },
  EXAMS:{
    STARTEXAM:"/public/exams/start",
    SAVEANSWER:(quesitionId)=> `/exam-answers/public/${quesitionId}`,
    SUBMITANSWER:"/exam-answers/submit/public",
    SWICHSCREENDATA:(attemptId)=>`public/exam-attempts/${attemptId}/screen-switch`,
    SUBMITEXPIRE:(attemptId)=>`public/exam-attempts/${attemptId}/submit`,
  },
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id) => `/products/${id}`,
  },
};
