<template>
  <div class="editor">
    <div class="toolbar">
      <button class="btn-primary" @click="emit('export')">📄 导出 PDF</button>
    </div>
    <div class="iframe-wrapper">
      <iframe :srcdoc="html" title="Preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  html: string;
}>();

const emit = defineEmits<{
  (e: 'export'): void;
}>();
</script>

<style scoped>
.editor {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}
.toolbar {
  padding: 12px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
}
.btn-primary {
  padding: 6px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
.btn-primary:hover {
  background: #40a9ff;
}
.iframe-wrapper {
  height: 600px;
  background: white;
}
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>