const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

userSchema.virtual("clients", {
  ref: "Client",
  localField: "_id",
  foreignField: "sellerId",
});

userSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "seller",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
