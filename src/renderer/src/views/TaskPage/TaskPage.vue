<script setup lang="ts">
import { Delete, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { useTaskStore } from '@renderer/store/TaskStore'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import TaskCard from './TaskCard.vue'

const taskStore = useTaskStore()
const { tasks } = storeToRefs(taskStore)
const message = useMessage()

const hasTasks = () => tasks.value.length > 0
const hasPendingOrPaused = () => tasks.value.some(t => t.status === 'pending' || t.status === 'paused')
const hasRunning = () => tasks.value.some(t => t.status === 'running')

function startAll(): void {
  if (!hasPendingOrPaused()) {
    message.info('没有可启动的任务')
    return
  }
  tasks.value.forEach((t) => {
    if (t.status === 'pending' || t.status === 'paused')
      taskStore.setTaskStatus(t.id, 'running')
  })
  message.success('已全部启动')
}

function pauseAll(): void {
  if (!hasRunning()) {
    message.info('没有正在运行的任务')
    return
  }
  tasks.value.forEach((t) => {
    if (t.status === 'running')
      taskStore.setTaskStatus(t.id, 'paused')
  })
  message.warning('已全部暂停')
}

function deleteAll(): void {
  if (tasks.value.length === 0) {
    message.info('当前没有任务')
    return
  }
  taskStore.clearAll()
  message.success('已清空全部任务')
}
</script>

<template>
  <div class="task-page">
    <n-card :bordered="false" class="toolbar-card">
      <div class="toolbar">
        <span class="toolbar-title">任务列表 ({{ tasks.length }})</span>
        <div class="toolbar-actions">
          <el-button type="primary" :icon="VideoPlay" :disabled="!hasTasks() || !hasPendingOrPaused()" @click="startAll">
            全部启动
          </el-button>
          <el-button type="warning" :icon="VideoPause" :disabled="!hasTasks() || !hasRunning()" @click="pauseAll">
            全部暂停
          </el-button>
          <el-button type="danger" :icon="Delete" :disabled="!hasTasks()" @click="deleteAll">
            全部删除
          </el-button>
        </div>
      </div>
    </n-card>

    <div v-if="tasks.length === 0" class="empty-state">
      <p>暂无任务，请到「新输入」页面导入视频并批量添加任务。</p>
    </div>

    <div v-else class="task-grid">
      <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<style scoped>
.task-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  background: #f5f7fa;
  border-radius: 12px;
  color: #909399;
  font-size: 14px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
</style>
