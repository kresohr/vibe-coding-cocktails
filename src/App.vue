<script setup>
  import { RouterView } from "vue-router";
  import Navbar from "@/components/layout/Navbar.vue";
</script>

<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <Navbar />
    <main class="container mx-auto p-4">
      <RouterView />
    </main>
  </div>
</template>
