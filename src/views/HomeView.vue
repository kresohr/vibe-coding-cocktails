<script setup lang="ts">
  import { ref, computed } from "vue";
  import { useCocktailStore } from "@/stores/cocktailsStore";
  import { useFavoritesStore, type Cocktail } from "@/stores/favoritesStore";
  import { storeToRefs } from "pinia";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
  } from "@/components/ui/dialog";
  import { Separator } from "@/components/ui/separator";
  import {
    Loader2,
    Star,
    AlertCircle,
    CheckCircle2,
    FlaskConical,
    GlassWater,
    Wine,
    WineOff,
  } from "lucide-vue-next";

  // Instantiate stores
  const cocktailStore = useCocktailStore();
  const favoritesStore = useFavoritesStore();

  // Reactive state and getters from stores
  const { cocktails, searchQuery, isLoading, error, hasResults } =
    storeToRefs(cocktailStore);

  // Actions from stores
  const { searchCocktails } = cocktailStore;
  const { toggleFavorite, isFavorite } = favoritesStore;

  // Local state for the dialog
  const selectedCocktail = ref<Cocktail | null>(null);

  // Computed property to parse INSTRUCTIONS into a list
  const instructionsList = computed(() => {
    if (selectedCocktail.value?.strInstructions) {
      return selectedCocktail.value.strInstructions
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");
    }
    return [];
  });

  function parseMeasure(measureStr: string): number {
    if (!measureStr) return 0;
    return measureStr
      .trim()
      .split(" ")
      .reduce((acc, part) => {
        const fractionParts = part.split("/");
        return fractionParts.length === 2
          ? acc +
              parseInt(fractionParts[0], 10) / parseInt(fractionParts[1], 10)
          : acc + (parseFloat(part) || 0);
      }, 0);
  }

  // NEW: Computed property to parse INGREDIENTS into a list
  const ingredientsList = computed(() => {
    const ingredients: { name: string; measure: string }[] = [];
    const ozToMl = 29.5735;

    if (selectedCocktail.value) {
      for (let i = 1; i <= 15; i++) {
        const ingredient =
          selectedCocktail.value[`strIngredient${i}` as keyof Cocktail];
        const measure =
          selectedCocktail.value[`strMeasure${i}` as keyof Cocktail];

        if (ingredient && ingredient.trim()) {
          let finalMeasure = measure ? measure.trim() : "";

          // --- Dual Unit Conversion Logic ---
          if (measure && /oz/i.test(measure)) {
            const numericValue = parseMeasure(
              measure.toLowerCase().replace(/oz/gi, "")
            );
            if (numericValue > 0) {
              const mlValue = Math.round(numericValue * ozToMl);
              // Append the converted value in parentheses
              finalMeasure = `${finalMeasure} (${mlValue}ml)`;
            }
          }

          ingredients.push({
            name: ingredient.trim(),
            measure: finalMeasure,
          });
        }
      }
    }
    return ingredients;
  });

  function showDetails(cocktail: Cocktail) {
    selectedCocktail.value = cocktail;
  }
</script>

<template>
  <section class="space-y-8 pt-6">
    <!-- Search Section -->
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
        Discover Your Next Favorite Cocktail
      </h1>
      <p class="mt-4 text-lg text-muted-foreground">
        Search from a collection of thousands of cocktail recipes.
      </p>
    </div>

    <!-- Search Form -->
    <form
      @submit.prevent="searchCocktails"
      class="mx-auto flex w-full max-w-lg items-center space-x-2"
    >
      <Input
        v-model="searchQuery"
        type="text"
        placeholder="e.g., Margarita"
        class="flex-grow"
        aria-label="Search for a cocktail"
      />
      <Button type="submit" :disabled="isLoading">
        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        Search
      </Button>
    </form>

    <!-- Results Section with Dialog -->
    <Dialog>
      <div class="mx-auto max-w-5xl">
        <!-- ... Loading, Error, and No Results states remain the same ... -->
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center space-y-4 pt-10"
        >
          <Loader2 class="h-10 w-10 animate-spin text-primary" />
          <p class="text-muted-foreground">Searching for cocktails...</p>
        </div>
        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center space-y-4 pt-10 text-destructive"
        >
          <AlertCircle class="h-10 w-10" />
          <p class="font-semibold">Something went wrong</p>
          <p class="text-sm">{{ error }}</p>
        </div>
        <div
          v-else-if="!hasResults && searchQuery"
          class="text-center pt-10 text-muted-foreground"
        >
          <p>
            No cocktails found for "{{ searchQuery }}". Please try another
            search.
          </p>
        </div>

        <!-- Results Grid -->
        <div
          v-else-if="hasResults"
          class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          <DialogTrigger
            v-for="cocktail in cocktails"
            :key="cocktail.idDrink"
            as-child
            @click="() => showDetails(cocktail)"
          >
            <Card
              class="flex flex-col cursor-pointer hover:ring-2 hover:ring-primary transition-all gap-2"
            >
              <CardHeader class="flex flex-row items-center justify-between">
                <CardTitle>{{ cocktail.strDrink }}</CardTitle>
                <Button
                  variant="ghost"
                  class="bg-background/70 hover:bg-background/90 rounded-full h-12 w-12"
                  @click.stop="() => toggleFavorite(cocktail)"
                >
                  <Star
                    class="h-12 w-12 transition-colors"
                    :class="{
                      'fill-yellow-400 text-yellow-500': isFavorite(
                        cocktail.idDrink
                      ),
                    }"
                  />
                  <span class="sr-only">Toggle Favorite</span>
                </Button>
              </CardHeader>
              <CardContent class="flex-grow flex flex-col">
                <!-- NEW: Badges for details -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <!-- Alcoholic Badge -->
                  <Badge
                    v-if="cocktail.strAlcoholic === 'Alcoholic'"
                    variant="outline"
                    class="flex items-center"
                  >
                    <Wine class="mr-1.5 h-3 w-3" />
                    Alcoholic
                  </Badge>

                  <!-- Non-alcoholic Badge -->
                  <Badge
                    v-else-if="cocktail.strAlcoholic === 'Non alcoholic'"
                    variant="outline"
                    class="flex items-center"
                  >
                    <WineOff class="mr-1.5 h-3 w-3" />
                    Non-alcoholic
                  </Badge>

                  <!-- Fallback for other values like 'Optional alcohol' -->
                  <Badge
                    v-else-if="cocktail.strAlcoholic"
                    variant="outline"
                    class="flex items-center"
                  >
                    {{ cocktail.strAlcoholic }}
                  </Badge>

                  <!-- Glass Badge (remains the same) -->
                  <Badge
                    v-if="cocktail.strGlass"
                    variant="outline"
                    class="flex items-center"
                  >
                    <GlassWater class="mr-1.5 h-3 w-3" />
                    {{ cocktail.strGlass }}
                  </Badge>
                </div>
                <!-- Image -->
                <div class="relative mt-auto">
                  <img
                    :src="cocktail.strDrinkThumb"
                    :alt="`A photo of a ${cocktail.strDrink}`"
                    class="w-full h-auto rounded-md object-cover"
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
        </div>
      </div>

      <!-- Dialog Content (Modal Pop-up) -->
      <DialogContent
        v-if="selectedCocktail"
        class="sm:max-w-md max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{{ selectedCocktail.strDrink }}</DialogTitle>
          <DialogDescription>
            Everything you need to craft the perfect
            {{ selectedCocktail.strDrink }}.
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-wrap gap-2 pt-2">
          <!-- Alcoholic Badge -->
          <Badge
            v-if="selectedCocktail.strAlcoholic === 'Alcoholic'"
            variant="outline"
            class="flex items-center"
          >
            <Wine class="mr-1.5 h-3 w-3" />
            Alcoholic
          </Badge>

          <!-- Non-alcoholic Badge -->
          <Badge
            v-else-if="selectedCocktail.strAlcoholic === 'Non alcoholic'"
            variant="outline"
            class="flex items-center"
          >
            <WineOff class="mr-1.5 h-3 w-3" />
            Non-alcoholic
          </Badge>

          <!-- Fallback for other values like 'Optional alcohol' -->
          <Badge
            v-else-if="selectedCocktail.strAlcoholic"
            variant="outline"
            class="flex items-center"
          >
            {{ selectedCocktail.strAlcoholic }}
          </Badge>

          <!-- Glass Badge -->
          <Badge
            v-if="selectedCocktail.strGlass"
            variant="outline"
            class="flex items-center"
          >
            <GlassWater class="mr-1.5 h-3 w-3" />
            {{ selectedCocktail.strGlass }}
          </Badge>
        </div>

        <div class="grid gap-4 py-2">
          <!-- Ingredients Section -->
          <div>
            <h3 class="font-semibold mb-2 flex items-center">
              <FlaskConical class="mr-2 h-5 w-5 text-primary" />
              Ingredients
            </h3>
            <ul class="space-y-1 text-sm list-disc pl-5">
              <li v-for="(item, index) in ingredientsList" :key="index">
                <span class="font-medium">{{ item.name }}</span>
                <span v-if="item.measure" class="text-muted-foreground">
                  - {{ item.measure }}</span
                >
              </li>
            </ul>
          </div>

          <Separator />

          <!-- Instructions Section -->
          <div>
            <h3 class="font-semibold mb-2 flex items-center">
              <CheckCircle2 class="mr-2 h-5 w-5 text-primary" />
              Instructions
            </h3>
            <ol class="space-y-2 text-sm list-decimal pl-5">
              <li v-for="(instruction, index) in instructionsList" :key="index">
                {{ instruction }}
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button
            @click="
              () => {
                if (selectedCocktail) toggleFavorite(selectedCocktail);
              }
            "
          >
            <Star
              class="mr-2 h-4 w-4"
              :class="{ 'fill-current': isFavorite(selectedCocktail.idDrink) }"
            />
            {{
              isFavorite(selectedCocktail.idDrink)
                ? "Remove from Favorites"
                : "Add to Favorites"
            }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
