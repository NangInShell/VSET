<script setup lang="ts">
import type { TaskItem } from '@renderer/store/TaskStore'
import { Delete, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { useTaskStore } from '@renderer/store/TaskStore'
import { IpcChannelOn, IpcChannelSend } from '@shared/constant/ipc'
import { useMessage } from 'naive-ui'
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ task: TaskItem }>()
const taskStore = useTaskStore()
const message = useMessage()

const statusText = computed(() => {
  const map: Record<TaskItem['status'], string> = {
    pending: '等待中',
    running: '运行中',
    paused: '已暂停',
    finished: '已完成',
    error: '错误',
  }
  return map[props.task.status]
})

const canStart = computed(() => props.task.status === 'pending' || props.task.status === 'paused')
const canStop = computed(() => props.task.status === 'running')

// IPC 输出回调 - 更新任务进度（简化版，实际需要解析进度）
function handleOutput(_event: any, _msg: string): void {
  // 可以在这里解析 ffmpeg 输出，提取进度百分比
  // 暂时不处理，后续可以完善
}

// 监听任务完成
function handleTaskFinished(): void {
  if (props.task.status === 'running') {
    taskStore.setTaskStatus(props.task.id, 'finished')
    taskStore.setTaskProgress(props.task.id, 100)
    message.success(`任务完成: ${props.task.fileName}`)
  }
}

onMounted(() => {
  // 监听全局的完成事件（简化处理，实际应该区分不同任务）
  window.electron.ipcRenderer.on(IpcChannelOn.FFMPEG_FINISHED, handleTaskFinished)
  window.electron.ipcRenderer.on(IpcChannelOn.FFMPEG_OUTPUT, handleOutput)
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeListener(IpcChannelOn.FFMPEG_FINISHED, handleTaskFinished)
  window.electron.ipcRenderer.removeListener(IpcChannelOn.FFMPEG_OUTPUT, handleOutput)
})

function startTask(): void {
  // 检查任务配置中的输出文件夹
  if (!props.task.taskConfig.outputFolder) {
    message.error('输出文件夹为空，无法启动渲染流程', { duration: 5000 })
    return
  }

  // 检查文件列表是否为空
  if (!props.task.taskConfig.fileList || props.task.taskConfig.fileList.length === 0) {
    message.error('输入文件列表为空', { duration: 5000 })
    return
  }

  taskStore.setTaskStatus(props.task.id, 'running')
  taskStore.setTaskProgress(props.task.id, 0)
  
  // 使用任务保存的配置执行命令（单任务单视频）
  window.electron.ipcRenderer.send(IpcChannelSend.GENERATE_JSON, props.task.taskConfig)
  window.electron.ipcRenderer.send(IpcChannelSend.EXECUTE_TASK_COMMAND, props.task.taskConfig)
  
  message.success(`开始任务: ${props.task.fileName}`)
}

function stopTask(): void {
  // 发送停止命令（简化处理，实际需要根据任务ID停止对应进程）
  window.electron.ipcRenderer.send(IpcChannelSend.STOP_ALL_PROCESSES)
  taskStore.setTaskStatus(props.task.id, 'paused')
  message.warning(`已暂停: ${props.task.fileName}`)
}

function removeTask(): void {
  taskStore.removeTask(props.task.id)
  message.success('已移除任务')
}
</script>

<template>
  <n-card :bordered="true" class="task-card" size="small">
    <template #header>
      <div class="card-header">
        <span class="card-title" :title="task.filePath">{{ task.fileName }}</span>
        <el-button type="danger" link size="small" :icon="Delete" @click="removeTask">
          删除
        </el-button>
      </div>
    </template>

    <div class="card-body">
      <div class="task-id-row">
        <span class="label">任务ID</span>
        <span class="task-id" :title="task.id">{{ task.id }}</span>
      </div>
      <div class="progress-row">
        <span class="label">进度</span>
        <n-progress
          type="line"
          :percentage="task.progress"
          :status="task.status === 'error' ? 'error' : task.status === 'finished' ? 'success' : undefined"
          :show-indicator="true"
          style="flex: 1"
        />
        <span class="status-tag">{{ statusText }}</span>
      </div>

      <div class="actions">
        <el-button
          type="primary"
          size="default"
          :icon="VideoPlay"
          :disabled="!canStart"
          @click="startTask"
        >
          开始
        </el-button>
        <el-button
          type="warning"
          size="default"
          :icon="VideoPause"
          :disabled="!canStop"
          @click="stopTask"
        >
          结束
        </el-button>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.task-card {
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 16px 12px;
}

.task-id-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-id-row .label {
  font-size: 13px;
  color: #606266;
  min-width: 52px;
}

.task-id {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
  word-break: break-all;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-row .label {
  font-size: 13px;
  color: #606266;
  min-width: 36px;
}

.status-tag {
  font-size: 12px;
  color: #909399;
  min-width: 48px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
