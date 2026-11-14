const crypto = require("crypto");
const Order = require("../models/order");
const express = require("express");
const Razorpay = require("razorpay");
const products = require("../config/productCatalog");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE RAZORPAY ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty"
      });
    }

    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = products[item.productId];
      const quantity = Number(item.quantity);

      if (
        !product ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity"
        });
      }

      const itemTotal = product.price * quantity;

      totalAmount += itemTotal;

      const size = Number(item.size);

      if (![6, 7, 8, 9, 10, 11].includes(size)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shoe size"
        });
      }

      verifiedItems.push({
        productId: String(item.productId),
        name: product.name,
        price: product.price,
        quantity,
        size
      });
    }

    if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount"
      });
    }

    // Razorpay accepts amount in paise
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `GL${Date.now()}`
    });

    // Save pending order in MongoDB
    const newOrder = await Order.create({
      items: verifiedItems,
      customer: {
        name: customer?.name,
        email: customer?.email,
        phone: customer?.phone,
        address: customer?.address
      },
      totalAmount,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Razorpay order created",
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment order"
    });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    // Find the order in our own database
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Verify signature using the order ID stored in our database
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order.razorpayOrderId + "|" + razorpay_payment_id)
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpay_signature, "hex");
    const generatedBuffer = Buffer.from(generatedSignature, "hex");

    if (
      signatureBuffer.length !== generatedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, generatedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed"
      });
    }

    // Fetch actual payment details directly from Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    // Confirm payment belongs to this order
    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== order.totalAmount * 100 ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match the order"
      });
    }

    // Only captured payments can be marked as paid
    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured yet",
        paymentStatus: payment.status
      });
    }

    // Handle repeated verification safely
    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          order
        });
      }

      return res.status(409).json({
        success: false,
        message: "This order has already been paid"
      });
    }

    // Update order only after all checks pass
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "paid";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and captured successfully",
      order
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment"
    });
  }
});

module.exports = router;
