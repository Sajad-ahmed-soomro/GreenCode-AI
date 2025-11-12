---
# 🧠 Quote Generator

A beautiful and minimal **quote generator** app built with **Next.js**, **ShadCN UI**, **Zod**, and **React Hook Form**. Users can search for quotes by topic and view up to three matching quotes. If no match is found, a friendly fallback message is shown.

---

## 🚀 Features

- 🔍 Search quotes by topic
- ⚡ Instant form validation using `zod` + `react-hook-form`
- 🎯 Displays up to **3 random quotes** on the searched topic
- 📭 Fallback message if no match: *"No quote found on this topic"*
- 💅 Styled using **Tailwind CSS** and **ShadCN UI components**
- Built with **Next.js App Router** and `use client` components

---

## 🧠 Technologies Used

- **Next.js 13+**
- **ShadCN UI**
- **Zod** (form validation)
- **React Hook Form**
- **Tailwind CSS**
- **JavaScript (ES6+)**

---

## 📁 Project Structure

```

assignment01/
├── app/
│   ├── page.tsx / page.jsx        # Main page
│   ├── quote.js                   # Local quotes dataset
├── components/
│   └── ui/                        # ShadCN form, input, button
├── public/
├── styles/
├── README.md
└── package.json

````

---

## 📦 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repo

```
https://github.com/Sajad-ahmed-soomro/Nexium_Sajad_Ahmed_Onboarding.git
cd assignment01
````

### 2. Install dependencies

```
npm install
```

### 3. Run the development server

```
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Usage Instructions

1. In the input field, type a **topic** (e.g. `life`, `future`, `creativity`)
2. Click the **Generate** button
3. You’ll see up to 3 matching quotes (or a fallback message if none match)

---

## 🧾 Sample Quote Data

Here's a sample of how your `quote.js` file looks:

```js
export const quotesData = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", topic: "future" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", topic: "life" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", topic: "simplicity" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein", topic: "creativity" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", topic: "life" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", topic: "creativity" }
]
```

---

## 🎨 UI Example

> Based on ShadCN's prebuilt form components:

* `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
* `Input` for topic search
* `Button` to trigger filtering
* Tailwind utility classes for styling
* Fallback `p` message and rendered `blockquote` quotes

---

## 💡 Future Ideas

* Add quote tags and filtering
* Fetch quotes from public APIs
* Animate quote display using Framer Motion
* Store search history locally


## 🤝 Contributions

PRs are welcome! Whether it's fixing a bug, adding quotes, or enhancing the UI — every contribution counts.

Made with ❤️ using React, Next.js, and ShadCN.

