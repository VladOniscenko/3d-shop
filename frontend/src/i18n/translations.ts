export type SupportedLanguage = "nl" | "en";

export const languageOptions: Array<{
  code: SupportedLanguage;
  label: string;
}> = [
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
];

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.materials": "Materials",
    "nav.gallery": "Products",
    "nav.faq": "FAQ",
    "nav.myOrders": "My Orders",
    "nav.models": "3D Models",
    "nav.admin": "Admin",
    "nav.payments": "Payments",
    "nav.logIn": "Log In",
    "nav.getStarted": "Get Started",
    "nav.newPrint": "New Print",
    "nav.logOut": "Log Out",

    // Footer
    "footer.companyName": "PrintCraft Collective",
    "footer.tagline":
      "Professional 3D printing services for prototypes, parts, and custom projects across the Netherlands.",
    "footer.contact": "Contact",
    "footer.location": "Location",
    "footer.locationValue": "Rotterdam, Netherlands",
    "footer.hours": "Opening Hours",
    "footer.hoursValue": "Mon - Fri, 09:00 - 18:00",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.refunds": "Refund Policy",
    "footer.shippingPolicy": "Shipping Policy",
    "footer.copyright": "© 2026 PrintCraft Collective. All rights reserved.",

    // Home
    "home.footer": "© 2026 PrintCraft Collective. All rights reserved.",
    "home.how.bridgeBadge": "Next Step",
    "home.how.bridgeTitle": "How does it work from idea to delivery?",
    "home.how.bridgeSubtitle":
      "First, understand the simple process so you know exactly what happens after your request.",
    "home.modelFinder.badge": "Model Starter",
    "home.modelFinder.bridgeBadge": "Optional Step",
    "home.modelFinder.bridgeTitle":
      "No model yet? You can browse a few trusted libraries first.",
    "home.modelFinder.bridgeSubtitle":
      "Use this only if you still need a printable file before requesting your quote.",
    "home.modelFinder.title": "Need a 3D model first? Start here",
    "home.modelFinder.subtitle":
      "Explore trusted libraries to find printable files, then upload your favorite model to request a quote.",
    "home.modelFinder.makerworld.title": "MakerWorld",
    "home.modelFinder.makerworld.desc":
      "Curated designs from the Bambu community, organized by printer-friendly quality and trending builds.",
    "home.modelFinder.makerworld.cta": "Browse models",
    "home.modelFinder.printables.title": "Printables",
    "home.modelFinder.printables.desc":
      "A huge model catalog with practical parts, cosplay files, miniatures, and home tools.",
    "home.modelFinder.printables.cta": "Find files",
    "home.modelFinder.thingiverse.title": "Thingiverse",
    "home.modelFinder.thingiverse.desc":
      "Classic open model platform with millions of community uploads and remix-ready projects.",
    "home.modelFinder.thingiverse.cta": "Explore library",
    "home.modelFinder.custom.title": "Need custom help?",
    "home.modelFinder.custom.desc":
      "If you cannot find the right file, describe your idea and we can help turn it into a printable model.",
    "home.modelFinder.custom.cta": "Request a quote",
    "home.proof.bridgeBadge": "Quality Check",
    "home.proof.bridgeTitle": "Now choose finish and quality level.",
    "home.proof.bridgeSubtitle":
      "See available materials and recent prints to set expectations before you request your quote.",

    // Hero
    "hero.titleLine1": "Custom 3D Prints,",
    "hero.titleLine2": "Made to Order",
    "hero.description":
      "Bring your ideas to life with precision prints from our Bambu Lab P2S. We serve customers across the Netherlands.",
    "hero.ctaQuote": "Request a Quote",
    "hero.fastTurnaround": "Fast Turnaround",
    "hero.fastTurnaroundValue": "2-5 business days",
    "hero.highQuality": "High Quality",
    "hero.highQualityValue": "Precision prints",
    "hero.eco": "Eco-Friendly",
    "hero.ecoValue": "Sustainable materials",

    // How it works
    "how.title": "How It Works",
    "how.step1.title": "Request",
    "how.step1.desc": "Upload your 3D file or describe your idea.",
    "how.step2.title": "Review & Quote",
    "how.step2.desc": "We review your file and send a personalized price.",
    "how.step3.title": "We Print",
    "how.step3.desc": "Your order is printed with care on our P2S.",
    "how.step4.title": "Packed & Shipped",
    "how.step4.desc": "We ship your high-quality print to your door.",

    // Materials section
    "materials.title": "Materials & Colors",
    "materials.subtitle": "Premium filaments for your perfect print",
    "materials.loading": "Loading options...",
    "materials.viewAll": "View Full Library",

    // Recent prints
    "recent.title": "Recent Work",
    "recent.subtitle": "Real projects delivered to our community",
    "recent.viewAll": "View Full Catalog",
    "recent.loading": "Loading Showcase",
    "recent.empty": "Portfolio update in progress...",

    // Login
    "login.welcome": "Welcome back",
    "login.subtitle": "Please enter your details to access your account.",
    "login.error.invalid": "Invalid email or password. Please try again.",
    "login.email": "Email address",
    "login.password": "Password",
    "login.remember": "Remember me",
    "login.forgot": "Forgot password?",
    "login.signIn": "Sign in",
    "login.noAccount": "Don't have an account?",
    "login.signUpFree": "Sign up for free",
    "login.visualTitle1": "Bring your digital",
    "login.visualTitle2": "ideas to the real world.",
    "login.visualDesc":
      "Log in to track your orders, upload new designs, and manage your custom 3D printing projects.",
    "login.emailPlaceholder": "you@example.com",
    "login.passwordPlaceholder": "••••••••",

    // Forgot Password
    "forgot.title": "Forgot password",
    "forgot.subtitle":
      "Enter your account email and we will send you a reset link.",
    "forgot.successMessage":
      "If the account exists, a reset email has been sent.",
    "forgot.errorMessage": "Could not send reset email right now.",
    "forgot.emailPlaceholder": "you@example.com",
    "forgot.submitButton": "Send reset email",
    "forgot.rememberPassword": "Remembered your password?",
    "forgot.signIn": "Sign in",

    // Reset Password
    "reset.title": "Reset password",
    "reset.subtitle": "Create a new password for your account.",
    "reset.passwordPlaceholder": "At least 8 characters",
    "reset.confirmPlaceholder": "Repeat password",
    "reset.submitButton": "Reset password",
    "reset.successMessage": "Password updated successfully.",
    "reset.goToLogin": "Go to login",

    // Signup
    "signup.title": "Create an account",
    "signup.subtitle": "Start bringing your 3D ideas to life today.",
    "signup.success": "Account created! Redirecting to login...",
    "signup.error.default":
      "Could not create account. Email might already be in use.",
    "signup.name": "Full Name",
    "signup.namePlaceholder": "Alex Maker",
    "signup.email": "Email address",
    "signup.emailPlaceholder": "you@example.com",
    "signup.passwordPlaceholder": "Create a strong password",
    "signup.submit": "Sign up",
    "signup.haveAccount": "Already have an account?",
    "signup.signIn": "Sign in",
    "signup.visualTitle": "Join the makers.",
    "signup.visualDesc":
      "Create a free account to get instant quotes, save your favorite materials, and track your print history.",

    // Admin - General
    "admin.dashboard": "Dashboard",
    "admin.orders": "Orders",
    "admin.nav.dashboard": "Dashboard",
    "admin.nav.orders": "Orders",
    "admin.nav.payments": "Payments",
    "admin.nav.models": "3D Models",
    "admin.nav.users": "Users",
    "admin.nav.products": "Products",
    "admin.nav.filaments": "Filaments",
    "admin.products": "Products",
    "admin.filaments": "Filaments",
    "admin.users": "Users",
    "admin.loadingDashboard": "Loading dashboard...",
    "admin.noRecentOrders": "No recent orders found.",
    "admin.common.page": "Page",
    "admin.common.of": "of",
    "admin.common.prev": "Prev",
    "admin.common.next": "Next",

    "models.title": "3D Model Files",
    "models.subtitle": "Browse all uploaded STL, OBJ, 3MF and STEP files.",
    "models.refresh": "Refresh",
    "models.searchPlaceholder": "Search by filename or extension",
    "models.count": "Visible files",
    "models.loading": "Loading model files...",
    "models.empty": "No 3D model files found.",
    "models.open": "Open",
    "models.order": "Order",
    "models.view3d": "Bekijk 3D",
    "models.delete": "Delete",
    "models.deleting": "Deleting...",
    "models.backToFiles": "Back to files",
    "models.deleteConfirm": "Delete this file? This cannot be undone.",
    "models.deleteFailed": "Could not delete file.",
    "models.cleanupOrphans": "Cleanup Orphans",
    "models.cleanupRunning": "Cleaning...",
    "models.cleanupConfirm":
      "Delete all orphan model files (not linked to products or orders)?",
    "models.cleanupNone": "No orphan model files found.",
    "models.cleanupDone": "Cleanup completed. Deleted {count} files.",
    "models.cleanupFailed": "Could not cleanup orphan files.",
    "models.deleteBlocked":
      "Cannot delete: file is linked to a product or an active order.",
    "models.loadFailed": "Could not load model files.",
    "models.table.file": "File",
    "models.table.type": "Type",
    "models.table.size": "Size",
    "models.table.updated": "Updated",
    "models.table.action": "Action",

    "admin.payments.title": "Payment Tracking",
    "admin.payments.searchPlaceholder": "Reference or provider payment id",
    "admin.payments.providerPlaceholder": "Provider",
    "admin.payments.loading": "Loading payments...",
    "admin.payments.noMatches": "No payments match your filters.",
    "admin.payments.columnCreated": "Created",
    "admin.payments.columnOrder": "Order",
    "admin.payments.columnReference": "Reference",
    "admin.payments.columnProviderPaymentId": "Provider Payment ID",
    "admin.payments.columnStatus": "Status",
    "admin.payments.columnAmount": "Amount",
    "admin.payments.columnWebhookAttempts": "Webhook Attempts",
    "admin.payments.status.all": "All statuses",
    "admin.payments.status.paid": "Paid",
    "admin.payments.status.failed": "Failed",
    "admin.payments.status.expired": "Expired",
    "admin.payments.status.canceled": "Canceled",
    "admin.payments.status.pending": "Pending",
    "admin.payments.status.open": "Open",
    "admin.payments.reconcileNow": "Reconcile pending payments",
    "admin.payments.reconciling": "Reconciling...",
    "admin.payments.reconcileSuccess": "Pending payment reconciliation completed.",
    "admin.payments.reconcileAlreadyRunning":
      "Reconciliation is already running.",
    "admin.payments.reconcileFailed":
      "Could not run reconciliation right now.",

    "admin.dashboard.title": "Admin Dashboard",
    "admin.dashboard.overviewSubtitle":
      "Live overview of orders, revenue, traffic and stock.",
    "admin.dashboard.groupOrderFlow": "Order flow",
    "admin.dashboard.groupSalesQuality": "Sales quality",
    "admin.dashboard.groupOrderVelocity": "Order velocity",
    "admin.dashboard.groupInventorySnapshot": "Inventory snapshot",
    "admin.dashboard.loadError":
      "Unable to load admin dashboard data. Are you authorized?",
    "admin.dashboard.totalUsers": "Total Users",
    "admin.dashboard.totalOrders": "Total Orders",
    "admin.dashboard.pendingOrders": "Pending Orders",
    "admin.dashboard.paidOrders": "Paid Orders",
    "admin.dashboard.quotedOrders": "Quoted Orders",
    "admin.dashboard.printingOrders": "Printing Orders",
    "admin.dashboard.sentOrders": "Sent Orders",
    "admin.dashboard.deliveredOrders": "Delivered Orders",
    "admin.dashboard.completedOrders": "Completed Orders",
    "admin.dashboard.cancelledOrders": "Cancelled Orders",
    "admin.dashboard.orders24h": "Orders (24h)",
    "admin.dashboard.orders7d": "Orders (7d)",
    "admin.dashboard.orders30d": "Orders (30d)",
    "admin.dashboard.uniqueCustomers": "Unique Customers",
    "admin.dashboard.totalItemQty": "Total Item Qty",
    "admin.dashboard.avgItemsPerOrder": "Avg Items / Order",
    "admin.dashboard.quotedRevenue": "Quoted Revenue",
    "admin.dashboard.paidRevenue": "Paid Revenue",
    "admin.dashboard.avgQuoteValue": "Avg Quote Value",
    "admin.dashboard.products": "Products",
    "admin.dashboard.filamentSkus": "Filament SKUs",
    "admin.dashboard.inStockFilaments": "In-stock Filaments",
    "admin.dashboard.lowStockFilaments": "Low-stock Filaments",
    "admin.dashboard.outOfStockFilaments": "Out-of-stock Filaments",
    "admin.dashboard.materials": "Materials",
    "admin.dashboard.avgFilamentPricePerGram": "Avg Filament Price/g",
    "admin.dashboard.recentOrders": "Recent Orders",
    "admin.dashboard.hintRegisteredAccounts": "Registered accounts",
    "admin.dashboard.hintAllTime": "All time",
    "admin.dashboard.hintNeedsAction": "Needs review/action",
    "admin.dashboard.hintConfirmedPayments": "Confirmed payments",
    "admin.dashboard.hintQuoteSent": "Quote sent",
    "admin.dashboard.hintInProduction": "In production",
    "admin.dashboard.hintShipped": "Shipped",
    "admin.dashboard.hintReachedCustomer": "Reached customer",
    "admin.dashboard.hintCompletedLifecycle": "Completed lifecycle",
    "admin.dashboard.hintCancelledByAdminUser": "Cancelled by admin/user",
    "admin.dashboard.hintLastDay": "Last day",
    "admin.dashboard.hintLastWeek": "Last week",
    "admin.dashboard.hintLastMonth": "Last month",
    "admin.dashboard.hintCustomersWithOrders": "Customers with orders",
    "admin.dashboard.hintUnitsAcrossOrders": "Units across all orders",
    "admin.dashboard.hintOperationalComplexity": "Operational complexity",
    "admin.dashboard.hintSumQuotedPrices": "Sum of quoted prices",
    "admin.dashboard.hintRevenuePaidOrders": "Revenue from paid orders",
    "admin.dashboard.hintAverageQuotedOrder": "Average quoted order",
    "admin.dashboard.hintCatalogSize": "Catalog size",
    "admin.dashboard.hintMaterialColorEntries": "Material-color entries",
    "admin.dashboard.hintAvailableNow": "Available right now",
    "admin.dashboard.hintOneToHundred": "1-100 units",
    "admin.dashboard.hintNeedsRestock": "Needs restock",
    "admin.dashboard.hintDistinctFilamentMaterials":
      "Distinct filament materials",
    "admin.dashboard.hintAcrossFilamentSkus": "Across filament SKUs",
    "admin.dashboard.trafficTitle": "Traffic Analytics",
    "admin.dashboard.trafficSubtitle":
      "Track page views over time, live visitors, and user locations.",
    "admin.dashboard.liveVisitorsNow": "Live Visitors",
    "admin.dashboard.viewsLast14Days": "Views (14 days)",
    "admin.dashboard.viewsLast12Months": "Views (12 months)",
    "admin.dashboard.viewsLast5Years": "Views (5 years)",
    "admin.dashboard.dailyViews": "Daily views (views / unique)",
    "admin.dashboard.monthlyViews": "Monthly views (views / unique)",
    "admin.dashboard.yearlyViews": "Yearly views (views / unique)",
    "admin.dashboard.trafficDetailsToggle": "Show detailed traffic breakdown",
    "admin.dashboard.topCountries": "Top Countries (30d)",
    "admin.dashboard.topCities": "Top Cities (30d)",
    "admin.dashboard.noLocationData": "No location data available yet.",
    "admin.dashboard.locationsTracked": "Countries tracked",
    "admin.dashboard.hintLastFiveMinutes": "Last 5 minutes",
    "admin.dashboard.hintAggregatedDaily": "Sum across daily buckets",
    "admin.dashboard.hintAggregatedMonthly": "Sum across monthly buckets",
    "admin.dashboard.hintAggregatedYearly": "Sum across yearly buckets",

    "admin.orders.managementTitle": "Order Management",
    "admin.orders.statusAll": "All",
    "admin.orders.sort.createdAt": "createdAt",
    "admin.orders.sort.status": "status",
    "admin.orders.sort.quotedPrice": "quotedPrice",
    "admin.orders.sortLabel": "Sort",
    "admin.orders.notAvailable": "n/a",

    "admin.users.managementTitle": "User Management",
    "admin.users.totalLabel": "Total",
    "admin.users.refreshButton": "Refresh",
    "admin.users.userUpdated": "User updated.",
    "admin.users.updateFailed": "Could not update user.",

    "admin.products.catalogTitle": "Product Catalog Admin",
    "admin.products.loadFailed": "Could not load products.",
    "admin.products.priceNegative": "Price cannot be negative.",
    "admin.products.discountRangeError": "Discount must be between 0 and 90.",
    "admin.products.stockNegative": "Stock cannot be negative.",
    "admin.products.created": "Product created.",
    "admin.products.createFailed":
      "Could not create product. Ensure you are admin.",
    "admin.products.confirmDelete": "Delete this product?",
    "admin.products.deleted": "Product deleted.",
    "admin.products.deleteFailed": "Could not delete product.",
    "admin.products.noImage": "No image",
    "admin.products.activeState": "Active",
    "admin.products.inactiveState": "Inactive",
    "admin.products.deleting": "Deleting...",

    "admin.productEdit.title": "Edit Product",
    "admin.productEdit.loadingCrumb": "Loading...",
    "admin.productEdit.missingCrumb": "Missing",
    "admin.productEdit.backToList": "Back to list",
    "admin.productEdit.missingProductId": "Missing product id.",
    "admin.productEdit.nameCategoryRequired": "Name and category are required.",
    "admin.productEdit.updated": "Product updated.",
    "admin.productEdit.updateFailed": "Could not update product.",
    "admin.productEdit.noImagesConfigured":
      "No images configured for this product yet.",
    "admin.productEdit.saveProduct": "Save Product",

    "admin.filaments.managementTitle": "Filament Management",
    "admin.filaments.loadFailed": "Could not load filaments.",
    "admin.filaments.added": "Filament added.",
    "admin.filaments.createFailed":
      "Could not create filament. Ensure you are admin.",
    "admin.filaments.requiredFields": "Name, material and color are required.",
    "admin.filaments.priceStockNegative": "Price and stock cannot be negative.",
    "admin.filaments.notFound": "Filament not found.",
    "admin.filaments.updated": "Filament updated.",
    "admin.filaments.updateAuthError":
      "You must be logged in as admin to update filaments.",
    "admin.filaments.notFoundServer": "Filament not found on server.",
    "admin.filaments.updateFailed": "Could not update filament.",
    "admin.filaments.confirmDelete": "Delete this filament?",
    "admin.filaments.deleted": "Filament deleted.",
    "admin.filaments.deleteAuthError":
      "You must be logged in as admin to delete filaments.",
    "admin.filaments.deleteFailed": "Could not delete filament.",

    "admin.order.quoteExpires": "Quote Expires",
    "admin.order.actionFlowTitle": "Recommended Action Flow",
    "admin.order.loading": "Loading...",
    "admin.order.titlePrefix": "Order",
    "admin.order.checkOk": "OK",
    "admin.order.checkTodo": "TODO",
    "admin.order.actionFlow.checks.allItemPricesSet": "All item prices set",
    "admin.order.actionFlow.checks.shippingDetailsComplete":
      "Shipping details complete",
    "admin.order.actionFlow.checks.quoteMessagePresent":
      "Quote message present",
    "admin.order.actionFlow.checks.paymentAttemptExists":
      "Payment attempt exists",
    "admin.order.actionFlow.checks.paidPaymentConfirmed":
      "Paid payment confirmed",
    "admin.order.actionFlow.checks.trackingCodeAdded": "Tracking code added",
    "admin.order.actionFlow.pendingQuote.title":
      "Prepare quote before customer confirmation",
    "admin.order.actionFlow.pendingQuote.steps.reviewModels":
      "Review uploaded model files and customer instructions carefully.",
    "admin.order.actionFlow.pendingQuote.steps.setItemPrice":
      "Set price per item based on complexity, print time, and material.",
    "admin.order.actionFlow.pendingQuote.steps.setDeliveryPrice":
      "Set delivery price and apply discount only if needed.",
    "admin.order.actionFlow.pendingQuote.steps.addQuoteMessage":
      "Add a clear quote message; shipping details can be collected later.",
    "admin.order.actionFlow.pendingQuote.steps.sendQuoteConfirmation":
      "Send quote confirmation and update status to Quoted.",
    "admin.order.actionFlow.quoted.title": "Await customer payment",
    "admin.order.actionFlow.quoted.steps.keepPricingStable":
      "Keep pricing stable unless customer requests a revision.",
    "admin.order.actionFlow.quoted.steps.monitorExpiry":
      "Monitor quote expiry date and payment attempts.",
    "admin.order.actionFlow.quoted.steps.waitForPayment":
      "Do not start production before payment is confirmed.",
    "admin.order.actionFlow.quoted.steps.repriceIfChanged":
      "If changes are requested, move back to Pending Quote and reprice.",
    "admin.order.actionFlow.expiredQuote.title":
      "Quote expired, request refresh",
    "admin.order.actionFlow.expiredQuote.steps.noFulfillment":
      "Do not print or ship while quote is expired.",
    "admin.order.actionFlow.expiredQuote.steps.requestRefresh":
      "Ask customer to request a new quote from their order page.",
    "admin.order.actionFlow.expiredQuote.steps.recalculate":
      "Re-check model scope, recalculate pricing, and send updated quote.",
    "admin.order.actionFlow.pendingPayment.title": "Payment in progress",
    "admin.order.actionFlow.pendingPayment.steps.checkAttempts":
      "Check payment attempts and webhook result in payment history.",
    "admin.order.actionFlow.pendingPayment.steps.proceedWhenPaid":
      "If paid is confirmed, move forward with production flow.",
    "admin.order.actionFlow.pendingPayment.steps.returnToQuote":
      "If payment fails or expires, return to quote flow.",
    "admin.order.actionFlow.paid.title": "Ready to start production",
    "admin.order.actionFlow.paid.steps.confirmPayment":
      "Confirm payment amount/reference and selected print specs.",
    "admin.order.actionFlow.paid.steps.confirmCapacity":
      "Confirm printer availability and material stock.",
    "admin.order.actionFlow.paid.steps.startProduction":
      "Start production and update status to Printing.",
    "admin.order.actionFlow.printing.title": "Production and shipment prep",
    "admin.order.actionFlow.printing.steps.completeQualityChecks":
      "Complete print and quality checks before packaging.",
    "admin.order.actionFlow.printing.steps.createLabel":
      "Create shipping label and enter track and trace.",
    "admin.order.actionFlow.printing.steps.sendTracking":
      "Send tracking email and update status to Sent or Shipped.",
    "admin.order.actionFlow.shipped.title": "In transit follow-up",
    "admin.order.actionFlow.shipped.steps.verifyTracking":
      "Ensure tracking code and URL are correct.",
    "admin.order.actionFlow.shipped.steps.monitorCarrier":
      "Monitor carrier updates and delivery confirmation.",
    "admin.order.actionFlow.shipped.steps.markDelivered":
      "Update status to Delivered when handoff is confirmed.",
    "admin.order.actionFlow.delivered.title": "Post-delivery completion",
    "admin.order.actionFlow.delivered.steps.confirmDelivery":
      "Confirm delivery with tracking evidence.",
    "admin.order.actionFlow.delivered.steps.handleSupport":
      "Handle support issues if customer reports problems.",
    "admin.order.actionFlow.delivered.steps.closeOrder":
      "Close order as Completed when no pending actions remain.",
    "admin.order.actionFlow.completed.title": "Order closed",
    "admin.order.actionFlow.completed.steps.noActionRequired":
      "No operational action required.",
    "admin.order.actionFlow.completed.steps.reopenIfNeeded":
      "Only reopen status if a verified correction is needed.",
    "admin.order.actionFlow.failed.title": "Resolve payment or process failure",
    "admin.order.actionFlow.failed.steps.reviewErrors":
      "Review payment errors and communication history.",
    "admin.order.actionFlow.failed.steps.contactCustomer":
      "Contact customer with clear next steps.",
    "admin.order.actionFlow.failed.steps.returnFlow":
      "If customer retries, move back to quote/payment flow.",
    "admin.order.actionFlow.cancelled.title": "Order cancelled",
    "admin.order.actionFlow.cancelled.steps.noFulfillment":
      "No fulfillment action should be taken.",
    "admin.order.actionFlow.cancelled.steps.documentReason":
      "Keep cancellation reason documented in notes.",
    "admin.order.actionFlow.default.title": "Review order before next action",
    "admin.order.actionFlow.default.steps.checkDetails":
      "Check order details, pricing, and payment history.",
    "admin.order.actionFlow.default.steps.selectAfterChecks":
      "Select the next status only after prerequisites are verified.",
    "admin.order.suggestedNextStatus": "Suggested next status",
    "admin.order.expiresOn": "Expires on",
    "admin.order.noQuoteExpiry": "No quote expiry date recorded.",
    "admin.order.quoteExpiredHelp":
      "Quote expired after 7 days. Set status to Pending Quote for a refreshed quote cycle.",
    "admin.order.paymentAttempts": "Payment Attempts",
    "admin.order.paymentSearchPlaceholder": "Search reference or provider ID",
    "admin.order.noPaymentAttempts": "No payment attempts yet.",
    "admin.order.noPaymentAttemptsFiltered":
      "No payment attempts match current filters.",
    "admin.order.webhookAttempts": "Attempts",
    "admin.order.providerId": "Provider ID",
    "admin.order.payloadHash": "Payload hash",
    "admin.order.lastError": "Last error",
    "admin.order.statusUpdated": "Order status updated.",
    "admin.order.statusUpdateFailed": "Could not update order status.",
    "admin.order.trackingRequired": "Tracking code is required.",
    "admin.order.trackingSaved": "Tracking saved on order.",
    "admin.order.trackingSaveFailed": "Could not save tracking details.",
    "admin.order.itemPriceUpdated": "Item price updated.",
    "admin.order.itemPriceUpdateFailed": "Could not update item price.",
    "admin.order.deliveryPriceUpdated": "Delivery price updated.",
    "admin.order.deliveryPriceUpdateFailed": "Could not update delivery price.",
    "admin.order.discountNegative": "Order discount cannot be negative.",
    "admin.order.discountUpdated": "Order discount updated.",
    "admin.order.discountUpdateFailed": "Could not update order discount.",
    "admin.order.deleted": "Order deleted.",
    "admin.order.deleteFailed": "Could not delete order.",
    "admin.order.notesSaved": "Notes saved.",
    "admin.order.notesSaveFailed": "Could not save notes.",
    "admin.order.customerUpdated": "Customer info updated.",
    "admin.order.customerUpdateFailed": "Could not update customer info.",
    "admin.order.trackingRequiredForEmail":
      "Tracking code is required for sent email.",
    "admin.order.emailSent": "Email sent to customer.",
    "admin.order.emailSendFailed": "Could not send customer email.",

    // Admin - Orders
    "admin.orders.title": "Orders",
    "admin.orders.searchPlaceholder": "Search orders...",
    "admin.orders.loading": "Loading orders...",
    "admin.orders.noMatches": "No matching orders.",
    "admin.orders.columnProject": "Project",
    "admin.orders.columnCustomer": "Customer",
    "admin.orders.columnStatus": "Status",
    "admin.orders.columnQuoted": "Quoted",
    "admin.orders.columnCreated": "Created",

    // Admin - Order (Detail Page)
    "admin.order.customerInfoTitle": "Customer Information",
    "admin.order.customerCancel": "Cancel",
    "admin.order.customerEdit": "Edit",
    "admin.order.fullNameLabel": "Full Name",
    "admin.order.fullNamePlaceholder": "Full Name",
    "admin.order.addressLine1Label": "Address Line 1",
    "admin.order.addressLine1Placeholder": "Address Line 1",
    "admin.order.addressLine2Label": "Address Line 2",
    "admin.order.addressLine2Placeholder": "Address Line 2 (optional)",
    "admin.order.cityLabel": "City",
    "admin.order.cityPlaceholder": "City",
    "admin.order.postalCodeLabel": "Postal Code",
    "admin.order.postalCodePlaceholder": "Postal Code",
    "admin.order.phoneNumberLabel": "Phone Number",
    "admin.order.phoneNumberPlaceholder": "Phone Number",
    "admin.order.saveButton": "Save Customer Info",
    "admin.order.orderActionsTitle": "Order Actions",
    "admin.order.updateStatusButton": "Update Status",
    "admin.order.deleteOrderButton": "Delete Order",
    "admin.order.deleteConfirmMessage":
      "Are you sure you want to delete this order? This action cannot be undone.",
    "admin.order.cancelButton": "Cancel",
    "admin.order.deleteConfirmButton": "Delete",
    "admin.order.trackingTitle": "Track & Trace",
    "admin.order.trackingCodeLabel": "Tracking Code",
    "admin.order.trackingCodePlaceholder": "e.g. 3SPQ123456789",
    "admin.order.trackingUrlLabel": "Tracking URL (optional)",
    "admin.order.trackingUrlPlaceholder": "https://carrier.example/track/...",
    "admin.order.savingButton": "Saving...",
    "admin.order.saveTrackingButton": "Save Tracking",
    "admin.order.communicationTitle": "Send Email to Customer",
    "admin.order.emailTypeLabel": "Email Type",
    "admin.order.emailTypeQuote": "Quote Requested",
    "admin.order.emailTypeConfirmation": "Quote Confirmation + Price",
    "admin.order.emailTypeTracking": "Order Sent + Track & Trace",
    "admin.order.emailConfirmationNote":
      "This email includes the quoted price and final order details.",
    "admin.order.emailTrackingNote":
      "This email includes tracking information for the shipped order.",
    "admin.order.sendingButton": "Sending...",
    "admin.order.sendEmailButton": "Send Email",
    "admin.order.notesTitle": "Notes",
    "admin.order.internalNotesLabel": "Internal Notes",
    "admin.order.customerNotesLabel": "Customer Notes",
    "admin.order.saveNotesButton": "Save Notes",
    "admin.order.internalNotesPlaceholder":
      "Add an internal note for admins/workers...",
    "admin.order.customerNotesPlaceholder":
      "Add a note visible to the customer...",
    "admin.order.addInternalNoteButton": "Add Internal Note",
    "admin.order.addCustomerNoteButton": "Add Customer Note",
    "admin.order.deleteNoteButton": "Delete note",
    "admin.order.noInternalNotes": "No internal notes yet.",
    "admin.order.noCustomerNotes": "No customer notes yet.",
    "admin.order.noteContentRequired": "Please enter note content.",
    "admin.order.noteAdded": "Note added.",
    "admin.order.noteAddFailed": "Could not add note.",
    "admin.order.noteDeleted": "Note deleted.",
    "admin.order.noteDeleteFailed": "Could not delete note.",
    "admin.order.legacyNoteLabel": "Legacy note",
    "admin.order.messagingTitle": "Messaging",
    "admin.order.quoteLabel": "Quote",
    "admin.order.noneValue": "None",
    "admin.order.notFoundTitle": "Order not found",
    "admin.order.notFoundLink": "Back to orders",
    "admin.orderDetail.modelFilesTitle": "Model files & specs",
    "admin.orderDetail.itemLabel": "Item",
    "admin.orderDetail.fileLabel": "File",
    "admin.orderDetail.noItemsMessage": "No items in this order.",
    "admin.orderDetail.materialLabel": "Material",
    "admin.orderDetail.colorLabel": "Color",
    "admin.orderDetail.qtyLabel": "Qty",
    "admin.orderDetail.priceLabel": "Price",
    "admin.orderDetail.instructionsLabel": "Instructions",
    "admin.orderDetail.downloadFile": "Download/Preview file",
    "admin.orderDetail.viewModel": "View 3D model",
    "admin.orderDetail.filesRemovedDueCancellation":
      "Files were removed due to cancellation.",
    "admin.orderDetail.deliveryLabel": "Delivery",
    "admin.orderDetail.orderDiscountLabel": "Order discount",
    "admin.orderDetail.savingButton": "Saving...",
    "admin.orderDetail.saveButton": "Save",
    "admin.orderDetail.pricingLockedMessage":
      "Pricing is locked after payment or production progress.",
    "admin.orderDetail.subtotalLabel": "Subtotal",
    "admin.orderDetail.totalIncludingDeliveryLabel":
      "Total (including delivery)",
    "admin.orderDetail.statusHistoryTitle": "Status History",
    "admin.orderDetail.noStatusChangesMessage":
      "No status changes recorded yet.",
    "admin.orderDetail.changedAtColumn": "Changed At",
    "admin.orderDetail.fromColumn": "From",
    "admin.orderDetail.toColumn": "To",
    "admin.orderDetail.byColumn": "By",
    "admin.orderDetail.noteColumn": "Note",
    "admin.orderDetail.communicationHistoryTitle": "Communication History",
    "admin.orderDetail.noCommunicationMessage":
      "No communication has been sent yet.",
    "admin.orderDetail.sentAtColumn": "Sent At",
    "admin.orderDetail.typeColumn": "Type",
    "admin.orderDetail.channelColumn": "Channel",
    "admin.orderDetail.recipientColumn": "Recipient",
    "admin.orderDetail.subjectColumn": "Subject",
    "orderDetail.customerNotesTitle": "Notes from PrintCraft",
    "admin.orderDetail.statusLabel": "Status",
    "admin.orderDetail.createdLabel": "Created",
    "admin.orderDetail.itemsLabel": "Items",
    "admin.orderDetail.totalLabel": "Total",
    "breadcrumb.admin": "Admin",
    "breadcrumb.orders": "Orders",

    // Admin - Order Detail
    "admin.orderDetail.status": "Status",
    "admin.orderDetail.created": "Created",
    "admin.orderDetail.items": "Items",
    "admin.orderDetail.total": "Total",
    "admin.orderDetail.customerInfo": "Customer info",
    "admin.orderDetail.fullName": "Full Name",
    "admin.orderDetail.fullNamePlaceholder": "Full Name",
    "admin.orderDetail.addressLine1": "Address Line 1",
    "admin.orderDetail.addressLine1Placeholder": "Address Line 1",
    "admin.orderDetail.addressLine2": "Address Line 2",
    "admin.orderDetail.addressLine2Placeholder": "Address Line 2",
    "admin.orderDetail.city": "City",
    "admin.orderDetail.cityPlaceholder": "City",
    "admin.orderDetail.postalCode": "Postal Code",
    "admin.orderDetail.postalCodePlaceholder": "Postal Code",
    "admin.orderDetail.phoneNumber": "Phone Number",
    "admin.orderDetail.phoneNumberPlaceholder": "Phone Number",
    "admin.orderDetail.orderActions": "Order Actions",
    "admin.orderDetail.trackingAndTrace": "Track and Trace",
    "admin.orderDetail.trackingCode": "Tracking Code",
    "admin.orderDetail.trackingCodePlaceholder": "e.g. 3SPQ123456789",
    "admin.orderDetail.trackingUrl": "Tracking URL (optional)",
    "admin.orderDetail.trackingUrlPlaceholder":
      "https://carrier.example/track/...",
    "admin.orderDetail.communication": "Communication",
    "admin.orderDetail.communicationTypeQuoteRequested": "Quote Requested",
    "admin.orderDetail.communicationTypeQuoteConfirmation":
      "Quote Confirmation + Price",
    "admin.orderDetail.communicationTypeOrderSentTracking":
      "Order Sent + Track and Trace",
    "admin.orderDetail.internalNotes": "Internal Notes",
    "admin.orderDetail.internalNotesLabel": "Internal Notes",
    "admin.orderDetail.customerNotes": "Customer Notes",
    "admin.orderDetail.customerNotesLabel": "Customer Notes",
    "admin.orderDetail.modelFiles": "Model files & specs",
    "admin.orderDetail.noItems": "No items in this order.",
    "admin.orderDetail.material": "Material:",
    "admin.orderDetail.color": "Color:",
    "admin.orderDetail.qty": "Qty:",
    "admin.orderDetail.price": "Price: EUR",
    "admin.orderDetail.delivery": "Delivery: EUR",
    "admin.orderDetail.discount": "Order discount: EUR",
    "admin.orderDetail.statusHistory": "Status History",
    "admin.orderDetail.noStatusChanges": "No status changes recorded yet.",
    "admin.orderDetail.changedAt": "Changed At",
    "admin.orderDetail.from": "From",
    "admin.orderDetail.to": "To",
    "admin.orderDetail.by": "By",
    "admin.orderDetail.note": "Note",
    "admin.orderDetail.communicationHistory": "Communication History",
    "admin.orderDetail.noCommunication": "No communication has been sent yet.",
    "admin.orderDetail.sentAt": "Sent At",
    "admin.orderDetail.type": "Type",
    "admin.orderDetail.channel": "Channel",
    "admin.orderDetail.recipient": "Recipient",
    "admin.orderDetail.subject": "Subject",

    // Admin - Products
    "admin.products.title": "Products",
    "admin.products.nameLabel": "Name",
    "admin.products.namePlaceholder": "Name",
    "admin.products.categoryLabel": "Category",
    "admin.products.categoryPlaceholder": "Category",
    "admin.products.productTypeLabel": "Product Type",
    "admin.products.descriptionLabel": "Description",
    "admin.products.descriptionPlaceholder": "Describe the product",
    "admin.products.imagesLabel": "Product Images",
    "admin.products.modelFileLabel": "Model File",
    "admin.products.priceLabel": "Price",
    "admin.products.pricePlaceholder": "Price",
    "admin.products.discountLabel": "Discount (%)",
    "admin.products.discountPlaceholder": "0",
    "admin.products.trackInventoryLabel": "Track Inventory",
    "admin.products.trackInventoryYes": "Yes",
    "admin.products.trackInventoryNo": "No",
    "admin.products.stockQuantityLabel": "Stock Quantity",
    "admin.products.stockQuantityPlaceholder": "0",
    "admin.products.activeLabel": "Active",
    "admin.products.activeYes": "Yes",
    "admin.products.activeNo": "No",
    "admin.products.addButton": "Add Product",
    "admin.products.loadingMessage": "Loading products...",
    "admin.products.tablePreview": "Preview",
    "admin.products.tableName": "Name",
    "admin.products.tableType": "Type",
    "admin.products.tableCategory": "Category",
    "admin.products.tablePrice": "Price",
    "admin.products.tableStatus": "Status",
    "admin.products.tableActions": "Actions",
    "admin.products.noProducts": "No products found.",
    "admin.products.edit": "Edit",
    "admin.products.delete": "Delete",
    "admin.products.loadingProduct": "Loading product...",
    "admin.products.productNotFound": "Product not found.",
    "admin.products.finalPrice": "Final Price",
    "admin.products.imagesUrlLabel": "Images",
    "admin.products.imagePlaceholder": "Paste image URL and click Add",
    "admin.products.addImageButton": "Add",
    "admin.products.imagesTextarea": "One image URL per line",

    // Admin - Filaments
    "admin.filaments.title": "Filaments",
    "admin.filaments.nameLabel": "Name",
    "admin.filaments.namePlaceholder": "Name",
    "admin.filaments.materialLabel": "Material",
    "admin.filaments.materialPlaceholder": "Material",
    "admin.filaments.colorLabel": "Color",
    "admin.filaments.colorPlaceholder": "Color",
    "admin.filaments.priceLabel": "Price Per Gram",
    "admin.filaments.pricePlaceholder": "Price Per Gram",
    "admin.filaments.stockLabel": "Stock Quantity",
    "admin.filaments.stockPlaceholder": "Stock Quantity",
    "admin.filaments.addButton": "Add Filament",
    "admin.filaments.descriptionLabel": "Description",
    "admin.filaments.descriptionPlaceholder": "Description",
    "admin.filaments.loadingMessage": "Loading filaments...",
    "admin.filaments.tableName": "Name",
    "admin.filaments.tableMaterial": "Material",
    "admin.filaments.tableColor": "Color",
    "admin.filaments.tablePrice": "Price",
    "admin.filaments.tableStock": "Stock",
    "admin.filaments.tableActions": "Actions",

    // Admin - Users
    "admin.users.title": "Users",
    "admin.users.searchPlaceholder": "Search users by name/email",
    "admin.users.editUserSection": "Edit User",
    "admin.users.nameLabel": "Name",
    "admin.users.namePlaceholder": "Name",
    "admin.users.emailLabel": "Email",
    "admin.users.emailPlaceholder": "Email",
    "admin.users.roleLabel": "Role",
    "admin.users.roleCustomer": "Customer",
    "admin.users.roleAdmin": "Admin",
    "admin.users.saveButton": "Save",
    "admin.users.columnName": "Name",
    "admin.users.columnEmail": "Email",
    "admin.users.columnRole": "Role",
    "admin.users.columnActions": "Actions",
    "admin.users.noUsers": "No users found.",

    // Quote page
    "quote.materialPlaceholder": "PLA, PETG, ABS, Nylon...",
    "quote.colorPlaceholder": "Black, White, Red, Transparent...",
    "quote.addDescription": "Add Description",

    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle":
      "Got questions about 3D printing, shipping, or materials? We have got you covered.",
    "faq.contactText": "Still can't find the answer you're looking for?",
    "faq.contactCta": "Send us a message",
    "faq.q1": "What type of 3D files do you accept?",
    "faq.a1":
      "We accept the most common 3D files: .STL, .OBJ, and .3MF. If you have a different file type from your design software, you can usually use the Export or Save As option to convert it before uploading.",
    "faq.q2": "How much does a custom print cost?",
    "faq.a2":
      "Price depends on size, infill, and material. Use Get a Quote for an exact no-hidden-fee price.",
    "faq.q3": "How long will it take to get my item?",
    "faq.a3":
      "Usually we print and ship within 2 to 5 business days. Shipping depends on location.",
    "faq.q4": "I have an idea but no 3D file. Can you help?",
    "faq.a4":
      "Yes. Share sketches or references and we can help create a printable model.",
    "faq.q5": "Are printed parts food-safe?",
    "faq.a5":
      "Standard printed plastics are usually not recommended for direct food contact. We can advise safer finishing options when needed.",
    "faq.q6": "What if my print arrives damaged?",
    "faq.a6":
      "If your item arrives damaged or with major issues, send a photo within 3 days and we will reprint and reship it.",

    // Gallery
    "gallery.title": "Product Catalog",
    "gallery.subtitle":
      "Choose a model from our collection to start your next project.",
    "gallery.loading": "Syncing Gallery",
    "gallery.added": "Added!",
    "gallery.adding": "Adding...",
    "gallery.addToCart": "Add to Cart",
    "gallery.emptyTitle": "Archive Empty",
    "gallery.emptyDesc": "Check back later for new prints.",
    "gallery.viewInCart": "View in Cart",
    "gallery.loginFirst": "Please log in first to add items to your cart.",
    "gallery.addFailed": "Failed to add to cart. Please try again.",
    "gallery.catalogTitle": "Product Catalog",
    "gallery.catalogSubtitle":
      "Explore ready-to-order prints today and filament products tomorrow.",
    "gallery.searchPlaceholder": "Search products, categories, or types",
    "gallery.categoryAll": "All categories",
    "gallery.typeAll": "All types",
    "gallery.typePrint": "3D Print",
    "gallery.typeFilament": "Filament",
    "gallery.typeOther": "Other",
    "gallery.discountedOnly": "Discounted only",
    "gallery.inStockOnly": "In stock only",
    "gallery.itemsLabel": "items",
    "gallery.viewDetails": "View details",
    "gallery.stockIn": "In stock:",
    "gallery.stockOut": "Out of stock",
    "gallery.madeToOrder": "Made to order",
    "gallery.noProductsTitle": "No products found",
    "gallery.noProductsDesc": "Try adjusting filters or search keywords.",
    "gallery.sortNewest": "Newest",
    "gallery.sortPriceLowHigh": "Price: low to high",
    "gallery.sortPriceHighLow": "Price: high to low",
    "gallery.sortName": "Name",
    "gallery.sortDiscountHigh": "Highest discount",

    // Product detail
    "productDetail.back": "Back",
    "productDetail.notFound": "Product not found.",
    "productDetail.backToCatalog": "Back to catalog",
    "productDetail.noDescription": "No description available yet.",
    "productDetail.openModelFile": "Open model file",
    "productDetail.continueBrowsing": "Continue browsing",
    "productDetail.added": "Product added to cart.",
    "productDetail.unavailable": "Out of stock",
    "productDetail.unavailableError": "This product is currently out of stock.",

    // Materials page
    "materials.pageTitle": "Materials Library",
    "materials.pageSubtitle":
      "High-quality filaments for every project, from decorative models to functional parts.",
    "materials.pageLoading": "Loading materials...",
    "materials.stock": "in stock",
    "materials.ctaDesc":
      "We can order specialty filaments like Wood, Carbon Fiber, or Glow-in-the-dark for large projects.",
    "materials.ctaButton": "Start Your Project",
    "materials.footer":
      "© 2026 PrintCraft Collective. Professional 3D Printing Services.",

    // Quote
    "quote.title": "Request a Quote",
    "quote.subtitle": "Upload models and choose from our live inventory.",
    "quote.models": "Your 3D Models",
    "quote.addFile": "Add Files",
    "quote.guestContactTitle": "Contact details",
    "quote.guestContactSubtitle":
      "Not logged in? No problem. Add your contact details and we will create an account for you automatically.",
    "quote.guestEmail": "Email",
    "quote.guestRequiredName": "Please enter your full name.",
    "quote.guestRequiredEmail": "Please enter your email address.",
    "quote.guestInvalidEmail": "Please enter a valid email address.",
    "quote.guestSubmittedTitle": "Quote request sent",
    "quote.guestSubmittedBody":
      "Thanks! We received your request and will email you once your quote is ready.",
    "quote.guestSubmittedReference": "Reference:",
    "quote.guestAccountCreatedTitle": "Account created",
    "quote.guestAccountCreatedBody":
      "We created your customer account and sent you an email to set your password. Once that is done, you can log in to see your quote history.",
    "quote.guestAccountCreatedHint":
      "Check your inbox for the password setup link, then log in to continue.",
    "quote.noFiles": "No files added yet.",
    "quote.dragDropHint": "Drag and drop files here",
    "quote.allowedFilesInline":
      "Allowed files: STL, OBJ, 3MF, STEP, STP (max 50 MB).",
    "quote.shipping": "Shipping Info",
    "quote.submit": "Submit Quote Request",
    "quote.secure": "Safe & Secure 3D Printing",
    "quote.uploadUnsupportedType": "Unsupported file type.",
    "quote.uploadFailed": "Upload failed. Please try again.",
    "quote.uploadPartialFailed":
      "Some files could not be uploaded. Please review and try again.",
    "quote.invalidShipping": "Please fix shipping info before submitting.",
    "quote.submitFailed": "Failed to submit quote. Check your connection.",
    "quote.materialAvailabilityDisclaimer":
      "Requested materials or colors may not always be available. We will confirm suitable alternatives with you if needed.",
    "quote.material": "Material",
    "quote.color": "Color",
    "quote.quantity": "Quantity",
    "quote.notesPlaceholder": "Instructions (Infill, layer height, etc.)",
    "quote.fullName": "Full Name",
    "quote.phone": "Phone Number",
    "quote.street": "Street Address",
    "quote.city": "City",
    "quote.textDescription": "Text Description",
    "quote.postalCode": "Postal Code",
    "quote.shippingLaterNotice":
      "Shipping details are requested after your quote is approved, when you click confirm and pay.",
    "quote.pricingDisclaimer":
      "Prices and quotes shown on this platform are indicative. No rights can be derived from displayed prices or quotes until explicitly confirmed by PrintCraft.",

    // Cart
    "cart.loading": "Loading cart...",
    "cart.empty": "Cart is empty",
    "cart.emptyDesc": "Browse the gallery to find something to print.",
    "cart.goGallery": "Go to Gallery",
    "cart.finalize": "Finalize Order",
    "cart.review": "Review Items",
    "cart.material": "Material",
    "cart.color": "Color",
    "cart.quantity": "Quantity",
    "cart.paymentMethod": "Payment Method",
    "cart.paymentOnline": "Online Payment (Stripe)",
    "cart.paymentOptions": "iDEAL, Credit Card, Bancontact, etc.",
    "cart.summary": "Summary",
    "cart.subtotal": "Subtotal",
    "cart.delivery": "Delivery",
    "cart.total": "Total",
    "cart.shipping": "Shipping",
    "cart.processing": "Processing...",
    "cart.payStripe": "Pay with Stripe",
    "cart.checkoutFailed":
      "Something went wrong. Please check your address and try again.",
    "cart.conflict":
      "Your cart was updated elsewhere. Please refresh your cart and try again.",

    // Order statuses
    "orderStatus.pendingQuote": "Pending Quote",
    "orderStatus.quoted": "Quoted",
    "orderStatus.expiredQuote": "Expired Quote",
    "orderStatus.pendingPayment": "Pending Payment",
    "orderStatus.printing": "Printing",
    "orderStatus.completed": "Completed",
    "orderStatus.shipped": "Shipped",
    "orderStatus.sent": "Sent",
    "orderStatus.delivered": "Delivered",
    "orderStatus.paid": "Paid",
    "orderStatus.failed": "Failed",
    "orderStatus.cancelled": "Cancelled",

    // Orders
    "orders.title": "My Projects",
    "orders.subtitle": "Track your 3D printing requests and shipping status.",
    "orders.loading": "Loading your order history...",
    "orders.none": "No projects yet",
    "orders.noneDesc":
      "Upload your 3D designs to get a custom price quote from our shop.",
    "orders.start": "Start New Project",
    "orders.model": "Model",
    "orders.models": "Models",
    "orders.shippingTo": "Shipping to",
    "orders.manage": "Manage Project",
    "orders.project": "Project",
    "orders.placedOn": "Placed on",

    // Not Found
    "notFound.title": "This page got lost in the print queue",
    "notFound.description":
      "The page you requested does not exist or has been moved. Head back home and start a new 3D print project.",
    "notFound.backHome": "Back to home",
    "notFound.goBack": "Go back",
    "notFound.loadingModel": "Loading 3D model...",

    // Order detail
    "orderDetail.paymentAttempts": "Payment Attempts",
    "orderDetail.notFound": "Order not found",
    "orderDetail.back": "Back to Projects",
    "orderDetail.deleteQuote": "Delete Quote",
    "orderDetail.modelsInProject": "3D Models in this Project",
    "orderDetail.viewModel": "View 3D",
    "orderDetail.filesRemovedDueCancellation":
      "Files were removed due to cancellation.",
    "orderDetail.timeline": "Project Timeline",
    "orderDetail.quoteRequested": "Quote Requested",
    "orderDetail.printing": "Printing",
    "orderDetail.completed": "Completed",
    "orderDetail.pending": "Pending",
    "orderDetail.shippingDetails": "Shipping Details",
    "orderDetail.noPhone": "No phone provided",
    "orderDetail.toBeCalculated": "To be calculated",
    "orderDetail.pendingQuote": "Pending Quote",
    "orderDetail.subtotal": "Subtotal",
    "orderDetail.delivery": "Delivery",
    "orderDetail.serviceFee": "Service Fee",
    "orderDetail.discount": "Discount",
    "orderDetail.total": "Total",
    "orderDetail.status": "Status",
    "orderDetail.referenceId": "Reference ID",
    "orderDetail.confirmPay": "Confirm + Pay",
    "orderDetail.requestNewQuote": "Request New Quote",
    "orderDetail.newQuoteRequested": "New quote request sent.",
    "orderDetail.newQuoteRequestFailed": "Could not request a new quote.",
    "orderDetail.quoteExpiresOn": "Quote expires on",
    "orderDetail.quoteExpiredInfo":
      "This quote has expired after 7 days. Request a new quote to continue.",
    "orderDetail.shippingModalTitle": "Confirm Shipping Details",
    "orderDetail.shippingModalSubtitle":
      "We need your delivery address before continuing to payment.",
    "orderDetail.shippingModalCheckout": "Checkout",
    "orderDetail.shippingModalStarting": "Starting checkout...",
    "orderDetail.paymentStartFailed":
      "Could not start payment. Please try again.",
    "orderDetail.paymentSyncSuccess": "Payment status updated.",
    "orderDetail.paymentSyncPending":
      "Payment is still processing. Refresh this page shortly.",
    "orderDetail.paymentCancelled": "Payment was canceled.",
    "orderDetail.noPaymentAttempts": "No payment attempts yet.",
    "modelViewer.title": "3D Model Viewer",
    "modelViewer.backToOrder": "Back to order",
    "modelViewer.download": "Download file",
    "modelViewer.loading": "Loading 3D model...",
    "modelViewer.notFound": "Model not found for this order item.",
    "modelViewer.orderItem": "Order item",
    "modelViewer.unnamed": "Untitled model",
    "modelViewer.previewUnavailable":
      "Preview is unavailable for this file type.",
    "modelViewer.previewUnavailableHint":
      "You can still download and open the file in a CAD viewer.",

    // Legal pages
    "legal.updated": "Last updated: 27 March 2026",
    "legal.contact.title": "Legal Contact",
    "legal.contact.body":
      "For legal or privacy questions, email info@printcraft.nl. We aim to respond within 5 business days.",
    "legal.privacy.title": "Privacy Policy",
    "legal.privacy.section1Title": "What we collect",
    "legal.privacy.section1Body":
      "We collect data needed to operate our service: account details, contact information, shipping address, payment status, and uploaded model files.",
    "legal.privacy.section2Title": "How we use your data",
    "legal.privacy.section2Body":
      "We use your data for quote calculation, production planning, shipping, customer support, fraud prevention, and operational communication. We do not sell personal data.",
    "legal.privacy.section3Title": "Data retention",
    "legal.privacy.section3Body":
      "Order and invoice records are stored as required for accounting and legal obligations. Non-essential data can be removed on verified request.",
    "legal.privacy.section4Title": "Your rights",
    "legal.privacy.section4Body":
      "You can request access, correction, deletion, or export of personal data, subject to legal retention requirements.",
    "legal.terms.title": "Terms of Service",
    "legal.terms.section1Title": "Service scope",
    "legal.terms.section1Body":
      "By submitting files, you confirm that you own or are authorized to use them and that they do not violate laws or third-party rights.",
    "legal.terms.section2Title": "Quotes and orders",
    "legal.terms.section2Body":
      "Quotes are customized estimates based on model size, quantity, material choice, print complexity, and finishing requirements. Production starts only after explicit approval and confirmed payment.",
    "legal.terms.pricingDisclaimerTitle": "Prices and quote validity",
    "legal.terms.pricingDisclaimerBody":
      "Indicative prices shown on the website are guidance only. Final pricing may differ per request because size, quantity, geometry, support usage, post-processing, and delivery method can change actual cost. Displayed prices and draft quotes are non-binding; rights only arise after written quote confirmation by PrintCraft.",
    "legal.terms.section3Title": "Limitation of liability",
    "legal.terms.section3Body":
      "Customers are responsible for functional suitability and safety of uploaded designs. Our liability is limited to the value of the specific order where legally allowed.",
    "legal.terms.section4Title": "Governing law",
    "legal.terms.section4Body":
      "These terms are governed by Dutch law. Disputes are handled by the competent court in the Netherlands unless mandatory consumer law states otherwise.",
    "legal.refunds.title": "Refund Policy",
    "legal.refunds.section1Title": "Damaged or defective items",
    "legal.refunds.section1Body":
      "If an item arrives damaged or has major production defects, contact us within 3 days with photos. We will assess and offer a reprint or refund where appropriate.",
    "legal.refunds.section2Title": "Custom-made products",
    "legal.refunds.section2Body":
      "Because each print is produced on request and often unique in size and quantity, approved custom orders are generally non-refundable unless there is a clear manufacturing error.",
    "legal.refunds.section3Title": "Cancellation",
    "legal.refunds.section3Body":
      "Quotes can be canceled before production starts. Once production has started, cancellation is usually no longer possible.",
    "legal.refunds.section4Title": "Exclusions",
    "legal.refunds.section4Body":
      "Color variation, minor surface artifacts, or dimensional tolerances within normal 3D-print limits are not treated as defects.",
    "legal.shipping.title": "Shipping Policy",
    "legal.shipping.section1Title": "Processing time",
    "legal.shipping.section1Body":
      "Most orders are produced and prepared for shipment within 2 to 5 business days, depending on queue, complexity, material availability, and ordered quantity.",
    "legal.shipping.section2Title": "Delivery area",
    "legal.shipping.section2Body":
      "We deliver across the Netherlands. For fixed-price checkout products, shipping fees are shown at checkout. For quote-based orders, delivery costs are included or specified in the quote and may vary by package size, weight, quantity, and destination.",
    "legal.shipping.section3Title": "Tracking",
    "legal.shipping.section3Body":
      "When available, tracking details are shared after dispatch so you can follow delivery progress.",
    "legal.shipping.section4Title": "Delays and risk",
    "legal.shipping.section4Body":
      "Carrier delays may occur outside our control. Risk transfers at delivery unless mandatory consumer law provides otherwise.",

    // SEO
    "seo.default.title": "3D Print Service Netherlands | PrintCraft",
    "seo.default.description":
      "Professional 3D print service for the whole Netherlands. Upload your model and receive a fast quote.",
    "seo.default.keywords":
      "3D print service Netherlands, 3D printing Netherlands, online 3D print service, custom 3D printing",
    "seo.home.title": "3D Print Service Netherlands | PrintCraft",
    "seo.home.description":
      "Professional 3D print service for prototypes, parts and custom prints across the Netherlands.",
    "seo.home.keywords":
      "3D print service Netherlands, 3D printing Netherlands, custom 3D print service",
    "seo.gallery.title": "3D Print Model Gallery | PrintCraft Netherlands",
    "seo.gallery.description":
      "Browse popular 3D print models and start your order from anywhere in the Netherlands.",
    "seo.gallery.keywords":
      "3D model printing, 3D print gallery, 3D print Netherlands",
    "seo.materials.title": "3D Print Materials (PLA, PETG) | PrintCraft NL",
    "seo.materials.description":
      "Choose the right 3D print material and color for your project. Live filament overview.",
    "seo.materials.keywords":
      "PLA printing, PETG printing, 3D filament Netherlands",
    "seo.faq.title": "3D Printing FAQ | PrintCraft Netherlands",
    "seo.faq.description":
      "Frequently asked questions about lead times, materials, prices and quality.",
    "seo.faq.keywords": "3D print FAQ Netherlands, 3D printing questions",
    "seo.notFound.title": "Page Not Found | PrintCraft 3D Print Service",
    "seo.notFound.description":
      "The requested page could not be found. Return to PrintCraft to start your next 3D print project.",
    "seo.notFound.keywords": "404, page not found, PrintCraft",
  },
  nl: {
    // Navbar
    "nav.home": "Home",
    "nav.materials": "Materialen",
    "nav.gallery": "Producten",
    "nav.faq": "FAQ",
    "nav.myOrders": "Mijn Orders",
    "nav.models": "3D Modellen",
    "nav.admin": "Admin",
    "nav.payments": "Betalingen",
    "nav.logIn": "Inloggen",
    "nav.getStarted": "Start Nu",
    "nav.newPrint": "Nieuwe Print",
    "nav.logOut": "Uitloggen",

    // Footer
    "footer.companyName": "PrintCraft Collective",
    "footer.tagline":
      "Professionele 3D-printservice voor prototypes, onderdelen en maatwerkprojecten in heel Nederland.",
    "footer.contact": "Contact",
    "footer.location": "Locatie",
    "footer.locationValue": "Rotterdam, Nederland",
    "footer.hours": "Openingstijden",
    "footer.hoursValue": "Ma - Vr, 09:00 - 18:00",
    "footer.privacy": "Privacybeleid",
    "footer.terms": "Algemene Voorwaarden",
    "footer.refunds": "Retour- en Terugbetaalbeleid",
    "footer.shippingPolicy": "Verzendbeleid",
    "footer.copyright":
      "© 2026 PrintCraft Collective. Alle rechten voorbehouden.",

    // Home
    "home.footer": "© 2026 PrintCraft Collective. Alle rechten voorbehouden.",
    "home.how.bridgeBadge": "Volgende Stap",
    "home.how.bridgeTitle": "Hoe werkt het van idee tot levering?",
    "home.how.bridgeSubtitle":
      "Begrijp eerst het eenvoudige proces, zodat je precies weet wat er gebeurt na je aanvraag.",
    "home.modelFinder.badge": "Model Startpunt",
    "home.modelFinder.bridgeBadge": "Optionele Stap",
    "home.modelFinder.bridgeTitle":
      "Nog geen model? Bekijk eerst een paar betrouwbare bibliotheken.",
    "home.modelFinder.bridgeSubtitle":
      "Gebruik dit alleen als je nog een printbaar bestand nodig hebt voordat je je offerte aanvraagt.",
    "home.modelFinder.title": "Eerst een 3D-model nodig? Begin hier",
    "home.modelFinder.subtitle":
      "Ontdek betrouwbare bibliotheken om printbare bestanden te vinden en upload daarna je favoriete model voor een offerte.",
    "home.modelFinder.makerworld.title": "MakerWorld",
    "home.modelFinder.makerworld.desc":
      "Geselecteerde ontwerpen uit de Bambu-community, met focus op printkwaliteit en populaire builds.",
    "home.modelFinder.makerworld.cta": "Bekijk modellen",
    "home.modelFinder.printables.title": "Printables",
    "home.modelFinder.printables.desc":
      "Een grote modelcatalogus met praktische onderdelen, cosplay-bestanden, miniaturen en tools.",
    "home.modelFinder.printables.cta": "Zoek bestanden",
    "home.modelFinder.thingiverse.title": "Thingiverse",
    "home.modelFinder.thingiverse.desc":
      "Klassiek open modelplatform met miljoenen community-uploads en remixbare projecten.",
    "home.modelFinder.thingiverse.cta": "Verken bibliotheek",
    "home.modelFinder.custom.title": "Hulp nodig op maat?",
    "home.modelFinder.custom.desc":
      "Kun je het juiste bestand niet vinden? Beschrijf je idee en wij helpen je naar een printbaar model.",
    "home.modelFinder.custom.cta": "Vraag offerte aan",
    "home.proof.bridgeBadge": "Kwaliteitscheck",
    "home.proof.bridgeTitle": "Kies nu afwerking en kwaliteitsniveau.",
    "home.proof.bridgeSubtitle":
      "Bekijk beschikbare materialen en recente prints om de verwachtingen goed te zetten voordat je je offerte aanvraagt.",

    // Hero
    "hero.titleLine1": "Maatwerk 3D Prints,",
    "hero.titleLine2": "Op Bestelling Gemaakt",
    "hero.description":
      "Breng je idee tot leven met nauwkeurige prints op onze Bambu Lab P2S. Wij leveren door heel Nederland.",
    "hero.ctaQuote": "Vraag een Offerte Aan",
    "hero.fastTurnaround": "Snelle Levering",
    "hero.fastTurnaroundValue": "2-5 werkdagen",
    "hero.highQuality": "Hoge Kwaliteit",
    "hero.highQualityValue": "Nauwkeurige prints",
    "hero.eco": "Duurzaam",
    "hero.ecoValue": "Milieuvriendelijke materialen",

    // How it works
    "how.title": "Hoe Het Werkt",
    "how.step1.title": "Aanvraag",
    "how.step1.desc": "Upload je 3D-bestand of beschrijf je idee.",
    "how.step2.title": "Controle & Offerte",
    "how.step2.desc":
      "We controleren je bestand en sturen een persoonlijke prijs.",
    "how.step3.title": "Wij Printen",
    "how.step3.desc": "Je bestelling wordt zorgvuldig geprint op onze P2S.",
    "how.step4.title": "Verpakt & Verzonden",
    "how.step4.desc": "We verzenden je hoogwaardige print naar je adres.",

    // Materials section
    "materials.title": "Materialen & Kleuren",
    "materials.subtitle": "Premium filamenten voor jouw perfecte print",
    "materials.loading": "Opties laden...",
    "materials.viewAll": "Bekijk Volledige Bibliotheek",

    // Recent prints
    "recent.title": "Recent Werk",
    "recent.subtitle": "Echte projecten geleverd aan onze klanten",
    "recent.viewAll": "Bekijk Volledige Catalogus",
    "recent.loading": "Showcase laden",
    "recent.empty": "Portfolio wordt bijgewerkt...",

    // Login
    "login.welcome": "Welkom terug",
    "login.subtitle":
      "Vul je gegevens in om toegang te krijgen tot je account.",
    "login.error.invalid":
      "Ongeldig e-mailadres of wachtwoord. Probeer opnieuw.",
    "login.email": "E-mailadres",
    "login.password": "Wachtwoord",
    "login.remember": "Onthoud mij",
    "login.forgot": "Wachtwoord vergeten?",
    "login.signIn": "Inloggen",
    "login.noAccount": "Nog geen account?",
    "login.signUpFree": "Gratis registreren",
    "login.visualTitle1": "Breng je digitale",
    "login.visualTitle2": "ideeën tot leven.",
    "login.visualDesc":
      "Log in om je orders te volgen, nieuwe ontwerpen te uploaden en je 3D-printprojecten te beheren.",
    "login.emailPlaceholder": "you@example.com",
    "login.passwordPlaceholder": "••••••••",

    // Forgot Password
    "forgot.title": "Wachtwoord vergeten",
    "forgot.subtitle": "Vul je e-mailadres in en wij sturen je een resetlink.",
    "forgot.successMessage":
      "Indien het account bestaat, is een reset-e-mail verzonden.",
    "forgot.errorMessage": "Kon reset-e-mail nu niet verzenden.",
    "forgot.emailPlaceholder": "you@example.com",
    "forgot.submitButton": "Stuur reset-e-mail",
    "forgot.rememberPassword": "Wachtwoord onthouden?",
    "forgot.signIn": "Inloggen",

    // Reset Password
    "reset.title": "Wachtwoord resetten",
    "reset.subtitle": "Maak een nieuw wachtwoord voor je account.",
    "reset.passwordPlaceholder": "Minimaal 8 tekens",
    "reset.confirmPlaceholder": "Herhaal wachtwoord",
    "reset.submitButton": "Wachtwoord resetten",
    "reset.successMessage": "Wachtwoord succesvol bijgewerkt.",
    "reset.goToLogin": "Ga naar inloggen",

    // Signup
    "signup.title": "Maak een account",
    "signup.subtitle": "Begin vandaag met het realiseren van je 3D-ideeën.",
    "signup.success":
      "Account aangemaakt! Je wordt doorgestuurd naar inloggen...",
    "signup.error.default":
      "Kon account niet aanmaken. Het e-mailadres is mogelijk al in gebruik.",
    "signup.name": "Volledige naam",
    "signup.namePlaceholder": "Alex Maker",
    "signup.email": "E-mailadres",
    "signup.emailPlaceholder": "you@example.com",
    "signup.passwordPlaceholder": "Maak een sterk wachtwoord",
    "signup.submit": "Registreren",
    "signup.haveAccount": "Heb je al een account?",
    "signup.signIn": "Inloggen",
    "signup.visualTitle": "Word ook maker.",
    "signup.visualDesc":
      "Maak gratis een account aan voor snelle offertes, favoriete materialen en orderhistorie.",

    // Admin - General
    "admin.dashboard": "Dashboard",
    "admin.orders": "Orders",
    "admin.nav.dashboard": "Dashboard",
    "admin.nav.orders": "Orders",
    "admin.nav.payments": "Betalingen",
    "admin.nav.models": "3D Modellen",
    "admin.nav.users": "Gebruikers",
    "admin.nav.products": "Producten",
    "admin.nav.filaments": "Filamenten",
    "admin.products": "Producten",
    "admin.filaments": "Filamenten",
    "admin.users": "Gebruikers",
    "admin.loadingDashboard": "Dashboard laden...",
    "admin.noRecentOrders": "Geen recente orders gevonden.",
    "admin.common.page": "Pagina",
    "admin.common.of": "van",
    "admin.common.prev": "Vorige",
    "admin.common.next": "Volgende",

    "models.title": "3D-modelbestanden",
    "models.subtitle":
      "Bekijk alle geuploade STL-, OBJ-, 3MF- en STEP-bestanden.",
    "models.refresh": "Vernieuwen",
    "models.searchPlaceholder": "Zoek op bestandsnaam of extensie",
    "models.count": "Zichtbare bestanden",
    "models.loading": "3D-modelbestanden laden...",
    "models.empty": "Geen 3D-modelbestanden gevonden.",
    "models.open": "Openen",
    "models.order": "Order",
    "models.view3d": "Bekijk 3D",
    "models.delete": "Verwijderen",
    "models.deleting": "Verwijderen...",
    "models.backToFiles": "Terug naar bestanden",
    "models.deleteConfirm":
      "Dit bestand verwijderen? Dit kan niet ongedaan worden gemaakt.",
    "models.deleteFailed": "Bestand kon niet worden verwijderd.",
    "models.cleanupOrphans": "Verwijder verweesde bestanden",
    "models.cleanupRunning": "Bezig met opschonen...",
    "models.cleanupConfirm":
      "Alle verweesde modelbestanden verwijderen (niet gekoppeld aan producten of orders)?",
    "models.cleanupNone": "Geen verweesde modelbestanden gevonden.",
    "models.cleanupDone": "Opschonen voltooid. {count} bestanden verwijderd.",
    "models.cleanupFailed": "Opschonen van verweesde bestanden is mislukt.",
    "models.deleteBlocked":
      "Kan niet verwijderen: bestand is gekoppeld aan een product of actieve order.",
    "models.loadFailed": "Kon 3D-modelbestanden niet laden.",
    "models.table.file": "Bestand",
    "models.table.type": "Type",
    "models.table.size": "Grootte",
    "models.table.updated": "Bijgewerkt",
    "models.table.action": "Actie",

    "admin.payments.title": "Betalingstracking",
    "admin.payments.searchPlaceholder": "Referentie of provider betaal-id",
    "admin.payments.providerPlaceholder": "Provider",
    "admin.payments.loading": "Betalingen laden...",
    "admin.payments.noMatches": "Geen betalingen gevonden met deze filters.",
    "admin.payments.columnCreated": "Aangemaakt",
    "admin.payments.columnOrder": "Order",
    "admin.payments.columnReference": "Referentie",
    "admin.payments.columnProviderPaymentId": "Provider betaal-ID",
    "admin.payments.columnStatus": "Status",
    "admin.payments.columnAmount": "Bedrag",
    "admin.payments.columnWebhookAttempts": "Webhook-pogingen",
    "admin.payments.status.all": "Alle statussen",
    "admin.payments.status.paid": "Betaald",
    "admin.payments.status.failed": "Mislukt",
    "admin.payments.status.expired": "Verlopen",
    "admin.payments.status.canceled": "Geannuleerd",
    "admin.payments.status.pending": "In afwachting",
    "admin.payments.status.open": "Open",
    "admin.payments.reconcileNow": "Openstaande betalingen bijwerken",
    "admin.payments.reconciling": "Bezig met bijwerken...",
    "admin.payments.reconcileSuccess":
      "Bijwerken van openstaande betalingen is voltooid.",
    "admin.payments.reconcileAlreadyRunning":
      "Bijwerken is al bezig.",
    "admin.payments.reconcileFailed":
      "Bijwerken kon nu niet worden uitgevoerd.",

    "admin.dashboard.title": "Admin Dashboard",
    "admin.dashboard.overviewSubtitle":
      "Live overzicht van orders, omzet, verkeer en voorraad.",
    "admin.dashboard.groupOrderFlow": "Orderstroom",
    "admin.dashboard.groupSalesQuality": "Verkoopkwaliteit",
    "admin.dashboard.groupOrderVelocity": "Ordersnelheid",
    "admin.dashboard.groupInventorySnapshot": "Voorraadoverzicht",
    "admin.dashboard.loadError":
      "Kan admin dashboardgegevens niet laden. Ben je geautoriseerd?",
    "admin.dashboard.totalUsers": "Totaal gebruikers",
    "admin.dashboard.totalOrders": "Totaal orders",
    "admin.dashboard.pendingOrders": "Openstaande orders",
    "admin.dashboard.paidOrders": "Betaalde orders",
    "admin.dashboard.quotedOrders": "Geoffreerde orders",
    "admin.dashboard.printingOrders": "Orders in productie",
    "admin.dashboard.sentOrders": "Verzonden orders",
    "admin.dashboard.deliveredOrders": "Afgeleverde orders",
    "admin.dashboard.completedOrders": "Afgeronde orders",
    "admin.dashboard.cancelledOrders": "Geannuleerde orders",
    "admin.dashboard.orders24h": "Orders (24u)",
    "admin.dashboard.orders7d": "Orders (7d)",
    "admin.dashboard.orders30d": "Orders (30d)",
    "admin.dashboard.uniqueCustomers": "Unieke klanten",
    "admin.dashboard.totalItemQty": "Totale itemhoeveelheid",
    "admin.dashboard.avgItemsPerOrder": "Gem. items / order",
    "admin.dashboard.quotedRevenue": "Geoffreerde omzet",
    "admin.dashboard.paidRevenue": "Betaalde omzet",
    "admin.dashboard.avgQuoteValue": "Gem. offertelwaarde",
    "admin.dashboard.products": "Producten",
    "admin.dashboard.filamentSkus": "Filament SKU's",
    "admin.dashboard.inStockFilaments": "Filamenten op voorraad",
    "admin.dashboard.lowStockFilaments": "Filamenten lage voorraad",
    "admin.dashboard.outOfStockFilaments": "Filamenten uit voorraad",
    "admin.dashboard.materials": "Materialen",
    "admin.dashboard.avgFilamentPricePerGram": "Gem. filamentprijs/g",
    "admin.dashboard.recentOrders": "Recente orders",
    "admin.dashboard.hintRegisteredAccounts": "Geregistreerde accounts",
    "admin.dashboard.hintAllTime": "All-time",
    "admin.dashboard.hintNeedsAction": "Actie vereist",
    "admin.dashboard.hintConfirmedPayments": "Bevestigde betalingen",
    "admin.dashboard.hintQuoteSent": "Offerte verstuurd",
    "admin.dashboard.hintInProduction": "In productie",
    "admin.dashboard.hintShipped": "Verzonden",
    "admin.dashboard.hintReachedCustomer": "Aangekomen bij klant",
    "admin.dashboard.hintCompletedLifecycle": "Levenscyclus afgerond",
    "admin.dashboard.hintCancelledByAdminUser":
      "Geannuleerd door admin/gebruiker",
    "admin.dashboard.hintLastDay": "Laatste dag",
    "admin.dashboard.hintLastWeek": "Laatste week",
    "admin.dashboard.hintLastMonth": "Laatste maand",
    "admin.dashboard.hintCustomersWithOrders": "Klanten met orders",
    "admin.dashboard.hintUnitsAcrossOrders": "Eenheden over alle orders",
    "admin.dashboard.hintOperationalComplexity": "Operationele complexiteit",
    "admin.dashboard.hintSumQuotedPrices": "Som van geoffreerde prijzen",
    "admin.dashboard.hintRevenuePaidOrders": "Omzet uit betaalde orders",
    "admin.dashboard.hintAverageQuotedOrder": "Gemiddelde geoffreerde order",
    "admin.dashboard.hintCatalogSize": "Catalogusgrootte",
    "admin.dashboard.hintMaterialColorEntries": "Materiaal-kleur combinaties",
    "admin.dashboard.hintAvailableNow": "Nu beschikbaar",
    "admin.dashboard.hintOneToHundred": "1-100 stuks",
    "admin.dashboard.hintNeedsRestock": "Aanvullen nodig",
    "admin.dashboard.hintDistinctFilamentMaterials":
      "Unieke filamentmaterialen",
    "admin.dashboard.hintAcrossFilamentSkus": "Over alle filament SKU's",
    "admin.dashboard.trafficTitle": "Verkeersanalyse",
    "admin.dashboard.trafficSubtitle":
      "Volg paginabezoeken in de tijd, live bezoekers en gebruikerslocaties.",
    "admin.dashboard.liveVisitorsNow": "Live bezoekers",
    "admin.dashboard.viewsLast14Days": "Weergaven (14 dagen)",
    "admin.dashboard.viewsLast12Months": "Weergaven (12 maanden)",
    "admin.dashboard.viewsLast5Years": "Weergaven (5 jaar)",
    "admin.dashboard.dailyViews": "Dagweergaven (weergaven / uniek)",
    "admin.dashboard.monthlyViews": "Maandweergaven (weergaven / uniek)",
    "admin.dashboard.yearlyViews": "Jaarweergaven (weergaven / uniek)",
    "admin.dashboard.trafficDetailsToggle":
      "Toon gedetailleerde verkeersverdeling",
    "admin.dashboard.topCountries": "Top landen (30d)",
    "admin.dashboard.topCities": "Top steden (30d)",
    "admin.dashboard.noLocationData": "Nog geen locatiedata beschikbaar.",
    "admin.dashboard.locationsTracked": "Getrackte landen",
    "admin.dashboard.hintLastFiveMinutes": "Laatste 5 minuten",
    "admin.dashboard.hintAggregatedDaily": "Som van dagelijkse buckets",
    "admin.dashboard.hintAggregatedMonthly": "Som van maandelijkse buckets",
    "admin.dashboard.hintAggregatedYearly": "Som van jaarlijkse buckets",

    "admin.orders.managementTitle": "Orderbeheer",
    "admin.orders.statusAll": "Alle",
    "admin.orders.sort.createdAt": "createdAt",
    "admin.orders.sort.status": "status",
    "admin.orders.sort.quotedPrice": "quotedPrice",
    "admin.orders.sortLabel": "Sortering",
    "admin.orders.notAvailable": "n.v.t.",

    "admin.users.managementTitle": "Gebruikersbeheer",
    "admin.users.totalLabel": "Totaal",
    "admin.users.refreshButton": "Verversen",
    "admin.users.userUpdated": "Gebruiker bijgewerkt.",
    "admin.users.updateFailed": "Kon gebruiker niet bijwerken.",

    "admin.products.catalogTitle": "Productcatalogus Admin",
    "admin.products.loadFailed": "Kon producten niet laden.",
    "admin.products.priceNegative": "Prijs mag niet negatief zijn.",
    "admin.products.discountRangeError": "Korting moet tussen 0 en 90 liggen.",
    "admin.products.stockNegative": "Voorraad mag niet negatief zijn.",
    "admin.products.created": "Product aangemaakt.",
    "admin.products.createFailed":
      "Kon product niet maken. Controleer adminrechten.",
    "admin.products.confirmDelete": "Dit product verwijderen?",
    "admin.products.deleted": "Product verwijderd.",
    "admin.products.deleteFailed": "Kon product niet verwijderen.",
    "admin.products.noImage": "Geen afbeelding",
    "admin.products.activeState": "Actief",
    "admin.products.inactiveState": "Inactief",
    "admin.products.deleting": "Bezig met verwijderen...",

    "admin.productEdit.title": "Product bewerken",
    "admin.productEdit.loadingCrumb": "Laden...",
    "admin.productEdit.missingCrumb": "Ontbreekt",
    "admin.productEdit.backToList": "Terug naar lijst",
    "admin.productEdit.missingProductId": "Product-id ontbreekt.",
    "admin.productEdit.nameCategoryRequired":
      "Naam en categorie zijn verplicht.",
    "admin.productEdit.updated": "Product bijgewerkt.",
    "admin.productEdit.updateFailed": "Kon product niet bijwerken.",
    "admin.productEdit.noImagesConfigured":
      "Nog geen afbeeldingen voor dit product ingesteld.",
    "admin.productEdit.saveProduct": "Product opslaan",

    "admin.filaments.managementTitle": "Filamentbeheer",
    "admin.filaments.loadFailed": "Kon filamenten niet laden.",
    "admin.filaments.added": "Filament toegevoegd.",
    "admin.filaments.createFailed":
      "Kon filament niet maken. Controleer adminrechten.",
    "admin.filaments.requiredFields":
      "Naam, materiaal en kleur zijn verplicht.",
    "admin.filaments.priceStockNegative":
      "Prijs en voorraad mogen niet negatief zijn.",
    "admin.filaments.notFound": "Filament niet gevonden.",
    "admin.filaments.updated": "Filament bijgewerkt.",
    "admin.filaments.updateAuthError":
      "Je moet als admin ingelogd zijn om filamenten bij te werken.",
    "admin.filaments.notFoundServer": "Filament niet gevonden op server.",
    "admin.filaments.updateFailed": "Kon filament niet bijwerken.",
    "admin.filaments.confirmDelete": "Dit filament verwijderen?",
    "admin.filaments.deleted": "Filament verwijderd.",
    "admin.filaments.deleteAuthError":
      "Je moet als admin ingelogd zijn om filamenten te verwijderen.",
    "admin.filaments.deleteFailed": "Kon filament niet verwijderen.",

    "admin.order.quoteExpires": "Offerte verloopt",
    "admin.order.actionFlowTitle": "Aanbevolen actiestroom",
    "admin.order.loading": "Laden...",
    "admin.order.titlePrefix": "Order",
    "admin.order.checkOk": "OK",
    "admin.order.checkTodo": "TODO",
    "admin.order.actionFlow.checks.allItemPricesSet":
      "Alle itemprijzen zijn ingesteld",
    "admin.order.actionFlow.checks.shippingDetailsComplete":
      "Verzendgegevens compleet",
    "admin.order.actionFlow.checks.quoteMessagePresent":
      "Offertebericht aanwezig",
    "admin.order.actionFlow.checks.paymentAttemptExists":
      "Betaalpoging aanwezig",
    "admin.order.actionFlow.checks.paidPaymentConfirmed":
      "Betaalde betaling bevestigd",
    "admin.order.actionFlow.checks.trackingCodeAdded":
      "Track & trace toegevoegd",
    "admin.order.actionFlow.pendingQuote.title":
      "Bereid de offerte voor voordat de klant bevestigt",
    "admin.order.actionFlow.pendingQuote.steps.reviewModels":
      "Controleer geuploade modelbestanden en klantinstructies zorgvuldig.",
    "admin.order.actionFlow.pendingQuote.steps.setItemPrice":
      "Stel prijs per item in op basis van complexiteit, printtijd en materiaal.",
    "admin.order.actionFlow.pendingQuote.steps.setDeliveryPrice":
      "Stel bezorgkosten in en pas alleen indien nodig korting toe.",
    "admin.order.actionFlow.pendingQuote.steps.addQuoteMessage":
      "Voeg een duidelijke offertetekst toe; verzendgegevens kunnen later worden verzameld.",
    "admin.order.actionFlow.pendingQuote.steps.sendQuoteConfirmation":
      "Verzend offertebevestiging en zet status op Offerte uitgebracht.",
    "admin.order.actionFlow.quoted.title": "Wacht op betaling van klant",
    "admin.order.actionFlow.quoted.steps.keepPricingStable":
      "Houd prijzen stabiel tenzij de klant om een wijziging vraagt.",
    "admin.order.actionFlow.quoted.steps.monitorExpiry":
      "Controleer vervaldatum van offerte en betaalpogingen.",
    "admin.order.actionFlow.quoted.steps.waitForPayment":
      "Start de productie niet voordat betaling is bevestigd.",
    "admin.order.actionFlow.quoted.steps.repriceIfChanged":
      "Bij wijzigingsverzoek: terug naar Offerte in behandeling en herprijs.",
    "admin.order.actionFlow.expiredQuote.title":
      "Offerte verlopen, vraag vernieuwing aan",
    "admin.order.actionFlow.expiredQuote.steps.noFulfillment":
      "Niet printen of verzenden zolang de offerte verlopen is.",
    "admin.order.actionFlow.expiredQuote.steps.requestRefresh":
      "Vraag de klant om vanuit de orderpagina een nieuwe offerte aan te vragen.",
    "admin.order.actionFlow.expiredQuote.steps.recalculate":
      "Controleer scope opnieuw, herbereken prijs en verstuur bijgewerkte offerte.",
    "admin.order.actionFlow.pendingPayment.title": "Betaling in uitvoering",
    "admin.order.actionFlow.pendingPayment.steps.checkAttempts":
      "Controleer betaalpogingen en webhookresultaat in betaalgeschiedenis.",
    "admin.order.actionFlow.pendingPayment.steps.proceedWhenPaid":
      "Ga verder met productieflow zodra betaald is bevestigd.",
    "admin.order.actionFlow.pendingPayment.steps.returnToQuote":
      "Bij mislukte of verlopen betaling: terug naar offerteflow.",
    "admin.order.actionFlow.paid.title": "Klaar om productie te starten",
    "admin.order.actionFlow.paid.steps.confirmPayment":
      "Controleer betaalbedrag/referentie en gekozen printspecificaties.",
    "admin.order.actionFlow.paid.steps.confirmCapacity":
      "Controleer printerbeschikbaarheid en materiaalvoorraad.",
    "admin.order.actionFlow.paid.steps.startProduction":
      "Start productie en zet status op Printen.",
    "admin.order.actionFlow.printing.title":
      "Productie en voorbereiding verzending",
    "admin.order.actionFlow.printing.steps.completeQualityChecks":
      "Rond print- en kwaliteitscontroles af voor het verpakken.",
    "admin.order.actionFlow.printing.steps.createLabel":
      "Maak verzendlabel aan en vul track & trace in.",
    "admin.order.actionFlow.printing.steps.sendTracking":
      "Verstuur trackingmail en zet status op Verzonden.",
    "admin.order.actionFlow.shipped.title": "Opvolging tijdens transport",
    "admin.order.actionFlow.shipped.steps.verifyTracking":
      "Controleer of track & trace-code en URL correct zijn.",
    "admin.order.actionFlow.shipped.steps.monitorCarrier":
      "Volg vervoerdersupdates en afleverbevestiging.",
    "admin.order.actionFlow.shipped.steps.markDelivered":
      "Zet status op Geleverd zodra overdracht is bevestigd.",
    "admin.order.actionFlow.delivered.title": "Afronding na levering",
    "admin.order.actionFlow.delivered.steps.confirmDelivery":
      "Bevestig levering met trackingbewijs.",
    "admin.order.actionFlow.delivered.steps.handleSupport":
      "Behandel supportvragen als klant problemen meldt.",
    "admin.order.actionFlow.delivered.steps.closeOrder":
      "Sluit order als Voltooid wanneer er geen open acties meer zijn.",
    "admin.order.actionFlow.completed.title": "Order gesloten",
    "admin.order.actionFlow.completed.steps.noActionRequired":
      "Geen operationele actie vereist.",
    "admin.order.actionFlow.completed.steps.reopenIfNeeded":
      "Heropen status alleen als een geverifieerde correctie nodig is.",
    "admin.order.actionFlow.failed.title": "Los betaal- of procesfout op",
    "admin.order.actionFlow.failed.steps.reviewErrors":
      "Controleer betaalfouten en communicatiegeschiedenis.",
    "admin.order.actionFlow.failed.steps.contactCustomer":
      "Neem contact op met de klant met duidelijke vervolgstappen.",
    "admin.order.actionFlow.failed.steps.returnFlow":
      "Bij nieuwe poging van klant: terug naar offerte/betaalflow.",
    "admin.order.actionFlow.cancelled.title": "Order geannuleerd",
    "admin.order.actionFlow.cancelled.steps.noFulfillment":
      "Er mag geen fulfillmentactie worden uitgevoerd.",
    "admin.order.actionFlow.cancelled.steps.documentReason":
      "Leg annuleringsreden vast in notities.",
    "admin.order.actionFlow.default.title":
      "Controleer order voor volgende actie",
    "admin.order.actionFlow.default.steps.checkDetails":
      "Controleer orderdetails, prijzen en betaalgeschiedenis.",
    "admin.order.actionFlow.default.steps.selectAfterChecks":
      "Kies volgende status pas nadat vereisten zijn gecontroleerd.",
    "admin.order.suggestedNextStatus": "Aanbevolen volgende status",
    "admin.order.expiresOn": "Verloopt op",
    "admin.order.noQuoteExpiry": "Geen vervaldatum voor offerte vastgelegd.",
    "admin.order.quoteExpiredHelp":
      "Offerte is na 7 dagen verlopen. Zet status op Offerte in behandeling voor een nieuwe offertecyclus.",
    "admin.order.paymentAttempts": "Betaalpogingen",
    "admin.order.paymentSearchPlaceholder": "Zoek referentie of provider-ID",
    "admin.order.noPaymentAttempts": "Nog geen betaalpogingen.",
    "admin.order.noPaymentAttemptsFiltered":
      "Geen betaalpogingen gevonden met de huidige filters.",
    "admin.order.webhookAttempts": "Pogingen",
    "admin.order.providerId": "Provider-ID",
    "admin.order.payloadHash": "Payload-hash",
    "admin.order.lastError": "Laatste fout",
    "admin.order.statusUpdated": "Orderstatus bijgewerkt.",
    "admin.order.statusUpdateFailed": "Kon orderstatus niet bijwerken.",
    "admin.order.trackingRequired": "Volgcode is verplicht.",
    "admin.order.trackingSaved": "Track & trace opgeslagen op order.",
    "admin.order.trackingSaveFailed": "Kon track & trace niet opslaan.",
    "admin.order.itemPriceUpdated": "Itemprijs bijgewerkt.",
    "admin.order.itemPriceUpdateFailed": "Kon itemprijs niet bijwerken.",
    "admin.order.deliveryPriceUpdated": "Leveringsprijs bijgewerkt.",
    "admin.order.deliveryPriceUpdateFailed":
      "Kon leveringsprijs niet bijwerken.",
    "admin.order.discountNegative": "Orderkorting mag niet negatief zijn.",
    "admin.order.discountUpdated": "Orderkorting bijgewerkt.",
    "admin.order.discountUpdateFailed": "Kon orderkorting niet bijwerken.",
    "admin.order.deleted": "Order verwijderd.",
    "admin.order.deleteFailed": "Kon order niet verwijderen.",
    "admin.order.notesSaved": "Notities opgeslagen.",
    "admin.order.notesSaveFailed": "Kon notities niet opslaan.",
    "admin.order.customerUpdated": "Klantgegevens bijgewerkt.",
    "admin.order.customerUpdateFailed": "Kon klantgegevens niet bijwerken.",
    "admin.order.trackingRequiredForEmail":
      "Volgcode is verplicht voor deze e-mail.",
    "admin.order.emailSent": "E-mail naar klant verzonden.",
    "admin.order.emailSendFailed": "Kon e-mail naar klant niet verzenden.",

    // Admin - Orders
    "admin.orders.title": "Orders",
    "admin.orders.searchPlaceholder": "Zoek orders...",
    "admin.orders.loading": "Orders laden...",
    "admin.orders.noMatches": "Geen overeenkomende orders.",
    "admin.orders.columnProject": "Project",
    "admin.orders.columnCustomer": "Klant",
    "admin.orders.columnStatus": "Status",
    "admin.orders.columnQuoted": "Geoffreerd",
    "admin.orders.columnCreated": "Gemaakt",

    // Admin - Order (Detail Page)
    "admin.order.customerInfoTitle": "Klantgegevens",
    "admin.order.customerCancel": "Annuleren",
    "admin.order.customerEdit": "Bewerk",
    "admin.order.fullNameLabel": "Volledige naam",
    "admin.order.fullNamePlaceholder": "Volledige naam",
    "admin.order.addressLine1Label": "Adresregel 1",
    "admin.order.addressLine1Placeholder": "Adresregel 1",
    "admin.order.addressLine2Label": "Adresregel 2",
    "admin.order.addressLine2Placeholder": "Adresregel 2 (optioneel)",
    "admin.order.cityLabel": "Plaats",
    "admin.order.cityPlaceholder": "Plaats",
    "admin.order.postalCodeLabel": "Postcode",
    "admin.order.postalCodePlaceholder": "Postcode",
    "admin.order.phoneNumberLabel": "Telefoonnummer",
    "admin.order.phoneNumberPlaceholder": "Telefoonnummer",
    "admin.order.saveButton": "Klantgegevens Opslaan",
    "admin.order.orderActionsTitle": "Order Acties",
    "admin.order.updateStatusButton": "Status Bijwerken",
    "admin.order.deleteOrderButton": "Order Verwijderen",
    "admin.order.deleteConfirmMessage":
      "Weet je zeker dat je deze order wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.",
    "admin.order.cancelButton": "Annuleren",
    "admin.order.deleteConfirmButton": "Verwijderen",
    "admin.order.trackingTitle": "Track & Trace",
    "admin.order.trackingCodeLabel": "Volgnummer",
    "admin.order.trackingCodePlaceholder": "bv. 3SPQ123456789",
    "admin.order.trackingUrlLabel": "Track & Trace URL (optioneel)",
    "admin.order.trackingUrlPlaceholder": "https://carrier.example/track/...",
    "admin.order.savingButton": "Bezig met opslaan...",
    "admin.order.saveTrackingButton": "Track & Trace Opslaan",
    "admin.order.communicationTitle": "E-mail naar Klant Verzenden",
    "admin.order.emailTypeLabel": "E-mailtype",
    "admin.order.emailTypeQuote": "Offerte Aangevraagd",
    "admin.order.emailTypeConfirmation": "Offerte Bevestiging + Prijs",
    "admin.order.emailTypeTracking": "Order Verzonden + Track & Trace",
    "admin.order.emailConfirmationNote":
      "Deze e-mail bevat de geoffreerde prijs en definitieve ordergegevens.",
    "admin.order.emailTrackingNote":
      "Deze e-mail bevat trackinginformatie voor de verzonden order.",
    "admin.order.sendingButton": "Bezig met verzenden...",
    "admin.order.sendEmailButton": "E-mail Verzenden",
    "admin.order.notesTitle": "Notities",
    "admin.order.internalNotesLabel": "Interne Notities",
    "admin.order.customerNotesLabel": "Klantnotities",
    "admin.order.saveNotesButton": "Notities Opslaan",
    "admin.order.internalNotesPlaceholder":
      "Voeg een interne notitie toe voor admins/medewerkers...",
    "admin.order.customerNotesPlaceholder":
      "Voeg een notitie toe die de klant kan zien...",
    "admin.order.addInternalNoteButton": "Interne notitie toevoegen",
    "admin.order.addCustomerNoteButton": "Klantnotitie toevoegen",
    "admin.order.deleteNoteButton": "Notitie verwijderen",
    "admin.order.noInternalNotes": "Nog geen interne notities.",
    "admin.order.noCustomerNotes": "Nog geen klantnotities.",
    "admin.order.noteContentRequired": "Vul notitie-inhoud in.",
    "admin.order.noteAdded": "Notitie toegevoegd.",
    "admin.order.noteAddFailed": "Notitie toevoegen mislukt.",
    "admin.order.noteDeleted": "Notitie verwijderd.",
    "admin.order.noteDeleteFailed": "Notitie verwijderen mislukt.",
    "admin.order.legacyNoteLabel": "Oude notitie",
    "admin.order.messagingTitle": "Berichten",
    "admin.order.quoteLabel": "Offerte",
    "admin.order.noneValue": "Geen",
    "admin.order.notFoundTitle": "Order niet gevonden",
    "admin.order.notFoundLink": "Terug naar orders",
    "admin.orderDetail.modelFilesTitle": "Modelbestanden & specs",
    "admin.orderDetail.itemLabel": "Item",
    "admin.orderDetail.fileLabel": "Bestand",
    "admin.orderDetail.noItemsMessage": "Geen items in deze order.",
    "admin.orderDetail.materialLabel": "Materiaal",
    "admin.orderDetail.colorLabel": "Kleur",
    "admin.orderDetail.qtyLabel": "Aantal",
    "admin.orderDetail.priceLabel": "Prijs",
    "admin.orderDetail.instructionsLabel": "Instructies",
    "admin.orderDetail.downloadFile": "Bestand Downloaden/Bekijken",
    "admin.orderDetail.viewModel": "Bekijk 3D-model",
    "admin.orderDetail.filesRemovedDueCancellation":
      "In verband met annulering zijn bestanden verwijderd.",
    "admin.orderDetail.deliveryLabel": "Levering",
    "admin.orderDetail.orderDiscountLabel": "Order korting",
    "admin.orderDetail.savingButton": "Bezig met opslaan...",
    "admin.orderDetail.saveButton": "Opslaan",
    "admin.orderDetail.pricingLockedMessage":
      "Prijzen zijn vergrendeld na betaling of productie voortgang.",
    "admin.orderDetail.subtotalLabel": "Subtotaal",
    "admin.orderDetail.totalIncludingDeliveryLabel":
      "Totaal (inclusief levering)",
    "admin.orderDetail.statusHistoryTitle": "Status Geschiedenis",
    "admin.orderDetail.noStatusChangesMessage":
      "Nog geen status wijzigingen geregistreerd.",
    "admin.orderDetail.changedAtColumn": "Gewijzigd op",
    "admin.orderDetail.fromColumn": "Van",
    "admin.orderDetail.toColumn": "Naar",
    "admin.orderDetail.byColumn": "Door",
    "admin.orderDetail.noteColumn": "Notitie",
    "admin.orderDetail.communicationHistoryTitle": "Communicatiegeschiedenis",
    "admin.orderDetail.noCommunicationMessage":
      "Nog geen communicatie verzonden.",
    "admin.orderDetail.sentAtColumn": "Verzonden op",
    "admin.orderDetail.typeColumn": "Type",
    "admin.orderDetail.channelColumn": "Kanaal",
    "admin.orderDetail.recipientColumn": "Ontvanger",
    "admin.orderDetail.subjectColumn": "Onderwerp",
    "orderDetail.customerNotesTitle": "Notities van PrintCraft",
    "admin.orderDetail.statusLabel": "Status",
    "admin.orderDetail.createdLabel": "Gemaakt",
    "admin.orderDetail.itemsLabel": "Items",
    "admin.orderDetail.totalLabel": "Totaal",
    "breadcrumb.admin": "Admin",
    "breadcrumb.orders": "Orders",

    // Admin - Order Detail
    "admin.orderDetail.status": "Status",
    "admin.orderDetail.created": "Gemaakt",
    "admin.orderDetail.items": "Items",
    "admin.orderDetail.total": "Totaal",
    "admin.orderDetail.customerInfo": "Klantgegevens",
    "admin.orderDetail.fullName": "Volledige naam",
    "admin.orderDetail.fullNamePlaceholder": "Volledige naam",
    "admin.orderDetail.addressLine1": "Adresregel 1",
    "admin.orderDetail.addressLine1Placeholder": "Adresregel 1",
    "admin.orderDetail.addressLine2": "Adresregel 2",
    "admin.orderDetail.addressLine2Placeholder": "Adresregel 2",
    "admin.orderDetail.city": "Plaats",
    "admin.orderDetail.cityPlaceholder": "Plaats",
    "admin.orderDetail.postalCode": "Postcode",
    "admin.orderDetail.postalCodePlaceholder": "Postcode",
    "admin.orderDetail.phoneNumber": "Telefoonnummer",
    "admin.orderDetail.phoneNumberPlaceholder": "Telefoonnummer",
    "admin.orderDetail.orderActions": "Order Acties",
    "admin.orderDetail.trackingAndTrace": "Track and Trace",
    "admin.orderDetail.trackingCode": "Volgnummer",
    "admin.orderDetail.trackingCodePlaceholder": "bv. 3SPQ123456789",
    "admin.orderDetail.trackingUrl": "Track & Trace URL (optioneel)",
    "admin.orderDetail.trackingUrlPlaceholder":
      "https://carrier.example/track/...",
    "admin.orderDetail.communication": "Communicatie",
    "admin.orderDetail.communicationTypeQuoteRequested": "Offerte Aangevraagd",
    "admin.orderDetail.communicationTypeQuoteConfirmation":
      "Offerte Bevestiging + Prijs",
    "admin.orderDetail.communicationTypeOrderSentTracking":
      "Order Verzonden + Track and Trace",
    "admin.orderDetail.internalNotes": "Interne Notities",
    "admin.orderDetail.internalNotesLabel": "Interne Notities",
    "admin.orderDetail.customerNotes": "Klantnotities",
    "admin.orderDetail.customerNotesLabel": "Klantnotities",
    "admin.orderDetail.modelFiles": "Modelbestanden & specs",
    "admin.orderDetail.noItems": "Geen items in deze order.",
    "admin.orderDetail.material": "Materiaal:",
    "admin.orderDetail.color": "Kleur:",
    "admin.orderDetail.qty": "Aantal:",
    "admin.orderDetail.price": "Prijs: EUR",
    "admin.orderDetail.delivery": "Levering: EUR",
    "admin.orderDetail.discount": "Order korting: EUR",
    "admin.orderDetail.statusHistory": "Status Geschiedenis",
    "admin.orderDetail.noStatusChanges":
      "Nog geen status wijzigingen geregistreerd.",
    "admin.orderDetail.changedAt": "Gewijzigd op",
    "admin.orderDetail.from": "Van",
    "admin.orderDetail.to": "Naar",
    "admin.orderDetail.by": "Door",
    "admin.orderDetail.note": "Notitie",
    "admin.orderDetail.communicationHistory": "Communicatiegeschiedenis",
    "admin.orderDetail.noCommunication": "Nog geen communicatie verzonden.",
    "admin.orderDetail.sentAt": "Verzonden op",
    "admin.orderDetail.type": "Type",
    "admin.orderDetail.channel": "Kanaal",
    "admin.orderDetail.recipient": "Ontvanger",
    "admin.orderDetail.subject": "Onderwerp",

    // Admin - Products
    "admin.products.title": "Producten",
    "admin.products.nameLabel": "Naam",
    "admin.products.namePlaceholder": "Naam",
    "admin.products.categoryLabel": "Categorie",
    "admin.products.categoryPlaceholder": "Categorie",
    "admin.products.productTypeLabel": "Producttype",
    "admin.products.descriptionLabel": "Beschrijving",
    "admin.products.descriptionPlaceholder": "Beschrijf het product",
    "admin.products.imagesLabel": "Productafbeeldingen",
    "admin.products.modelFileLabel": "Modelbestand",
    "admin.products.priceLabel": "Prijs",
    "admin.products.pricePlaceholder": "Prijs",
    "admin.products.discountLabel": "Korting (%)",
    "admin.products.discountPlaceholder": "0",
    "admin.products.trackInventoryLabel": "Voorraad Bijhouden",
    "admin.products.trackInventoryYes": "Ja",
    "admin.products.trackInventoryNo": "Nee",
    "admin.products.stockQuantityLabel": "Voorraadhoeveelheid",
    "admin.products.stockQuantityPlaceholder": "0",
    "admin.products.activeLabel": "Actief",
    "admin.products.activeYes": "Ja",
    "admin.products.activeNo": "Nee",
    "admin.products.addButton": "Product Toevoegen",
    "admin.products.loadingMessage": "Producten laden...",
    "admin.products.tablePreview": "Voorbeeld",
    "admin.products.tableName": "Naam",
    "admin.products.tableType": "Type",
    "admin.products.tableCategory": "Categorie",
    "admin.products.tablePrice": "Prijs",
    "admin.products.tableStatus": "Status",
    "admin.products.tableActions": "Acties",
    "admin.products.noProducts": "Geen producten gevonden.",
    "admin.products.edit": "Bewerk",
    "admin.products.delete": "Verwijder",
    "admin.products.loadingProduct": "Product laden...",
    "admin.products.productNotFound": "Product niet gevonden.",
    "admin.products.finalPrice": "Eindprijs",
    "admin.products.imagesUrlLabel": "Afbeeldingen",
    "admin.products.imagePlaceholder": "Plak afbeeldings-URL en klik Toevoegen",
    "admin.products.addImageButton": "Toevoegen",
    "admin.products.imagesTextarea": "Één afbeeldings-URL per regel",

    // Admin - Filaments
    "admin.filaments.title": "Filamenten",
    "admin.filaments.nameLabel": "Naam",
    "admin.filaments.namePlaceholder": "Naam",
    "admin.filaments.materialLabel": "Materiaal",
    "admin.filaments.materialPlaceholder": "Materiaal",
    "admin.filaments.colorLabel": "Kleur",
    "admin.filaments.colorPlaceholder": "Kleur",
    "admin.filaments.priceLabel": "Prijs Per Gram",
    "admin.filaments.pricePlaceholder": "Prijs Per Gram",
    "admin.filaments.stockLabel": "Voorraadhoeveelheid",
    "admin.filaments.stockPlaceholder": "Voorraadhoeveelheid",
    "admin.filaments.addButton": "Filament Toevoegen",
    "admin.filaments.descriptionLabel": "Beschrijving",
    "admin.filaments.descriptionPlaceholder": "Beschrijving",
    "admin.filaments.loadingMessage": "Filamenten laden...",
    "admin.filaments.tableName": "Naam",
    "admin.filaments.tableMaterial": "Materiaal",
    "admin.filaments.tableColor": "Kleur",
    "admin.filaments.tablePrice": "Prijs",
    "admin.filaments.tableStock": "Voorraad",
    "admin.filaments.tableActions": "Acties",

    // Admin - Users
    "admin.users.title": "Gebruikers",
    "admin.users.searchPlaceholder": "Zoek gebruikers op naam/e-mail",
    "admin.users.editUserSection": "Gebruiker Bewerken",
    "admin.users.nameLabel": "Naam",
    "admin.users.namePlaceholder": "Naam",
    "admin.users.emailLabel": "E-mail",
    "admin.users.emailPlaceholder": "E-mail",
    "admin.users.roleLabel": "Rol",
    "admin.users.roleCustomer": "Klant",
    "admin.users.roleAdmin": "Admin",
    "admin.users.saveButton": "Opslaan",
    "admin.users.columnName": "Naam",
    "admin.users.columnEmail": "E-mail",
    "admin.users.columnRole": "Rol",
    "admin.users.columnActions": "Acties",
    "admin.users.noUsers": "Geen gebruikers gevonden.",

    // Quote page
    "quote.materialPlaceholder": "PLA, PETG, ABS, Nylon...",
    "quote.colorPlaceholder": "Zwart, Wit, Rood, Transparant...",
    "quote.addDescription": "Beschrijving Toevoegen",

    // FAQ
    "faq.title": "Veelgestelde Vragen",
    "faq.subtitle":
      "Vragen over 3D printen, levering of materialen? We helpen je graag.",
    "faq.contactText": "Nog steeds niet gevonden wat je zoekt?",
    "faq.contactCta": "Stuur ons een bericht",
    "faq.q1": "Welke 3D-bestanden accepteren jullie?",
    "faq.a1":
      "We accepteren de meest gebruikte bestandsformaten: .STL, .OBJ en .3MF. Andere formaten kun je meestal exporteren naar STL.",
    "faq.q2": "Wat kost een maatwerk print?",
    "faq.a2":
      "De prijs hangt af van grootte, infill en materiaal. Vraag een offerte aan voor een exacte prijs zonder verborgen kosten.",
    "faq.q3": "Hoe lang duurt levering?",
    "faq.a3":
      "Meestal printen en verzenden we binnen 2 tot 5 werkdagen. Levertijd hangt af van je locatie.",
    "faq.q4": "Ik heb een idee maar geen 3D-bestand. Kunnen jullie helpen?",
    "faq.a4":
      "Ja. Deel schetsen of voorbeelden en we helpen met het maken van een printbaar model.",
    "faq.q5": "Zijn prints voedselveilig?",
    "faq.a5":
      "Standaard printmaterialen zijn meestal niet bedoeld voor direct voedselcontact. We adviseren graag over veiligere afwerking.",
    "faq.q6": "Wat als mijn print beschadigd aankomt?",
    "faq.a6":
      "Als je item beschadigd aankomt of grote printfouten heeft, stuur binnen 3 dagen een foto en we regelen een herprint.",

    // Gallery
    "gallery.title": "Productcatalogus",
    "gallery.subtitle":
      "Kies een model uit onze collectie om je volgende project te starten.",
    "gallery.loading": "Galerij synchroniseren",
    "gallery.added": "Toegevoegd!",
    "gallery.adding": "Toevoegen...",
    "gallery.addToCart": "In winkelwagen",
    "gallery.emptyTitle": "Archief Leeg",
    "gallery.emptyDesc": "Kom later terug voor nieuwe prints.",
    "gallery.viewInCart": "Bekijk in winkelwagen",
    "gallery.loginFirst":
      "Log eerst in om items aan je winkelwagen toe te voegen.",
    "gallery.addFailed": "Toevoegen mislukt. Probeer opnieuw.",
    "gallery.catalogTitle": "Productcatalogus",
    "gallery.catalogSubtitle":
      "Ontdek direct bestelbare prints en filamentproducten voor je volgende project.",
    "gallery.searchPlaceholder": "Zoek producten, categorieen of types",
    "gallery.categoryAll": "Alle categorieen",
    "gallery.typeAll": "Alle types",
    "gallery.typePrint": "3D-print",
    "gallery.typeFilament": "Filament",
    "gallery.typeOther": "Overig",
    "gallery.discountedOnly": "Alleen met korting",
    "gallery.inStockOnly": "Alleen op voorraad",
    "gallery.itemsLabel": "items",
    "gallery.viewDetails": "Bekijk details",
    "gallery.stockIn": "Op voorraad:",
    "gallery.stockOut": "Niet op voorraad",
    "gallery.madeToOrder": "Op bestelling",
    "gallery.noProductsTitle": "Geen producten gevonden",
    "gallery.noProductsDesc": "Pas filters of zoekwoorden aan.",
    "gallery.sortNewest": "Nieuwste",
    "gallery.sortPriceLowHigh": "Prijs: laag naar hoog",
    "gallery.sortPriceHighLow": "Prijs: hoog naar laag",
    "gallery.sortName": "Naam",
    "gallery.sortDiscountHigh": "Hoogste korting",

    // Product detail
    "productDetail.back": "Terug",
    "productDetail.notFound": "Product niet gevonden.",
    "productDetail.backToCatalog": "Terug naar catalogus",
    "productDetail.noDescription": "Nog geen beschrijving beschikbaar.",
    "productDetail.openModelFile": "Open modelbestand",
    "productDetail.continueBrowsing": "Verder kijken",
    "productDetail.added": "Product toegevoegd aan winkelwagen.",
    "productDetail.unavailable": "Niet op voorraad",
    "productDetail.unavailableError":
      "Dit product is momenteel niet op voorraad.",

    // Materials page
    "materials.pageTitle": "Materialen Bibliotheek",
    "materials.pageSubtitle":
      "Hoogwaardige filamenten voor elk project, van decoratief tot functioneel.",
    "materials.pageLoading": "Materialen laden...",
    "materials.stock": "op voorraad",
    "materials.ctaDesc":
      "We kunnen speciale filamenten bestellen zoals Wood, Carbon Fiber of Glow-in-the-dark voor grotere projecten.",
    "materials.ctaButton": "Start Je Project",
    "materials.footer":
      "© 2026 PrintCraft Collective. Professionele 3D-printservices.",

    // Quote
    "quote.title": "Vraag een Offerte Aan",
    "quote.subtitle": "Upload modellen en kies uit onze actuele voorraad.",
    "quote.models": "Jouw 3D Modellen",
    "quote.addFile": "Bestanden Toevoegen",
    "quote.guestContactTitle": "Contactgegevens",
    "quote.guestContactSubtitle":
      "Niet ingelogd? Geen probleem. Voeg je contactgegevens toe en we maken automatisch een account voor je aan.",
    "quote.guestEmail": "E-mail",
    "quote.guestRequiredName": "Vul je volledige naam in.",
    "quote.guestRequiredEmail": "Vul je e-mailadres in.",
    "quote.guestInvalidEmail": "Vul een geldig e-mailadres in.",
    "quote.guestSubmittedTitle": "Offerteaanvraag verzonden",
    "quote.guestSubmittedBody":
      "Bedankt! We hebben je aanvraag ontvangen en mailen je zodra je offerte klaarstaat.",
    "quote.guestSubmittedReference": "Referentie:",
    "quote.guestAccountCreatedTitle": "Account aangemaakt",
    "quote.guestAccountCreatedBody":
      "We hebben je klantaccount aangemaakt en een e-mail gestuurd om je wachtwoord in te stellen. Daarna kun je inloggen om je offertegeschiedenis te zien.",
    "quote.guestAccountCreatedHint":
      "Controleer je inbox voor de wachtwoord-link en log daarna in om verder te gaan.",
    "quote.noFiles": "Nog geen bestanden toegevoegd.",
    "quote.dragDropHint": "Sleep bestanden hierheen",
    "quote.allowedFilesInline":
      "Toegestane bestanden: STL, OBJ, 3MF, STEP, STP (max 50 MB).",
    "quote.shipping": "Verzendgegevens",
    "quote.submit": "Offerte Aanvraag Versturen",
    "quote.secure": "Veilig & Betrouwbaar 3D Printen",
    "quote.uploadUnsupportedType": "Niet-ondersteund bestandstype.",
    "quote.uploadFailed": "Upload mislukt. Probeer opnieuw.",
    "quote.uploadPartialFailed":
      "Sommige bestanden konden niet worden geupload. Controleer en probeer opnieuw.",
    "quote.invalidShipping":
      "Controleer je verzendgegevens voordat je verzendt.",
    "quote.submitFailed":
      "Offerte verzenden mislukt. Controleer je verbinding.",
    "quote.materialAvailabilityDisclaimer":
      "Aangevraagde materialen of kleuren zijn mogelijk niet altijd beschikbaar. We stemmen indien nodig geschikte alternatieven met je af.",
    "quote.material": "Materiaal",
    "quote.color": "Kleur",
    "quote.quantity": "Aantal",
    "quote.notesPlaceholder": "Instructies (Infill, laaghoogte, etc.)",
    "quote.fullName": "Volledige naam",
    "quote.phone": "Telefoonnummer",
    "quote.street": "Straat en huisnummer",
    "quote.city": "Plaats",
    "quote.textDescription": "Tekst Beschrijving",
    "quote.postalCode": "Postcode",
    "quote.shippingLaterNotice":
      "Verzendgegevens vragen we pas nadat je offerte is goedgekeurd, wanneer je op bevestigen en betalen klikt.",
    "quote.pricingDisclaimer":
      "Prijzen en offertes op dit platform zijn indicatief. Aan getoonde prijzen of offertes kunnen geen rechten worden ontleend totdat PrintCraft deze uitdrukkelijk heeft bevestigd.",

    // Cart
    "cart.loading": "Winkelwagen laden...",
    "cart.empty": "Winkelwagen is leeg",
    "cart.emptyDesc": "Bekijk de galerij om iets te laten printen.",
    "cart.goGallery": "Naar Galerij",
    "cart.finalize": "Bestelling Afronden",
    "cart.review": "Controleer Items",
    "cart.material": "Materiaal",
    "cart.color": "Kleur",
    "cart.quantity": "Aantal",
    "cart.paymentMethod": "Betaalmethode",
    "cart.paymentOnline": "Online Betaling (Stripe)",
    "cart.paymentOptions": "iDEAL, Credit Card, Bancontact, enz.",
    "cart.summary": "Overzicht",
    "cart.subtotal": "Subtotaal",
    "cart.delivery": "Levering",
    "cart.total": "Totaal",
    "cart.shipping": "Verzending",
    "cart.processing": "Verwerken...",
    "cart.payStripe": "Betaal met Stripe",
    "cart.checkoutFailed":
      "Er ging iets mis. Controleer je adres en probeer opnieuw.",
    "cart.conflict":
      "Je winkelwagen is elders bijgewerkt. Vernieuw je winkelwagen en probeer opnieuw.",

    // Order statuses
    "orderStatus.pendingQuote": "Offerte in behandeling",
    "orderStatus.quoted": "Geoffreerd",
    "orderStatus.expiredQuote": "Offerte verlopen",
    "orderStatus.pendingPayment": "In afwachting van betaling",
    "orderStatus.printing": "In productie",
    "orderStatus.completed": "Afgerond",
    "orderStatus.shipped": "Verzonden",
    "orderStatus.sent": "Verstuurd",
    "orderStatus.delivered": "Afgeleverd",
    "orderStatus.paid": "Betaald",
    "orderStatus.failed": "Mislukt",
    "orderStatus.cancelled": "Geannuleerd",

    // Orders
    "orders.title": "Mijn Projecten",
    "orders.subtitle": "Volg je 3D print aanvragen en verzendstatus.",
    "orders.loading": "Ordergeschiedenis laden...",
    "orders.none": "Nog geen projecten",
    "orders.noneDesc": "Upload je 3D-ontwerpen en ontvang een offerte op maat.",
    "orders.start": "Start Nieuw Project",
    "orders.model": "Model",
    "orders.models": "Modellen",
    "orders.shippingTo": "Verzending naar",
    "orders.manage": "Project Beheren",
    "orders.project": "Project",
    "orders.placedOn": "Geplaatst op",

    // Not Found
    "notFound.title": "Deze pagina is zoekgeraakt in de printwachtrij",
    "notFound.description":
      "De opgevraagde pagina bestaat niet of is verplaatst. Ga terug naar home en start een nieuw 3D-printproject.",
    "notFound.backHome": "Terug naar home",
    "notFound.goBack": "Ga terug",
    "notFound.loadingModel": "3D-model laden...",

    // Order detail
    "orderDetail.paymentAttempts": "Betalingspogingen",
    "orderDetail.notFound": "Order niet gevonden",
    "orderDetail.back": "Terug naar Projecten",
    "orderDetail.deleteQuote": "Offerte Verwijderen",
    "orderDetail.modelsInProject": "3D Modellen in dit Project",
    "orderDetail.viewModel": "Bekijk 3D",
    "orderDetail.filesRemovedDueCancellation":
      "In verband met annulering zijn bestanden verwijderd.",
    "orderDetail.timeline": "Project Tijdlijn",
    "orderDetail.quoteRequested": "Offerte Aangevraagd",
    "orderDetail.printing": "Printen",
    "orderDetail.completed": "Afgerond",
    "orderDetail.pending": "In afwachting",
    "orderDetail.shippingDetails": "Verzendgegevens",
    "orderDetail.noPhone": "Geen telefoon opgegeven",
    "orderDetail.toBeCalculated": "Wordt berekend",
    "orderDetail.pendingQuote": "Offerte in behandeling",
    "orderDetail.subtotal": "Subtotaal",
    "orderDetail.delivery": "Levering",
    "orderDetail.serviceFee": "Servicekosten",
    "orderDetail.discount": "Korting",
    "orderDetail.total": "Totaal",
    "orderDetail.status": "Status",
    "orderDetail.referenceId": "Referentie-ID",
    "orderDetail.confirmPay": "Bevestig + Betaal",
    "orderDetail.requestNewQuote": "Vraag Nieuwe Offerte Aan",
    "orderDetail.newQuoteRequested": "Nieuwe offerteaanvraag verstuurd.",
    "orderDetail.newQuoteRequestFailed":
      "Nieuwe offerte aanvragen is niet gelukt.",
    "orderDetail.quoteExpiresOn": "Offerte verloopt op",
    "orderDetail.quoteExpiredInfo":
      "Deze offerte is na 7 dagen verlopen. Vraag een nieuwe offerte aan om verder te gaan.",
    "orderDetail.shippingModalTitle": "Bevestig Verzendgegevens",
    "orderDetail.shippingModalSubtitle":
      "We hebben je afleveradres nodig voordat je verdergaat naar betalen.",
    "orderDetail.shippingModalCheckout": "Afrekenen",
    "orderDetail.shippingModalStarting": "Checkout starten...",
    "orderDetail.paymentStartFailed":
      "Betaling starten is niet gelukt. Probeer opnieuw.",
    "orderDetail.paymentSyncSuccess": "Betaalstatus is bijgewerkt.",
    "orderDetail.paymentSyncPending":
      "Betaling wordt nog verwerkt. Vernieuw deze pagina over enkele ogenblikken.",
    "orderDetail.paymentCancelled": "Betaling is geannuleerd.",
    "orderDetail.noPaymentAttempts": "Nog geen betaalpogingen.",
    "modelViewer.title": "3D-modelviewer",
    "modelViewer.backToOrder": "Terug naar order",
    "modelViewer.download": "Bestand downloaden",
    "modelViewer.loading": "3D-model laden...",
    "modelViewer.notFound": "Model niet gevonden voor dit orderitem.",
    "modelViewer.orderItem": "Orderitem",
    "modelViewer.unnamed": "Naamloos model",
    "modelViewer.previewUnavailable":
      "Voor dit bestandstype is geen preview beschikbaar.",
    "modelViewer.previewUnavailableHint":
      "Je kunt het bestand nog steeds downloaden en openen in een CAD-viewer.",

    // Legal pages
    "legal.updated": "Laatst bijgewerkt: 27 maart 2026",
    "legal.contact.title": "Juridisch Contact",
    "legal.contact.body":
      "Voor juridische of privacyvragen kun je mailen naar info@printcraft.nl. We reageren doorgaans binnen 5 werkdagen.",
    "legal.privacy.title": "Privacybeleid",
    "legal.privacy.section1Title": "Welke gegevens we verzamelen",
    "legal.privacy.section1Body":
      "We verzamelen gegevens die nodig zijn voor onze dienstverlening: accountgegevens, contactgegevens, verzendadres, betaalstatus en geuploade modelbestanden.",
    "legal.privacy.section2Title": "Hoe we je gegevens gebruiken",
    "legal.privacy.section2Body":
      "Je gegevens gebruiken we voor offerteberekening, productieplanning, verzending, klantenservice, fraudepreventie en operationele communicatie. We verkopen geen persoonsgegevens.",
    "legal.privacy.section3Title": "Bewaartermijn",
    "legal.privacy.section3Body":
      "Bestel- en factuurgegevens bewaren we zolang wettelijk vereist voor administratie en boekhouding. Niet-essentiële gegevens verwijderen we op een geverifieerd verzoek.",
    "legal.privacy.section4Title": "Jouw rechten",
    "legal.privacy.section4Body":
      "Je kunt inzage, correctie, verwijdering of export van persoonsgegevens aanvragen, voor zover dit past binnen wettelijke bewaarplichten.",
    "legal.terms.title": "Algemene Voorwaarden",
    "legal.terms.section1Title": "Reikwijdte van de dienst",
    "legal.terms.section1Body":
      "Door bestanden aan te leveren bevestig je dat je eigenaar bent van die bestanden of bevoegd bent om ze te gebruiken, en dat ze geen wet of rechten van derden schenden.",
    "legal.terms.section2Title": "Offertes en bestellingen",
    "legal.terms.section2Body":
      "Offertes zijn maatwerkramingen op basis van modelgrootte, aantallen, materiaalkeuze, printcomplexiteit en eventuele afwerking. Productie start uitsluitend na expliciet akkoord en bevestigde betaling.",
    "legal.terms.pricingDisclaimerTitle": "Prijs- en offertegeldigheid",
    "legal.terms.pricingDisclaimerBody":
      "Getoonde richtprijzen op de website zijn indicatief. De definitieve prijs kan per aanvraag afwijken doordat grootte, aantallen, geometrie, supportgebruik, nabewerking en verzendmethode de werkelijke kostprijs beïnvloeden. Getoonde prijzen en conceptoffertes zijn niet bindend; rechten ontstaan pas na schriftelijke offertebevestiging door PrintCraft.",
    "legal.terms.section3Title": "Beperking van aansprakelijkheid",
    "legal.terms.section3Body":
      "Klanten blijven verantwoordelijk voor de functionele geschiktheid en veiligheid van aangeleverde ontwerpen. Onze aansprakelijkheid is, waar wettelijk toegestaan, beperkt tot de waarde van de betreffende bestelling.",
    "legal.terms.section4Title": "Toepasselijk recht",
    "legal.terms.section4Body":
      "Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland, tenzij dwingend consumentenrecht anders bepaalt.",
    "legal.refunds.title": "Retour- en Terugbetaalbeleid",
    "legal.refunds.section1Title": "Beschadigde of defecte items",
    "legal.refunds.section1Body":
      "Als een item beschadigd aankomt of ernstige productiefouten bevat, neem dan binnen 3 dagen contact op met foto's. We beoordelen het en bieden waar passend een herprint of terugbetaling.",
    "legal.refunds.section2Title": "Maatwerkproducten",
    "legal.refunds.section2Body":
      "Omdat iedere print op aanvraag wordt gemaakt en vaak uniek is in formaat en aantallen, zijn goedgekeurde maatwerkbestellingen in principe niet restitueerbaar, behalve bij aantoonbare productiefouten.",
    "legal.refunds.section3Title": "Annulering",
    "legal.refunds.section3Body":
      "Een offerte kun je annuleren voordat productie start. Zodra productie is begonnen, is annuleren doorgaans niet meer mogelijk.",
    "legal.refunds.section4Title": "Uitsluitingen",
    "legal.refunds.section4Body":
      "Kleurafwijkingen, kleine oppervlaktelijnen en maatverschillen binnen normale 3D-print toleranties gelden niet als defect.",
    "legal.shipping.title": "Verzendbeleid",
    "legal.shipping.section1Title": "Verwerkingstijd",
    "legal.shipping.section1Body":
      "De meeste bestellingen worden binnen 2 tot 5 werkdagen geproduceerd en verzendklaar gemaakt, afhankelijk van drukte, complexiteit, materiaalbeschikbaarheid en bestelde aantallen.",
    "legal.shipping.section2Title": "Leveringsgebied",
    "legal.shipping.section2Body":
      "We leveren door heel Nederland. Voor producten met vaste checkout-prijs worden verzendkosten tijdens checkout getoond. Voor offertebestellingen worden bezorgkosten opgenomen of gespecificeerd in de offerte en kunnen deze afwijken op basis van pakketgrootte, gewicht, aantallen en bestemming.",
    "legal.shipping.section3Title": "Track & trace",
    "legal.shipping.section3Body":
      "Wanneer beschikbaar delen we na verzending track & trace-gegevens zodat je de levering kunt volgen.",
    "legal.shipping.section4Title": "Vertraging en risico",
    "legal.shipping.section4Body":
      "Vertraging door vervoerders kan buiten onze invloed liggen. Het risico gaat over bij levering, tenzij dwingend consumentenrecht anders bepaalt.",

    // SEO
    "seo.default.title": "3D Print Service Nederland | PrintCraft",
    "seo.default.description":
      "Professionele 3D print service voor heel Nederland. Upload je model en ontvang snel een offerte.",
    "seo.default.keywords":
      "3D print service Nederland, 3D printen Nederland, online 3D print service, maatwerk 3D print",
    "seo.home.title": "3D Print Service Nederland | PrintCraft",
    "seo.home.description":
      "Professionele 3D print service voor prototypes, onderdelen en maatwerk prints in heel Nederland.",
    "seo.home.keywords":
      "3D print service Nederland, 3D printen Nederland, maatwerk 3D print",
    "seo.gallery.title": "3D Print Modellen Galerij | PrintCraft Nederland",
    "seo.gallery.description":
      "Bekijk populaire 3D print modellen en start je bestelling vanuit heel Nederland.",
    "seo.gallery.keywords":
      "3D modellen printen, 3D print galerij, 3D print Nederland",
    "seo.materials.title": "3D Print Materialen (PLA, PETG) | PrintCraft NL",
    "seo.materials.description":
      "Kies het juiste 3D print materiaal en kleur voor jouw project. Live overzicht van filamenten.",
    "seo.materials.keywords":
      "PLA printen, PETG printen, 3D filament Nederland",
    "seo.faq.title": "FAQ 3D Printen | PrintCraft Nederland",
    "seo.faq.description":
      "Veelgestelde vragen over levertijd, materialen, prijzen en kwaliteit.",
    "seo.faq.keywords": "3D print FAQ Nederland, vragen 3D printen",
    "seo.notFound.title": "Pagina niet gevonden | PrintCraft 3D Print Service",
    "seo.notFound.description":
      "De opgevraagde pagina kon niet worden gevonden. Ga terug naar PrintCraft om je volgende 3D-printproject te starten.",
    "seo.notFound.keywords": "404, pagina niet gevonden, PrintCraft",
  },
};
