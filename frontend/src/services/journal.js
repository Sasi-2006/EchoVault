import api from "./api";

function getAuthHeaders() {
  const token = localStorage.getItem(
    "echovault_token"
  );

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getJournalEntries() {
  const response = await api.get(
    "/api/journal",
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function createJournalEntry(entry) {
  const response = await api.post(
    "/api/journal",
    entry,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function updateJournalEntry(
  id,
  entry
) {
  const response = await api.put(
    `/api/journal/${id}`,
    entry,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function deleteJournalEntry(id) {
  const response = await api.delete(
    `/api/journal/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}
export async function semanticSearch(query) {
  const response = await api.post(
    "/api/search/semantic",
    {
      query,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}