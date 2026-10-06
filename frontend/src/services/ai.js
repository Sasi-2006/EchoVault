import api from "./api";

function getAuthHeaders() {
  const token = localStorage.getItem("echovault_token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function reflectOnEntry(entryId) {
  const response = await api.post(
    `/api/ai/reflect/${entryId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function summarizeEntry(entryId) {
  const response = await api.post(
    `/api/ai/summarize/${entryId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function analyzeEntry(entryId) {
  const response = await api.post(
    `/api/ai/analyze/${entryId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function askEchoVault(question) {
  const response = await api.post(
    "/api/ai/rag",
    { question },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function askAgent(question, conversation = []) {
  const response = await api.post(
    "/api/agent/ask",
    {
      question,
      conversation,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}