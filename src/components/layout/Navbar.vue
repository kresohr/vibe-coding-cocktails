<script setup>
  import { RouterLink } from "vue-router";
  import { Menu } from "lucide-vue-next";
  import { Button } from "@/components/ui/button";
  import { ref } from "vue";
  import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
  } from "@/components/ui/navigation-menu";
  import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

  const isSheetOpen = ref(false);
  function closeSheet() {
    isSheetOpen.value = false;
  }
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container h-14 flex items-center justify-between">
      <!-- Mobile Menu -->
      <!-- NEW & IMPROVED MOBILE MENU -->
      <div class="md:hidden">
        <Sheet v-model:open="isSheetOpen">
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="justify-start active:bg-transparent"
            >
              <Menu class="h-6 w-6" />
              <span class="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav class="grid gap-6 text-lg font-medium mt-6 px-6">
              <RouterLink
                to="/"
                class="hover:text-foreground"
                @click="closeSheet"
                >Home</RouterLink
              >
              <RouterLink
                to="/favorites"
                class="hover:text-foreground"
                @click="closeSheet"
                >Favorites</RouterLink
              >
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <!-- Desktop Menu -->
      <!-- NEW & IMPROVED DESKTOP NAVIGATION -->
      <NavigationMenu class="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <RouterLink
              to="/"
              custom
              v-slot="{ navigate, isActive }"
              class="outline-0 cursor-pointer"
            >
              <NavigationMenuLink
                :class="[
                  navigationMenuTriggerStyle(),
                  isActive
                    ? 'underline underline-offset-4 outline-none'
                    : 'outline-none',
                ]"
                @click="navigate"
              >
                Home
              </NavigationMenuLink>
            </RouterLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <RouterLink
              to="/favorites"
              custom
              v-slot="{ navigate, isActive }"
              class="outline-0 cursor-pointer"
            >
              <NavigationMenuLink
                :class="[
                  navigationMenuTriggerStyle(),
                  isActive ? 'underline underline-offset-4 border-none' : '',
                ]"
                @click="navigate"
              >
                Favorites
              </NavigationMenuLink>
            </RouterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <!-- Placeholder for a logo or title if you want one -->
      <a href="/" class="text-lg font-bold">CocktailDb</a>
    </div>
  </header>
</template>
