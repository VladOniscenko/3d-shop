// src/routes/orders.ts
import { Router } from "express";

const router = Router();

// GET /api/orders/my-orders
// Fetches all orders for the currently logged-in user
router.get("/my-orders", (req, res) => {
  // Logic to fetch orders from your database goes here
  const fakeOrders = [
    { id: "1", status: "printing", totalPrice: 24.5 },
    { id: "2", status: "pending_quote" },
  ];

  res.json(fakeOrders);
});

// POST /api/orders/request-quote
// Handles the form submission from your "Get a Quote" page
router.post("/request-quote", (req, res) => {
  const { projectName, details, fileUrl } = req.body;

  // 1. Validate the incoming data
  if (!projectName || !details) {
    return res
      .status(400)
      .json({ error: "Project name and details are required." });
  }

  // 2. Save to database (Placeholder)
  const newOrder = {
    id: Math.random().toString(36).substr(2, 9),
    projectName,
    details,
    fileUrl,
    status: "pending_quote",
    createdAt: new Date(),
  };

  // 3. Send success response back to React
  res.status(201).json({
    message: "Quote request received! We will email you shortly.",
    order: newOrder,
  });
});

export default router;
