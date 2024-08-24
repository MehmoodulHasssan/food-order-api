// import mongoose from 'mongoose';
// import { UserSchema } from './User.js';

// const { Schema, model, models } = mongoose;

// const adminSchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   price: {
//     type: String,
//     required: true,
//   },
//   quantity: {
//     type: Number,
//     required: true,
//   },
//   image: {
//     type: String,
//     required: true,
//   },
// });

// const OrdersSchema = new Schema({

//   // customerDetails: {
//   //   fullName: {
//   //     type: String,
//   //     required: [true],
//   //   },
//   //   email: {
//   //     type: String,
//   //     required: [true],
//   //   },
//   //   city: {
//   //     type: String,
//   //     required: true,
//   //   },
//   //   address: {
//   //     type: String,
//   //     required: true,
//   //   },
//   //   phone: {
//   //     type: String,
//   //     required: true,
//   //   },
//   // },
//   // order: [ItemsSchema],
//   // totalPrice: {
//   //   type: Number,
//   //   required: true,
//   // },
//   // time: {
//   //   type: Date,
//   //   required: true,
//   // },
//   // status: {
//   //   type: String,
//   //   enum: ['pending', 'approved', 'declined'],
//   //   default: 'pending',
//   // },
// });

// const AdminOrders = models.adminorders || model('Adminorders', OrdersSchema);
// export default AdminOrders;
