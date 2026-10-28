import { IpcChannelInvoke } from '@shared/constant/ipc'
import type { TaskConfig } from '@shared/type/taskConfig'
import { buildTaskConfig } from '@renderer/utils/getTaskConfig'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TaskStatus = 'pending' | 'running' | 'paused' | 'finished' | 'error'

export interface TaskItem {
  id: string
  filePath: string
  fileName: string
  progress: number
  status: TaskStatus
  createdAt: number
  taskConfig: TaskConfig
}

/** 年月日时分秒，14 位 */
function formatDatePart(): string {
  const d = new Date()
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}${M}${D}${h}${m}${s}`
}

/** 8 位随机数 */
function random8Digits(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000))
}

/**
 * 生成任务 ID：年月日时分秒_CRC32_8位随机数（CRC32 由 7z.exe 计算）
 */
async function generateTaskId(filePath: string): Promise<string> {
  const datePart = formatDatePart()
  const crc32 = await window.electron.ipcRenderer.invoke(IpcChannelInvoke.GET_FILE_CRC32, filePath) as string
  const random8 = random8Digits()
  return `${datePart}_${crc32}_${random8}`
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<TaskItem[]>([])

  async function addTask(filePath: string): Promise<TaskItem> {
    const fileName = filePath.replace(/^.*[\\/]/, '') || filePath
    const id = await generateTaskId(filePath)
    
    // 获取当前所有页面的设置
    const currentConfig = buildTaskConfig()
    // 为当前任务创建配置，只包含单个文件
    const normalizedPath = filePath.replace(/\\/g, '/')
    const taskConfig: TaskConfig = {
      ...currentConfig,
      fileList: [normalizedPath],
    }
    
    const task: TaskItem = {
      id,
      filePath,
      fileName,
      progress: 0,
      status: 'pending',
      createdAt: Date.now(),
      taskConfig,
    }
    tasks.value.push(task)
    return task
  }

  async function addTasks(filePaths: string[]): Promise<TaskItem[]> {
    const added: TaskItem[] = []
    for (const path of filePaths) {
      const pathStr = typeof path === 'string' ? path : (path as { path?: string }).path ?? String(path)
      if (pathStr)
        added.push(await addTask(pathStr))
    }
    return added
  }

  function removeTask(id: string): void {
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  function clearAll(): void {
    tasks.value = []
  }

  function setTaskStatus(id: string, status: TaskStatus): void {
    const task = tasks.value.find(t => t.id === id)
    if (task)
      task.status = status
  }

  function setTaskProgress(id: string, progress: number): void {
    const task = tasks.value.find(t => t.id === id)
    if (task)
      task.progress = Math.min(100, Math.max(0, progress))
  }

  function getTask(id: string): TaskItem | undefined {
    return tasks.value.find(t => t.id === id)
  }

  return {
    tasks,
    addTask,
    addTasks,
    removeTask,
    clearAll,
    setTaskStatus,
    setTaskProgress,
    getTask,
  }
})
