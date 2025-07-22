import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Cocktail } from "./favoritesStore.ts"; // We'll reuse the Cocktail type

export const useCocktailStore = defineStore("cocktails", () => {
  // === STATE ===
  // Holds the list of cocktails returned from a search
  const cocktails = ref<Cocktail[]>([]);
  // The current search term
  const searchQuery = ref("");
  // Tracks whether an API call is in progress
  const isLoading = ref(false);
  // Holds any error message if an API call fails
  const error = ref<string | null>(null);

  // === GETTERS ===
  // A computed property that returns true if there are search results
  const hasResults = computed(() => cocktails.value.length > 0);

  // === ACTIONS ===
  /**
   * Fetches cocktails from the API based on the current search query.
   * Updates loading and error states accordingly.
   */
  async function searchCocktails() {
    if (!searchQuery.value.trim()) {
      cocktails.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;
    cocktails.value = [];

    try {
      const response = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchQuery.value}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();

      // The API returns `null` if no drinks are found
      if (data.drinks) {
        cocktails.value = data.drinks;
      } else {
        cocktails.value = []; // Ensure results are cleared if no drinks are found
      }
    } catch (e) {
      const err = e as Error;
      error.value = `Failed to fetch cocktails: ${err.message}`;
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  // Expose state, getters, and actions to be used in components
  return {
    cocktails,
    searchQuery,
    isLoading,
    error,
    hasResults,
    searchCocktails,
  };
});
