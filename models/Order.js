import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        foodItem: {
          ref: 'foodItem',
          type: Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = models.order || model('order', orderSchema);
