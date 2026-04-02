# 🏨 StayScape — Travel Accommodation Platform

A full-stack travel accommodation platform for discovering, listing, and booking stays — with secure payments, image uploads, and map-based search.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Templating | EJS, EJS-Mate |
| Authentication | Passport.js (Local Strategy) |
| Payments | Stripe |
| Image Storage | Cloudinary, Multer |
| Maps | Mapbox |
| Session Storage | connect-mongo |
| Firebase | Auth / Storage (extended features) |

---

## 📁 Project Structure

```
StayScape/
│
├── PUBLIC/
│   ├── css/                        # Stylesheets
│   └── js/                         # Client-side scripts
│
├── controller/
│   ├── booking.js                  # Booking logic
│   ├── listing.js                  # Listing CRUD logic
│   ├── otp.js                      # OTP handling
│   ├── payment.js                  # Stripe payment logic
│   ├── reviews.js                  # Review logic
│   └── user.js                     # User auth logic
│
├── init/                           # DB seed/init scripts
│
├── models/
│   ├── booking.js                  # Booking schema
│   ├── listing.js                  # Listing schema
│   ├── payment.js                  # Payment schema
│   ├── reviews.js                  # Review schema
│   └── user.js                     # User schema
│
├── routes/
│   ├── payment.js                  # Payment routes
│   └── user.js                     # Auth routes
│
├── uploads/                        # Temporary local uploads
│
├── utils/
│   ├── wrapAsync.js                # Async error wrapper
│   └── ExpressError.js             # Custom error class
│
├── views/
│   ├── booking/                    # Booking views
│   ├── includes/                   # Partials (navbar, footer)
│   ├── layouts/                    # EJS-Mate boilerplate
│   ├── listings/                   # Listing views
│   ├── user/                       # Auth views
│   ├── error.ejs                   # Error page
│   └── home.ejs                    # Home page
│
├── ListingSerSchema.js             # Joi validation schema
├── cloudConfig.js                  # Cloudinary configuration
├── middleware.js                   # Auth & validation middleware
├── app.js                          # App entry point
└── .env                            # Environment variables
```

---

## ⚙️ API Routes

### Listings
| Method | Route | Description |
|---|---|---|
| `GET` | `/listings` | Browse all listings |
| `GET` | `/listings/new` | New listing form (auth required) |
| `POST` | `/listings` | Create a listing |
| `GET` | `/listings/:id` | View a listing |
| `GET` | `/listings/:id/edit` | Edit form (owner only) |
| `PATCH` | `/listings/:id` | Update a listing |
| `DELETE` | `/listings/:id` | Delete a listing |

### Bookings
| Method | Route | Description |
|---|---|---|
| `GET` | `/listings/:id/booking` | Book a listing |
| `GET` | `/listings/:id/allBooking` | Owner view of all bookings |
| `DELETE` | `/listings/:id/booking/:bookingId` | Cancel booking (user) |
| `DELETE` | `/listings/:id/allBooking/:bookingId` | Cancel booking (owner) |

### Reviews
| Method | Route | Description |
|---|---|---|
| `POST` | `/listings/:id/reviews` | Add a review |
| `DELETE` | `/listings/:id/reviews/:revId` | Delete a review |

### Payments (Stripe)
| Method | Route | Description |
|---|---|---|
| `POST` | `/book-and-pay` | Initiate Stripe checkout |
| `GET` | `/payment/success` | Handle successful payment |
| `GET` | `/payment/cancel` | Handle cancelled payment |

### Auth
| Method | Route | Description |
|---|---|---|
| `GET` | `/signup` | Register page |
| `POST` | `/signup` | Register user |
| `GET` | `/login` | Login page |
| `POST` | `/login` | Authenticate user |
| `GET` | `/logout` | Logout user |

---

## 🔧 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account
- Cloudinary account
- Stripe account
- Mapbox account
- Firebase project (optional/extended features)

### Installation

```bash
# Clone the repository
git clone git clone https://github.com/Abhishek-Kumar111/ProjectA1.git
cd stayscape

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Cloudinary (Image Uploads)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Mapbox (Location & Maps)
MAP_TOKEN=your_mapbox_token

# MongoDB Atlas
ATLASDB_URL=your_mongodb_atlas_connection_string

# Session Secret
SECRET=your_session_secret_key

# Stripe (Payments)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Firebase (Extended Features)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### Run the App

```bash
# Development
npm run dev

# Production
npm start
```

App runs at: `http://localhost:8080`

---

## ✨ Features

- **Listing Management** — Create, edit, and delete travel accommodation listings with image uploads
- **Location-Based Search** — Mapbox-powered map to browse stays by location, reducing search time by ~30%
- **Booking System** — Date-based booking with overlap validation and status tracking
- **Stripe Payments** — Secure checkout flow with pending/confirmed booking lifecycle
- **Authentication** — Passport.js local strategy with session persistence via MongoDB
- **Image Uploads** — Cloudinary integration via Multer for optimized storage
- **Reviews** — Authenticated users can post and delete reviews on listings
- **Flash Messaging** — User feedback on success/error actions
- **Custom Error Handling** — Centralized `ExpressError` with dedicated error view
- **Owner Controls** — Owners can manage their own listings and bookings separately

---

## 🔐 Security

- Passport.js session-based authentication
- MongoDB-backed session store with encryption (`connect-mongo`)
- HTTP-only cookies with 7-day expiry
- Middleware-level route protection (`isLoggedIn`, `isOwner`, `isReviewAuthor`)
- Joi-based server-side validation for listings and reviews
- Environment-gated Stripe key with placeholder fallback for development

---

## 📬 Contact

For issues or contributions, open a pull request or raise an issue on the repository.
