<template>
  <div class="home">
    <h1 class="title">📸 智能纪念册生成器</h1>
    <p class="subtitle">上传照片 + 输入文字，AI自动排版，一键导出PDF</p>

    <!-- 上传组件 -->
    <Uploader ref="uploaderRef" @uploaded="onUploaded" />

    <!-- 文字输入 -->
    <div class="form-group">
      <label>📖 纪念册标题</label>
      <input v-model="title" placeholder="例如：青春不散场" class="input" />
    </div>
    <div class="form-group">
      <label>📝 每页文字（每行一页，会自动分配到各页）</label>
      <textarea 
        v-model="pageTextsRaw" 
        rows="5" 
        placeholder="第一页文字&#10;第二页文字&#10;第三页文字"
        class="textarea"
      ></textarea>
      <span class="hint">如果文字行数少于页数，系统会循环使用</span>
    </div>

    <!-- 生成按钮 -->
    <button class="btn-generate" @click="generatePreview" :disabled="!hasPhotos || loading">
      {{ loading ? '⏳ 生成中...' : '✨ 生成预览' }}
    </button>

    <div v-if="loading" class="loading">⏳ 正在排版，请稍候...</div>
    <div v-if="previewHtml" class="preview-area">
      <Editor :html="previewHtml" @export="onExport" />
      <button class="btn-clear" @click="resetAll">🗑️ 重新开始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Uploader from '../components/Uploader.vue';
import Editor from '../components/Editor.vue';

const uploaderRef = ref<InstanceType<typeof Uploader> | null>(null);
const uploadedFiles = ref<File[]>([]);
const title = ref('');
const pageTextsRaw = ref('');
const previewHtml = ref('');
const loading = ref(false);

const hasPhotos = computed(() => uploadedFiles.value.length > 0);

// 页面加载时清除后端旧数据
onMounted(async () => {
  try {
    await axios.delete('/api/assets');
    console.log('✅ 已清除旧数据');
  } catch (e) {
    // 忽略
  }
});

// 上传回调：只更新文件列表，不自动预览
const onUploaded = (files: File[]) => {
  uploadedFiles.value = files;
  // 不自动预览，等待用户点击按钮
};

// 生成预览（使用合并接口 /api/generate）
const generatePreview = async () => {
  if (!hasPhotos.value) {
    alert('请先上传照片');
    return;
  }

  loading.value = true;
  try {
    const formData = new FormData();
    uploadedFiles.value.forEach(f => formData.append('photos', f));
    formData.append('title', title.value || '我的纪念册');
    formData.append('texts', JSON.stringify(
      pageTextsRaw.value.split('\n').filter(t => t.trim())
    ));

    const response = await axios.post('/api/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    previewHtml.value = response.data.html;
    console.log('✅ 生成成功，HTML 长度:', response.data.html.length);
  } catch (err: any) {
    console.error('生成失败:', err);
    alert('生成失败：' + (err.response?.data?.error || err.message));
  } finally {
    loading.value = false;
  }
};

// 导出 PDF
const onExport = async () => {
  try {
    const res = await axios.post('/api/export', {
      html: previewHtml.value,
    }, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'album.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 导出成功后自动清除
    await resetAll();
    alert('导出成功，已清除所有数据，可重新上传');
  } catch (err) {
    console.error(err);
    alert('导出PDF失败');
  }
};

// 重置所有（清除后端、前端、文字）
const resetAll = async () => {
  try {
    await axios.delete('/api/assets');
    uploaderRef.value?.clear();
    previewHtml.value = '';
    uploadedFiles.value = [];
    // 清空文字输入
    title.value = '';
    pageTextsRaw.value = '';
  } catch (err) {
    console.error('重置失败', err);
  }
};
</script>

<style scoped>
.home {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.title { font-size: 32px; margin-bottom: 8px; color: #1a1a1a; }
.subtitle { color: #666; margin-bottom: 30px; }
.form-group { margin-top: 20px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; color: #333; }
.input, .textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}
.input:focus, .textarea:focus { border-color: #1890ff; outline: none; }
.textarea { resize: vertical; font-family: inherit; }
.hint { font-size: 13px; color: #999; margin-top: 4px; display: block; }
.btn-generate {
  margin-top: 24px;
  padding: 12px 32px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  width: 100%;
}
.btn-generate:hover:not(:disabled) { background: #40a9ff; }
.btn-generate:disabled { background: #a0c4e8; cursor: not-allowed; }
.loading { text-align: center; padding: 40px; font-size: 18px; color: #1890ff; }
.preview-area { margin-top: 30px; }
.btn-clear {
  margin-top: 12px;
  padding: 8px 20px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-clear:hover { background: #ff7875; }
</style>