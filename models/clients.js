const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const clientsSchema = new Schema(
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
    company: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const Client = mongoose.model("Client", clientsSchema);
module.exports = Client;
