<template>
  <div class="uploader-wrapper">
    <div 
      class="upload-area"
      :class="{ dragover }"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <div class="upload-icon">📤</div>
      <p class="upload-text">点击选择照片，或拖拽到此处</p>
      <p class="upload-hint">支持 jpg, png, webp，最多 100 张</p>
      <input 
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileChange"
        style="display: none"
      />
      <button class="upload-btn" @click.stop="triggerFileInput">选择照片</button>
    </div>

    <div v-if="fileList.length > 0" class="thumbnail-list">
      <div 
        v-for="(file, index) in fileList" 
        :key="index"
        class="thumbnail-item"
      >
        <img 
          :src="getFileURL(file)" 
          :alt="file.name"
          class="thumbnail-img"
        />
        <button class="delete-btn" @click="removeFile(index)">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'uploaded', files: File[]): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const dragover = ref(false);
const fileList = ref<File[]>([]);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    addFiles(files);
    target.value = '';
  }
};

const handleDrop = (event: DragEvent) => {
  dragover.value = false;
  const files = event.dataTransfer?.files;
  if (files) {
    addFiles(Array.from(files));
  }
};

const addFiles = (files: File[]) => {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) return;
  const newList = [...fileList.value, ...imageFiles];
  if (newList.length > 100) {
    alert('最多只能上传100张图片');
    return;
  }
  fileList.value = newList;
  emit('uploaded', fileList.value);
};

const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
  emit('uploaded', fileList.value);
};

const getFileURL = (file: File) => {
  return URL.createObjectURL(file);
};

// 对外暴露清空方法
const clear = () => {
  fileList.value = [];
  emit('uploaded', []);
};

defineExpose({
  clear,
});
</script>

<style scoped>
.uploader-wrapper { width: 100%; }
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s;
  background: #fafafa;
  cursor: pointer;
}
.upload-area.dragover {
  border-color: #1890ff;
  background: #e6f7ff;
}
.upload-icon { font-size: 48px; margin-bottom: 8px; }
.upload-text { font-size: 16px; color: #333; margin: 0; }
.upload-hint { font-size: 14px; color: #999; margin: 4px 0 12px 0; }
.upload-btn {
  padding: 8px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
.upload-btn:hover { background: #40a9ff; }

.thumbnail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  padding: 4px 0;
}
.thumbnail-item {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
}
.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  display: block;
  background: none;
}
.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 12px;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.thumbnail-item:hover .delete-btn { opacity: 1; }
.delete-btn:hover { background: #ff4d4f; }
</style>