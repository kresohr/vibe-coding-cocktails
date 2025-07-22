<script setup lang="ts">
  import { ref, computed } from "vue";
  import { storeToRefs } from "pinia";
  import { useFavoritesStore, type Cocktail } from "@/stores/favoritesStore";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardFooter,
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
    Star,
    CheckCircle2,
    FlaskConical,
    GlassWater,
    Wine,
    WineOff,
  } from "lucide-vue-next";

  import { Badge } from "@/components/ui/badge";

  // Instantiate the store
  const favoritesStore = useFavoritesStore();

  // Get reactive access to the favorites list and actions
  const { favorites } = storeToRefs(favoritesStore);
  const { toggleFavorite, isFavorite } = favoritesStore;

  // NEW: Local state for the favorites search query
  const favoritesSearchQuery = ref("");

  // NEW: Computed property to filter favorites based on the search query
  const filteredFavorites = computed(() => {
    if (!favoritesSearchQuery.value.trim()) {
      // If search is empty, return all favorites
      return favorites.value;
    }
    const query = favoritesSearchQuery.value.toLowerCase();
    // Filter by cocktail name, ignoring case
    return favorites.value.filter((cocktail) =>
      cocktail.strDrink.toLowerCase().includes(query)
    );
  });

  // Local state for the dialog
  const selectedCocktail = ref<Cocktail | null>(null);

  // --- The dialog and parsing logic remains the same ---
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

  const instructionsList = computed(() => {
    return (
      selectedCocktail.value?.strInstructions
        ?.split(/\r?\n/)
        .filter((line) => line.trim() !== "") ?? []
    );
  });

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
          if (measure && /oz/i.test(measure)) {
            const numericValue = parseMeasure(
              measure.toLowerCase().replace(/oz/gi, "")
            );
            if (numericValue > 0) {
              const mlValue = Math.round(numericValue * ozToMl);
              finalMeasure = `${finalMeasure} (${mlValue}ml)`;
            }
          }
          ingredients.push({ name: ingredient.trim(), measure: finalMeasure });
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
    <!-- Page Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
        My Favorite Cocktails
      </h1>
      <p class="mt-4 text-lg text-muted-foreground">
        All the cocktails you've saved will appear here.
      </p>
    </div>

    <!-- No Favorites Message (Only shows if the list is completely empty) -->
    <div v-if="!favorites.length" class="text-center pt-10">
      <p class="text-muted-foreground">You haven't added any favorites yet.</p>
    </div>

    <!-- Search and Display Area (Shows if there are any favorites) -->
    <div v-else>
      <!-- Search Bar for Favorites -->
      <div class="mx-auto w-full max-w-lg mb-8">
        <Input
          v-model="favoritesSearchQuery"
          type="text"
          placeholder="Search within your favorites..."
          aria-label="Search your favorite cocktails"
        />
      </div>

      <!-- No Results from Search Message -->
      <div
        v-if="!filteredFavorites.length"
        class="text-center pt-10 text-muted-foreground"
      >
        <p>No favorites found matching "{{ favoritesSearchQuery }}".</p>
      </div>

      <!-- Favorites Grid with Dialog -->
      <Dialog v-else>
        <div class="mx-auto max-w-5xl">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Loop over the 'filteredFavorites' computed property -->
            <DialogTrigger
              v-for="cocktail in filteredFavorites"
              :key="cocktail.idDrink"
              as-child
              @click="() => showDetails(cocktail)"
            >
              <Card
                class="flex flex-col cursor-pointer hover:ring-2 hover:ring-primary transition-all gap-2"
              >
                <!-- CardHeader with Star right-aligned -->
                <CardHeader class="flex flex-row items-center justify-between">
                  <CardTitle>{{ cocktail.strDrink }}</CardTitle>
                  <Button
                    variant="ghost"
                    class="bg-background/70 hover:bg-background/90 rounded-full h-12 w-12 p-0"
                    @click.stop="() => toggleFavorite(cocktail)"
                  >
                    <Star class="h-8 w-8 fill-yellow-400 text-yellow-400" />
                    <span class="sr-only">Remove from Favorites</span>
                  </Button>
                </CardHeader>
                <CardContent class="flex-grow flex flex-col">
                  <!-- BADGES! -->
                  <div class="flex flex-wrap gap-2 mb-4">
                    <Badge
                      v-if="cocktail.strAlcoholic === 'Alcoholic'"
                      variant="outline"
                      class="flex items-center"
                    >
                      <Wine class="mr-1.5 h-3 w-3" />
                      Alcoholic
                    </Badge>
                    <Badge
                      v-else-if="cocktail.strAlcoholic === 'Non alcoholic'"
                      variant="outline"
                      class="flex items-center"
                    >
                      <WineOff class="mr-1.5 h-3 w-3" />
                      Non-alcoholic
                    </Badge>
                    <Badge
                      v-else-if="cocktail.strAlcoholic"
                      variant="outline"
                      class="flex items-center"
                    >
                      {{ cocktail.strAlcoholic }}
                    </Badge>
                    <Badge
                      v-if="cocktail.strGlass"
                      variant="outline"
                      class="flex items-center"
                    >
                      <GlassWater class="mr-1.5 h-3 w-3" />
                      {{ cocktail.strGlass }}
                    </Badge>
                  </div>
                  <div class="mt-auto">
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
        <!-- The reusable Dialog Content remains the same -->
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
          <div class="grid gap-4 py-4">
            <div>
              <h3 class="font-semibold mb-2 flex items-center">
                <FlaskConical class="mr-2 h-5 w-5 text-primary" />Ingredients
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
            <div>
              <h3 class="font-semibold mb-2 flex items-center">
                <CheckCircle2 class="mr-2 h-5 w-5 text-primary" />Instructions
              </h3>
              <ol class="space-y-2 text-sm list-decimal pl-5">
                <li
                  v-for="(instruction, index) in instructionsList"
                  :key="index"
                >
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
                v-if="selectedCocktail"
                class="mr-2 h-4 w-4"
                :class="{
                  'fill-current': isFavorite(selectedCocktail.idDrink),
                }"
              />
              {{
                selectedCocktail && isFavorite(selectedCocktail.idDrink)
                  ? "Remove from Favorites"
                  : "Add to Favorites"
              }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </section>
</template>
