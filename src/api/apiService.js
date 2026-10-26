
import apiClient from "./apiClient";

const apiService = {
  // GET all records
  get: (endpoint, config = {}) =>
    apiClient.get(endpoint, config).then((res) => res.data),

  // GET one record by ID
  getById: (endpoint, id, config = {}) =>
    apiClient.get(`${endpoint}/${id}`, config).then((res) => res.data),

  // POST: create a record
  post: (endpoint, data, config = {}) =>
    apiClient.post(endpoint, data, config).then((res) => res.data),

  // PUT: replace/update a record
  put: (endpoint, data, config = {}) =>
    apiClient.put(endpoint, data, config).then((res) => res.data),

  // PATCH: partially update a record
  patch: (endpoint, data, config = {}) =>
    apiClient.patch(endpoint, data, config).then((res) => res.data),

  // DELETE: remove a record
  delete: (endpoint, config = {}) =>
    apiClient.delete(endpoint, config).then((res) => res.data),
};

export default apiService;
