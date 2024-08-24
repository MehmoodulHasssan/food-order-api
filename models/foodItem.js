import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const foodItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

export const foodItem = models.foodItems || model('foodItem', foodItemSchema);
