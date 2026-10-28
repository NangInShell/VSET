<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { useTaskStore } from '@renderer/store/TaskStore'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const taskStore = useTaskStore()
const router = useRouter()
const message = useMessage()
const pendingFiles = ref<{ path: string; name?: string }[]>([])
const adding = ref(false)

function openFile(): void {
  const input = document.getElementById('input-new-open') as HTMLInputElement | null
  if (input) {
    input.value = ''
    input.click()
  }
}

function handleFileChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File & { path?: string }
      const path = file.path ?? (file as unknown as { path?: string }).path ?? ''
      if (path)
        pendingFiles.value.push({ path, name: file.name || path.replace(/^.*[\\/]/, '') })
    }
  }
  target.value = ''
}

function handleDrop(event: DragEvent): void {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File & { path?: string }
      const path = file.path ?? (file as unknown as { path?: string }).path ?? ''
      if (path)
        pendingFiles.value.push({ path, name: file.name || path.replace(/^.*[\\/]/, '') })
    }
  }
}

function removePending(index: number): void {
  pendingFiles.value.splice(index, 1)
}

function clearPending(): void {
  pendingFiles.value = []
}

async function batchAddToTasks(): Promise<void> {
  if (pendingFiles.value.length === 0)
    return
  adding.value = true
  try {
    const paths = pendingFiles.value.map(f => f.path)
    await taskStore.addTasks(paths)
    pendingFiles.value = []
    message.success(`已添加 ${paths.length} 个任务`)
    router.push('/tasks')
  }
  catch (e) {
    message.error('添加任务失败：' + (e instanceof Error ? e.message : String(e)))
  }
  finally {
    adding.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <n-card title="新输入页面 - 批量添加到任务" :bordered="false" class="main-card">
      <div class="upload-area" @dragover.prevent @drop="handleDrop" @click="openFile">
        <el-icon class="upload-icon" :style="{ fontSize: '48px' }">
          <UploadFilled />
        </el-icon>
        <div class="upload-text">
          将视频文件拖到此处，或<em>点击选择</em>
        </div>
      </div>

      <input
        id="input-new-open"
        type="file"
        accept="video/*,.mkv,.mp4,.avi,.mov,.webm"
        multiple
        style="display: none"
        @change="handleFileChange"
      >

      <div v-if="pendingFiles.length > 0" class="pending-section">
        <div class="pending-header">
          <span class="pending-title">待添加 ({{ pendingFiles.length }})</span>
          <el-button type="primary" size="default" :loading="adding" :disabled="adding" @click="batchAddToTasks">
            批量添加到任务页面
          </el-button>
          <el-button size="default" @click="clearPending">
            清空列表
          </el-button>
        </div>
        <ul class="pending-list">
          <li v-for="(file, index) in pendingFiles" :key="file.path + index" class="pending-item">
            <span class="pending-name" :title="file.path">{{ file.name ?? file.path }}</span>
            <el-button type="danger" link size="small" @click="removePending(index)">
              移除
            </el-button>
          </li>
        </ul>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.upload-area {
  border: 2px dashed #c0c4cc;
  border-radius: 8px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-icon {
  color: #909399;
  margin-bottom: 12px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.pending-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.pending-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.pending-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-right: auto;
}

.pending-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 280px;
  overflow-y: auto;
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f5f7fa;
  margin-bottom: 6px;
}

.pending-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #303133;
}
</style>
