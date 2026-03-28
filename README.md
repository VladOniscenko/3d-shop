# 3D Shop 🎨

A full-stack e-commerce platform for 3D printing services. Browse products, customize orders, manage payments, and track deliveries—built with modern tech and zero overthinking.

**[Read the full story](PROJECT_STORY.md)** about this vibe-coded project.

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript** — type-safe component architecture
- **Vite** — lightning-fast build tooling
- **i18n** — multi-language support
- **CSS Modules** — scoped styling

### Backend
- **ASP.NET Core 8** — high-performance REST API
- **Entity Framework Core** — ORM with migrations
- **JWT Authentication** — secure token-based auth
- **SQL Database** — persistent data layer

---

## Project Structure

```
3d-shop/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client services
│   │   ├── context/        # State management
│   │   ├── i18n/          # Internationalization
│   │   └── types/         # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── PrintCraftApi/          # ASP.NET Core backend
│   ├── Controllers/        # API endpoints
│   ├── Services/           # Business logic
│   ├── Models/             # Entity models
│   ├── Migrations/         # Database migrations
│   ├── Data/              # DbContext
│   ├── Validation/        # Input validation
│   ├── appsettings.json
│   └── Program.cs
│
├── PROJECT_STORY.md        # The journey
└── README.md              # This file
```

---

## Getting Started

### Prerequisites
- **.NET 8 SDK** — [install](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** — [install](https://nodejs.org)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VladOniscenko/3d-shop.git
   cd 3d-shop
   ```

2. **Setup Backend**
   ```bash
   cd PrintCraftApi
   dotnet restore
   dotnet ef database update  # Apply migrations
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

---

## Running the Project

### Development Mode

**Terminal 1 — Backend API** (runs on `http://localhost:5000`)
```bash
cd PrintCraftApi
dotnet run
```

**Terminal 2 — Frontend** (runs on `http://localhost:5173`)
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

**Frontend**
```bash
cd frontend
npm run build
```

**Backend**
```bash
cd PrintCraftApi
dotnet publish -c Release
```

---

## Database

Migrations are located in `PrintCraftApi/Migrations/`. The schema includes:

- **Products** — catalog with pricing and materials
- **Users** — customer accounts and authentication
- **Orders** — order management with status tracking
- **OrderItems** — line items with filament selections
- **Cart** — per-user shopping cart
- **Payments** — payment processing records
- **Admin Tools** — order notes, status history, communications

### Run Migrations

```bash
cd PrintCraftApi
dotnet ef database update
```

### Add a New Migration

```bash
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

---

## API Documentation

See [PrintCraftApi.http](PrintCraftApi/PrintCraftApi.http) for a complete list of endpoints.

### Key Endpoints

- `POST /auth/register` — Create account
- `POST /auth/login` — Authenticate
- `GET /products` — List all products
- `POST /cart/add` — Add to cart
- `POST /orders` — Create order
- `GET /orders/{id}` — Get order details
- `POST /payments/process` — Process payment
- `GET /admin/orders` — Admin dashboard

---

## Configuration

### Environment Variables

Create `.env` files (if needed):

**Frontend** — `.env.local`
```
VITE_API_URL=http://localhost:5000
```

**Backend** — `appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=printcraft.db"
  },
  "Jwt": {
    "SecretKey": "your-secret-key"
  }
}
```

---

## Development Workflow

1. **Create a feature branch** — `git checkout -b feature/your-feature`
2. **Make changes** — code, test, commit
3. **Push & create PR** — get feedback
4. **Merge to main** — ship it 🚀

Commits follow conventional format:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code improvements
- `test:` — test additions
- `docs:` — documentation

---

## Contributing

This project was built with intuition and iteration. If you have ideas or improvements:

1. Open an issue or PR
2. Keep it simple and focused
3. Follow the tech stack conventions
4. Test your changes

---

## License

Built with 💚 by Vlad Oniscenko

---

## Support

Have questions? Check out:
- [PROJECT_STORY.md](PROJECT_STORY.md) — understand the philosophy
- `appsettings.json` — configuration guide
- `PrintCraftApi.http` — API examples

---

**Last Updated:** 28 March 2026  
**Status:** Production-Ready (Vibe Verified ✨)
