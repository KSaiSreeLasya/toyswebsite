# WonderLand Toys 🧸🚀

## Overview
This is a modern, AI-powered e-commerce store for toys. It uses **React** for the interface, **Tailwind CSS** for styling, and **Google Gemini** for AI features (product descriptions and the "Toy Geni" chatbot).

## 👨‍💻 Intern / Developer Guide

**Goal:** Maintain and update this app using AI tools to keep costs low and speed high.

### 1. Quick Start
1.  Install **Node.js** on your computer.
2.  Open this folder in a code editor (VS Code is recommended).
3.  Run `npm install` to get dependencies.
4.  Create a `.env` file and add the Google Gemini API Key:
    ```
    API_KEY=your_actual_api_key_here
    ```
5.  Run `npm start` to see the app in your browser.

### 2. Maintenance Playbook (How to use AI)

**Scenario A: Something is broken (e.g., "The cart doesn't update")**
1.  Locate the relevant file (e.g., `components/Cart.tsx` or `context/StoreContext.tsx`).
2.  Copy the **entire code** from that file.
3.  Paste it into an AI tool (ChatGPT, Gemini, Claude) with this prompt:
    > "Here is my React code. The cart is not updating when I click add. Please find the bug and give me the corrected code."
4.  Copy the result back into your file and save.

**Scenario B: You need to add a feature (e.g., "Add a 'New Arrival' badge")**
1.  Open `components/ProductList.tsx`.
2.  Paste code into AI:
    > "Update this component to show a glowing 'New Arrival' badge on products added in the last 7 days."

**Scenario C: Updating Payment Keys**
1.  You don't need code for this!
2.  Log in as **Admin**.
3.  Go to **Settings**.
4.  Enter the new Stripe/PayPal keys in the configuration panel.

### 3. File Structure Map
*   **`context/StoreContext.tsx`**: The "Brain" of the app. It holds the database of products, user sessions, and cart items. If data isn't saving, look here.
*   **`services/geminiService.ts`**: Handles the AI magic. If the Chatbot stops working, check this file.
*   **`components/`**: The visuals.
    *   `AdminPanel.tsx`: The back-office for the store owner.
    *   `Cart.tsx`: Checkout and payment forms.
    *   `ToyGeni.tsx`: The floating chatbot widget.

### 4. Going Live (Deployment)
*   **Frontend:** Drag and drop this project folder into **Netlify** or import it to **Vercel** (Free tier is great).
*   **Backend Upgrade:** Currently, this app uses `LocalStorage` (browser memory). To make it a real multi-user app, ask AI:
    > "How do I modify StoreContext.tsx to use Google Firebase for the database instead of LocalStorage?"
