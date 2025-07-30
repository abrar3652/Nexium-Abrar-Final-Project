import mongoose from 'mongoose';

  const recipeSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Linked to Supabase auth.uid()
    title: { type: String, required: true },
    ingredients: { type: [String], required: true }, // Array of ingredients
    instructions: { type: String, required: true },
    cuisine: { type: String },
    dietaryFilters: { type: [String] }, // e.g., ['vegan', 'gluten-free']
    generatedAt: { type: Date, default: Date.now }, // For history tracking
    updatedAt: { type: Date, default: Date.now },
  });

  const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
  export default Recipe;