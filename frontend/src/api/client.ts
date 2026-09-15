export type Task = {
  id: number
  title: string
  description: string | null
  status: string
  created_at: string
}

export type HealthStatus = {
  status: string
  database: string
}

export type DatabaseStatus = {
  success: boolean
  database: string
  server_version?: string
  detail?: string
}

export type AgentTaskResult = {
  agent: string
  parsed_title: string
  parsed_description: string | null
  task: Task
}

import { apiBase } from '../config'

const API_BASE = apiBase.replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  health: () => request<HealthStatus>('/health'),
  dbStatus: () => request<DatabaseStatus>('/db/status'),
  listTasks: () => request<Task[]>('/tasks'),
  createTask: (payload: { title: string; description?: string | null }) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: payload.title, description: payload.description ?? null }),
    }),
  runTaskAgent: (text: string) =>
    request<AgentTaskResult>('/agent/tasks', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
}
