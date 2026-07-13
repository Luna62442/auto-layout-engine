<template>
  <div id="app">
    <Home />
  </div>
</template>

<script setup lang="ts">
import Home from './views/Home.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
}
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>