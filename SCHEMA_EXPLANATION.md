# Database Schema Explanation

This document provides a detailed breakdown of the Supabase PostgreSQL database schema for the TreeKart platform. It outlines all the tables, what they represent, and the specific purpose of each column.

---

## 1. `profiles`
**Purpose**: Stores extended user profile data for all users across the platform, including customers, farmers, and administrators. It connects directly to the Supabase internal `auth.users` system via the `id` field.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. Matches the `id` in Supabase's built-in `auth.users` table. |
| `full_name` | `TEXT` | The user's full display name. |
| `avatar_url` | `TEXT` | URL pointing to the user's profile picture. |
| `phone` | `TEXT` | Contact phone number for the user. |
| `role` | `user_role` (Enum) | Defines the access level: `user` (customer), `farmer` (vendor), or `admin`. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of when the profile was created. |

---

## 2. `farmers`
**Purpose**: Stores specific business and verification details for users who act as farmers (tree vendors) on the platform.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `profile_id` | `UUID` | Foreign key linking to the `profiles` table. |
| `farm_name` | `TEXT` | The registered or public name of the farm. |
| `farm_size_acres` | `NUMERIC` | Total size of the farmland in acres. |
| `is_organic` | `BOOLEAN` | True if the farm utilizes certified/organic farming practices. |
| `location` | `TEXT` | General address or region of the farm. |
| `documents` | `JSON` | Stores paths/URLs to uploaded legal and verification documents. |
| `commission_pct` | `NUMERIC` | The percentage of revenue taken by the platform (or allocated to the farmer). |
| `status` | `farmer_status` (Enum) | Current onboarding status: `pending`, `approved`, or `rejected`. |
| `rejection_reason` | `TEXT` | Admin notes detailing why an application was rejected. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of when the farmer application was submitted. |

---

## 3. `trees`
**Purpose**: Represents individual mango trees that are available for customers to lease/rent per season.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `farmer_id` | `UUID` | Foreign key linking to the `farmers` table indicating ownership. |
| `variety` | `TEXT` | The mango breed (e.g., Alphonso, Banganapalli). |
| `age_years` | `NUMERIC` | The age of the tree in years (affects yield). |
| `yield_min_kg` | `NUMERIC` | The expected minimum mango yield during harvest. |
| `yield_max_kg` | `NUMERIC` | The expected maximum mango yield during harvest. |
| `price` | `NUMERIC` | The leasing price per season. |
| `plan_type` | `plan_type` (Enum) | The leasing tier/category: `basic`, `standard`, or `max`. |
| `source` | `tree_source` (Enum) | Tracks if the tree is from an `own_farm` or a `partner`. |
| `status` | `tree_status` (Enum) | Current market status: `available` (listed), `rented` (taken), or `inactive` (hidden). |
| `is_verified` | `BOOLEAN` | True if an admin has physically/virtually verified the tree's health and details. |
| `gps_lat` | `NUMERIC` | Latitude coordinate for map positioning. |
| `gps_lng` | `NUMERIC` | Longitude coordinate for map positioning. |
| `photos` | `JSON` | Array of image URLs showing the specific tree. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of when the tree was added to the catalog. |

---

## 4. `rentals`
**Purpose**: Acts as the lease contract linking a customer to a specific tree for a specific harvesting season.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `user_id` | `UUID` | Foreign key linking to the customer's `profiles` record. |
| `tree_id` | `UUID` | Foreign key linking to the rented `trees` record. |
| `season` | `TEXT` | Identifier for the harvest season (e.g., "Summer 2026"). |
| `amount_paid` | `NUMERIC` | The total money paid for this lease. |
| `payment_id` | `TEXT` | Razorpay or external payment gateway reference ID. |
| `status` | `rental_status` (Enum) | Lifecycle of the lease: `active`, `completed`, or `cancelled`. |
| `delivery_address` | `JSON` | The shipping address where the harvested mangoes should be sent. |
| `visit_requested` | `BOOLEAN` | True if the user requested an in-person visit to their tree. |
| `rented_at` | `TIMESTAMPTZ` | Timestamp marking when the transaction and lease began. |

---

## 5. `tree_updates`
**Purpose**: Stores media updates (like a social feed) posted by farmers or admins to show customers the progress/health of their rented trees.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `tree_id` | `UUID` | Foreign key linking to the `trees` table. |
| `rental_id` | `UUID` | Foreign key linking to `rentals` (so specific customers receive notifications). |
| `title` | `TEXT` | A short summary of the update (e.g., "First Flowers!"). |
| `description` | `TEXT` | A detailed update on the tree's health and timeline. |
| `photos` | `JSON` | Array of image URLs showing the current state of the tree. |
| `video_url` | `TEXT` | URL pointing to an external video update. |
| `mux_asset_id` | `TEXT` | Specific identifier if Mux is used for video streaming. |
| `posted_at` | `TIMESTAMPTZ` | Timestamp of when the update was published. |

---

## 6. `mango_products`
**Purpose**: Used for the direct e-commerce storefront where users buy boxes of mangoes instead of leasing entire trees.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `name` | `TEXT` | The display name of the product. |
| `description` | `TEXT` | E-commerce product description/details. |
| `price` | `NUMERIC` | Current selling price. |
| `original_price` | `NUMERIC` | The original price (used to calculate discount percentages). |
| `badge` | `product_badge` (Enum)| UI highlight tags: `Pre-Order`, `Sale`, `New`, or `None`. |
| `status` | `product_status` (Enum)| Shopping cart logic check: `available`, `pre_order`, or `out_of_stock`. |
| `variety` | `TEXT` | Mango variety type. |
| `weight_kg` | `NUMERIC[]` | Array of available weight variants for the product. |
| `image_url` | `TEXT[]` | Array of URLs for product images (first image is thumbnail). |
| `created_at` | `TIMESTAMPTZ` | Timestamp of when the product was added. |
| `updated_at` | `TIMESTAMPTZ` | Timestamp of the last price/detail modification. |

---

## 7. `orders`
**Purpose**: E-commerce fulfillment records for items purchased from the `mango_products` storefront.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `user_id` | `UUID` | Foreign key linking to the customer's `profiles` record. |
| `items` | `JSON` | A snapshot array of the cart contents at purchase (qty, specific price at the time, IDs). |
| `total_amount` | `NUMERIC` | The grand total paid by the customer. |
| `delivery_address` | `JSON` | Shipping destination details. |
| `payment_id` | `TEXT` | Razorpay order/payment reference ID. |
| `status` | `order_status` (Enum) | Logistics lifecycle: `pending`, `confirmed`, `shipped`, or `delivered`. |
| `tracking_id` | `TEXT` | Waybill or tracking number provided by the courier. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of when the checkout occurred. |

---

## 8. `custom_plan_leads`
**Purpose**: Stores CRM leads for B2B or high-volume customers who submit contact forms inquiring about large-scale or custom tree leasing plans.

| Column Name | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `name` | `TEXT` | The prospect's name. |
| `email` | `TEXT` | The prospect's email address. |
| `phone` | `TEXT` | The prospect's phone number. |
| `tree_count` | `NUMERIC` | How many trees they are interested in leasing. |
| `message` | `TEXT` | Custom requests or context provided by the prospect. |
| `status` | `lead_status` (Enum) | Admin pipeline tracking: `new`, `contacted`, `quoted`, or `closed`. |
| `admin_notes` | `TEXT` | Internal notes added by the sales or admin team. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of when the form was submitted. |
