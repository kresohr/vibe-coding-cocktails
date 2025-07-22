import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";

// Define a type for our cocktail object for better type safety.
// This interface will be shared by both the cocktail and favorites stores.
export interface Cocktail {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strInstructions: string | null; // Changed from undefined to null
  [key: string]: string | null; // Index signature for dynamic properties

  // All optional properties should allow null
  strDrinkAlternate: string | null;
  strTags: string | null;
  strVideo: string | null;
  strCategory: string | null;
  strIBA: string | null;
  strAlcoholic: string | null;
  strGlass: string | null;
  strInstructionsES: string | null;
  strInstructionsDE: string | null;
  strInstructionsFR: string | null;
  strInstructionsIT: string | null;
  strInstructionsZH_HANS: string | null;
  strInstructionsZH_HANT: string | null;
  strImageSource: string | null;
  strImageAttribution: string | null;
  strCreativeCommonsConfirmed: string | null;
  dateModified: string | null;

  strIngredient1: string | null;
  strIngredient2: string | null;
  strIngredient3: string | null;
  strIngredient4: string | null;
  strIngredient5: string | null;
  strIngredient6: string | null;
  strIngredient7: string | null;
  strIngredient8: string | null;
  strIngredient9: string | null;
  strIngredient10: string | null;
  strIngredient11: string | null;
  strIngredient12: string | null;
  strIngredient13: string | null;
  strIngredient14: string | null;
  strIngredient15: string | null;

  strMeasure1: string | null;
  strMeasure2: string | null;
  strMeasure3: string | null;
  strMeasure4: string | null;
  strMeasure5: string | null;
  strMeasure6: string | null;
  strMeasure7: string | null;
  strMeasure8: string | null;
  strMeasure9: string | null;
  strMeasure10: string | null;
  strMeasure11: string | null;
  strMeasure12: string | null;
  strMeasure13: string | null;
  strMeasure14: string | null;
  strMeasure15: string | null;
}

export const useFavoritesStore = defineStore("favorites", () => {
  // --- STATE ---
  // Load initial favorites from localStorage, or default to an empty array
  const favorites = ref<Cocktail[]>(
    JSON.parse(localStorage.getItem("favoriteCocktails") || "[]")
  );

  // --- ACTIONS ---
  function toggleFavorite(cocktail: Cocktail) {
    const index = favorites.value.findIndex(
      (fav) => fav.idDrink === cocktail.idDrink
    );
    if (index === -1) {
      favorites.value.push(cocktail);
    } else {
      favorites.value.splice(index, 1);
    }
  }

  function isFavorite(cocktailId: string): boolean {
    return favorites.value.some((fav) => fav.idDrink === cocktailId);
  }

  // --- PERSISTENCE ---
  // Watch for changes in the favorites array and save to localStorage
  watch(
    favorites,
    (newFavorites) => {
      localStorage.setItem("favoriteCocktails", JSON.stringify(newFavorites));
    },
    { deep: true } // 'deep' is important to watch for changes inside the array
  );

  // Expose the state, getters, and actions for components to use.
  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
});
