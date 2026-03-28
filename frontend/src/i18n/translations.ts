export type SupportedLanguage = "en" | "nl";

export const languageOptions: Array<{
  code: SupportedLanguage;
  label: string;
}> = [
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.materials": "Materials",
    "nav.gallery": "Products",
    "nav.howItWorks": "How It Works",
    "nav.faq": "FAQ",
    "nav.myOrders": "My Orders",
    "nav.admin": "Admin",
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

    // Signup
    "signup.title": "Create an account",
    "signup.subtitle": "Start bringing your 3D ideas to life today.",
    "signup.success": "Account created! Redirecting to login...",
    "signup.error.default":
      "Could not create account. Email might already be in use.",
    "signup.name": "Full Name",
    "signup.passwordPlaceholder": "Create a strong password",
    "signup.submit": "Sign up",
    "signup.haveAccount": "Already have an account?",
    "signup.signIn": "Sign in",
    "signup.visualTitle": "Join the makers.",
    "signup.visualDesc":
      "Create a free account to get instant quotes, save your favorite materials, and track your print history.",

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
    "materials.ctaTitle": "Need a specific material?",
    "materials.ctaDesc":
      "We can order specialty filaments like Wood, Carbon Fiber, or Glow-in-the-dark for large projects.",
    "materials.ctaButton": "Start Your Project",
    "materials.footer":
      "© 2026 PrintCraft Collective. Professional 3D Printing Services.",

    // How it works page
    "how.pageTitle": "How It Works",
    "how.pageSubtitle":
      "Getting your custom parts printed is as easy as 1-2-3 (and 4).",
    "how.pageStep1Title": "Request",
    "how.pageStep2Title": "Review & Quote",
    "how.pageStep3Title": "We Print",
    "how.pageStep4Title": "Packed & Shipped",
    "how.pageStep1Desc":
      "Start by sending us your 3D design file. If you do not have a file yet, describe your idea and we can help design it.",
    "how.pageStep2Desc":
      "We review your file, pick the best setup, and send a clear quote.",
    "how.pageStep3Desc":
      "After approval, we print your design on our Bambu Lab P2S printers.",
    "how.pageStep4Desc":
      "After printing, we finish and safely pack your item for delivery.",
    "how.promiseTitle": "Our Quality Promise",
    "how.promiseDesc":
      "If your print has major flaws, we will reprint it for free.",
    "how.promiseCta": "Start your first project",

    // Quote
    "quote.title": "Request a Quote",
    "quote.subtitle": "Upload models and choose from our live inventory.",
    "quote.models": "Your 3D Models",
    "quote.addFile": "Add File",
    "quote.noFiles": "No files added yet.",
    "quote.shipping": "Shipping Info",
    "quote.submit": "Submit Quote Request",
    "quote.secure": "Safe & Secure 3D Printing",
    "quote.uploadFailed": "Upload failed. Please try again.",
    "quote.invalidShipping": "Please fix shipping info before submitting.",
    "quote.submitFailed": "Failed to submit quote. Check your connection.",
    "quote.material": "Material",
    "quote.color": "Color",
    "quote.quantity": "Quantity",
    "quote.notesPlaceholder": "Instructions (Infill, layer height, etc.)",
    "quote.fullName": "Full Name",
    "quote.phone": "Phone Number",
    "quote.street": "Street Address",
    "quote.city": "City",
    "quote.postalCode": "Postal Code",
    "quote.shippingLaterNotice":
      "Shipping details are requested after your quote is approved, when you click confirm and pay.",

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
    "cart.paymentOnline": "Online Payment (Mollie)",
    "cart.paymentOptions": "iDEAL, Credit Card, Bancontact, etc.",
    "cart.summary": "Summary",
    "cart.subtotal": "Subtotal",
    "cart.delivery": "Delivery",
    "cart.total": "Total",
    "cart.shipping": "Shipping",
    "cart.processing": "Processing...",
    "cart.payMollie": "Pay with Mollie",
    "cart.checkoutFailed":
      "Something went wrong. Please check your address and try again.",
    "cart.conflict":
      "Your cart was updated elsewhere. Please refresh your cart and try again.",

    // Order statuses
    "orderStatus.pendingQuote": "Pending Quote",
    "orderStatus.quoted": "Quoted",
    "orderStatus.pendingPayment": "Pending Payment",
    "orderStatus.printing": "Printing",
    "orderStatus.completed": "Completed",
    "orderStatus.shipped": "Shipped",
    "orderStatus.sent": "Sent",
    "orderStatus.delivered": "Delivered",
    "orderStatus.paid": "Paid",
    "orderStatus.failed": "Failed",

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

    // Order detail
    "orderDetail.notFound": "Order not found",
    "orderDetail.back": "Back to Projects",
    "orderDetail.deleteQuote": "Delete Quote",
    "orderDetail.modelsInProject": "3D Models in this Project",
    "orderDetail.timeline": "Project Timeline",
    "orderDetail.quoteRequested": "Quote Requested",
    "orderDetail.printing": "Printing",
    "orderDetail.completed": "Completed",
    "orderDetail.pending": "Pending",
    "orderDetail.shippingDetails": "Shipping Details",
    "orderDetail.noPhone": "No phone provided",
    "orderDetail.toBeCalculated": "To be calculated",
    "orderDetail.pendingQuote": "Pending Quote",
    "orderDetail.delivery": "Delivery",
    "orderDetail.total": "Total",
    "orderDetail.status": "Status",
    "orderDetail.referenceId": "Reference ID",
    "orderDetail.confirmPay": "Confirm + Pay",
    "orderDetail.shippingModalTitle": "Confirm Shipping Details",
    "orderDetail.shippingModalSubtitle":
      "We need your delivery address before continuing to payment.",
    "orderDetail.shippingModalCheckout": "Checkout",
    "orderDetail.shippingModalStarting": "Starting checkout...",
    "orderDetail.paymentStartFailed":
      "Could not start payment. Please try again.",

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
      "Quotes are estimates based on material, complexity, and production time. Production starts only after explicit approval and confirmed payment.",
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
      "Because items are custom-made from your files, approved designs are generally non-refundable unless there is a clear manufacturing error.",
    "legal.refunds.section3Title": "Cancellation",
    "legal.refunds.section3Body":
      "Quotes can be canceled before production starts. Once production has started, cancellation is usually no longer possible.",
    "legal.refunds.section4Title": "Exclusions",
    "legal.refunds.section4Body":
      "Color variation, minor surface artifacts, or dimensional tolerances within normal 3D-print limits are not treated as defects.",
    "legal.shipping.title": "Shipping Policy",
    "legal.shipping.section1Title": "Processing time",
    "legal.shipping.section1Body":
      "Most orders are produced and prepared for shipment within 2 to 5 business days, depending on queue, complexity, and material availability.",
    "legal.shipping.section2Title": "Delivery area",
    "legal.shipping.section2Body":
      "We deliver across the Netherlands. Shipping fees are shown during checkout.",
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
    "seo.how.title": "How Our 3D Print Service Works | PrintCraft",
    "seo.how.description":
      "From upload to delivery: discover how your 3D model gets printed in the Netherlands.",
    "seo.how.keywords":
      "how 3D print service works, 3D print process Netherlands",
    "seo.faq.title": "3D Printing FAQ | PrintCraft Netherlands",
    "seo.faq.description":
      "Frequently asked questions about lead times, materials, prices and quality.",
    "seo.faq.keywords": "3D print FAQ Netherlands, 3D printing questions",
  },
  nl: {
    // Navbar
    "nav.home": "Home",
    "nav.materials": "Materialen",
    "nav.gallery": "Producten",
    "nav.howItWorks": "Hoe Het Werkt",
    "nav.faq": "FAQ",
    "nav.myOrders": "Mijn Orders",
    "nav.admin": "Admin",
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

    // Signup
    "signup.title": "Maak een account",
    "signup.subtitle": "Begin vandaag met het realiseren van je 3D-ideeën.",
    "signup.success":
      "Account aangemaakt! Je wordt doorgestuurd naar inloggen...",
    "signup.error.default":
      "Kon account niet aanmaken. Het e-mailadres is mogelijk al in gebruik.",
    "signup.name": "Volledige naam",
    "signup.passwordPlaceholder": "Maak een sterk wachtwoord",
    "signup.submit": "Registreren",
    "signup.haveAccount": "Heb je al een account?",
    "signup.signIn": "Inloggen",
    "signup.visualTitle": "Word ook maker.",
    "signup.visualDesc":
      "Maak gratis een account aan voor snelle offertes, favoriete materialen en orderhistorie.",

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
    "materials.ctaTitle": "Speciaal materiaal nodig?",
    "materials.ctaDesc":
      "We kunnen speciale filamenten bestellen zoals Wood, Carbon Fiber of Glow-in-the-dark voor grotere projecten.",
    "materials.ctaButton": "Start Je Project",
    "materials.footer":
      "© 2026 PrintCraft Collective. Professionele 3D-printservices.",

    // How it works page
    "how.pageTitle": "Hoe Het Werkt",
    "how.pageSubtitle":
      "Je maatwerk onderdelen laten printen is eenvoudig in 4 stappen.",
    "how.pageStep1Title": "Aanvraag",
    "how.pageStep2Title": "Controle & Offerte",
    "how.pageStep3Title": "Wij Printen",
    "how.pageStep4Title": "Verpakt & Verzonden",
    "how.pageStep1Desc":
      "Stuur je 3D-bestand op. Heb je nog geen bestand, dan helpen we met het ontwerp.",
    "how.pageStep2Desc":
      "We controleren je bestand, kiezen de juiste instellingen en sturen een duidelijke offerte.",
    "how.pageStep3Desc":
      "Na akkoord printen we je ontwerp op onze Bambu Lab P2S printers.",
    "how.pageStep4Desc":
      "Na het printen werken we het af en verpakken we het veilig voor verzending.",
    "how.promiseTitle": "Onze Kwaliteitsbelofte",
    "how.promiseDesc":
      "Heeft je print grote fouten, dan printen we deze kosteloos opnieuw.",
    "how.promiseCta": "Start je eerste project",

    // Quote
    "quote.title": "Vraag een Offerte Aan",
    "quote.subtitle": "Upload modellen en kies uit onze actuele voorraad.",
    "quote.models": "Jouw 3D Modellen",
    "quote.addFile": "Bestand Toevoegen",
    "quote.noFiles": "Nog geen bestanden toegevoegd.",
    "quote.shipping": "Verzendgegevens",
    "quote.submit": "Offerte Aanvraag Versturen",
    "quote.secure": "Veilig & Betrouwbaar 3D Printen",
    "quote.uploadFailed": "Upload mislukt. Probeer opnieuw.",
    "quote.invalidShipping":
      "Controleer je verzendgegevens voordat je verzendt.",
    "quote.submitFailed":
      "Offerte verzenden mislukt. Controleer je verbinding.",
    "quote.material": "Materiaal",
    "quote.color": "Kleur",
    "quote.quantity": "Aantal",
    "quote.notesPlaceholder": "Instructies (Infill, laaghoogte, etc.)",
    "quote.fullName": "Volledige naam",
    "quote.phone": "Telefoonnummer",
    "quote.street": "Straat en huisnummer",
    "quote.city": "Plaats",
    "quote.postalCode": "Postcode",
    "quote.shippingLaterNotice":
      "Verzendgegevens vragen we pas nadat je offerte is goedgekeurd, wanneer je op bevestigen en betalen klikt.",

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
    "cart.paymentOnline": "Online Betaling (Mollie)",
    "cart.paymentOptions": "iDEAL, Credit Card, Bancontact, enz.",
    "cart.summary": "Overzicht",
    "cart.subtotal": "Subtotaal",
    "cart.delivery": "Levering",
    "cart.total": "Totaal",
    "cart.shipping": "Verzending",
    "cart.processing": "Verwerken...",
    "cart.payMollie": "Betaal met Mollie",
    "cart.checkoutFailed":
      "Er ging iets mis. Controleer je adres en probeer opnieuw.",
    "cart.conflict":
      "Je winkelwagen is elders bijgewerkt. Vernieuw je winkelwagen en probeer opnieuw.",

    // Order statuses
    "orderStatus.pendingQuote": "Offerte in behandeling",
    "orderStatus.quoted": "Geoffreerd",
    "orderStatus.pendingPayment": "In afwachting van betaling",
    "orderStatus.printing": "In productie",
    "orderStatus.completed": "Afgerond",
    "orderStatus.shipped": "Verzonden",
    "orderStatus.sent": "Verstuurd",
    "orderStatus.delivered": "Afgeleverd",
    "orderStatus.paid": "Betaald",
    "orderStatus.failed": "Mislukt",

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

    // Order detail
    "orderDetail.notFound": "Order niet gevonden",
    "orderDetail.back": "Terug naar Projecten",
    "orderDetail.deleteQuote": "Offerte Verwijderen",
    "orderDetail.modelsInProject": "3D Modellen in dit Project",
    "orderDetail.timeline": "Project Tijdlijn",
    "orderDetail.quoteRequested": "Offerte Aangevraagd",
    "orderDetail.printing": "Printen",
    "orderDetail.completed": "Afgerond",
    "orderDetail.pending": "In afwachting",
    "orderDetail.shippingDetails": "Verzendgegevens",
    "orderDetail.noPhone": "Geen telefoon opgegeven",
    "orderDetail.toBeCalculated": "Wordt berekend",
    "orderDetail.pendingQuote": "Offerte in behandeling",
    "orderDetail.delivery": "Levering",
    "orderDetail.total": "Totaal",
    "orderDetail.status": "Status",
    "orderDetail.referenceId": "Referentie-ID",
    "orderDetail.confirmPay": "Bevestig + Betaal",
    "orderDetail.shippingModalTitle": "Bevestig Verzendgegevens",
    "orderDetail.shippingModalSubtitle":
      "We hebben je afleveradres nodig voordat je verdergaat naar betalen.",
    "orderDetail.shippingModalCheckout": "Afrekenen",
    "orderDetail.shippingModalStarting": "Checkout starten...",
    "orderDetail.paymentStartFailed":
      "Betaling starten is niet gelukt. Probeer opnieuw.",

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
      "Offertes zijn schattingen op basis van materiaal, complexiteit en productietijd. Productie start uitsluitend na expliciet akkoord en bevestigde betaling.",
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
      "Omdat items op maat worden gemaakt op basis van jouw bestanden, zijn goedgekeurde ontwerpen in principe niet restitueerbaar, behalve bij aantoonbare productiefouten.",
    "legal.refunds.section3Title": "Annulering",
    "legal.refunds.section3Body":
      "Een offerte kun je annuleren voordat productie start. Zodra productie is begonnen, is annuleren doorgaans niet meer mogelijk.",
    "legal.refunds.section4Title": "Uitsluitingen",
    "legal.refunds.section4Body":
      "Kleurafwijkingen, kleine oppervlaktelijnen en maatverschillen binnen normale 3D-print toleranties gelden niet als defect.",
    "legal.shipping.title": "Verzendbeleid",
    "legal.shipping.section1Title": "Verwerkingstijd",
    "legal.shipping.section1Body":
      "De meeste bestellingen worden binnen 2 tot 5 werkdagen geproduceerd en verzendklaar gemaakt, afhankelijk van drukte, complexiteit en materiaalbeschikbaarheid.",
    "legal.shipping.section2Title": "Leveringsgebied",
    "legal.shipping.section2Body":
      "We leveren door heel Nederland. Verzendkosten worden tijdens checkout getoond.",
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
    "seo.how.title": "Hoe Onze 3D Print Service Werkt | PrintCraft",
    "seo.how.description":
      "Van upload tot levering: ontdek hoe je 3D model geprint wordt in Nederland.",
    "seo.how.keywords": "hoe werkt 3D print service, 3D print proces Nederland",
    "seo.faq.title": "FAQ 3D Printen | PrintCraft Nederland",
    "seo.faq.description":
      "Veelgestelde vragen over levertijd, materialen, prijzen en kwaliteit.",
    "seo.faq.keywords": "3D print FAQ Nederland, vragen 3D printen",
  },
};
