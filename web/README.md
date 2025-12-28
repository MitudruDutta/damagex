# DamageX Frontend

The modern user interface for the DamageX system, built with **Next.js 14 (App Router)**.

## ⚡ Tech Stack

*   **Framework:** Next.js 14
*   **Styling:** Tailwind CSS v3
*   **Components:** Shadcn/UI (Radix Primitives)
*   **Animations:** Framer Motion
*   **Icons:** Lucide React & Tabler Icons
*   **Theme:** Next-Themes (Dark/Light mode)

## 🏃‍♂️ Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Backend:**
    Ensure your backend is running. By default, the frontend looks for `http://localhost:8000`.
    To change this, create `.env.local`:
    ```bash
    NEXT_PUBLIC_API_URL=http://your-backend-ip:8000/api/v1/predict/
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 🧩 Key Components

*   **`components/ui/file-upload.tsx`**: The main drag-and-drop interface with grid animations.
*   **`components/damage-gauge.tsx`**: Visualizes the confidence score using an SVG arc.
*   **`app/results/page.tsx`**: The results dashboard.

## 📦 Building for Production

```bash
npm run build
npm start
```
This generates a standalone build optimized for deployment.