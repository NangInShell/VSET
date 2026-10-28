import type { TaskConfig } from '@shared/type/taskConfig'
import type { IpcMainEvent } from 'electron'
import { runCommand } from './runCommand'

/**
 * 针对任务队列的单视频渲染入口。
 * 与 runCommand 类似，但约定每个 TaskConfig 只包含一个输入视频。
 * 这样可以配合任务列表（每个任务一个视频）进行调度。
 */
export async function runTaskCommand(event: IpcMainEvent, taskConfig: TaskConfig): Promise<void> {
  const list = Array.isArray(taskConfig.fileList) ? taskConfig.fileList : []

  // 只保留第一个输入文件，确保“一个任务只对应一个视频”
  const normalized: TaskConfig = {
    ...taskConfig,
    fileList: list.length > 0 ? [list[0]] : [],
  }

  await runCommand(event, normalized)
}

