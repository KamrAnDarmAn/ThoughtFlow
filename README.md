# Snipr

Snipr is a URL shortener built with **Node.js**, **Express**, **Prisma**, and **MySQL**.  
It shortens long URLs, stores them in a database, and generates a unique **QR code** for each shortened link.  
Scanning the QR code instantly redirects users to the original URL.

---

## 🚀 Features

- Shorten any long URL with ease
- Store URLs securely in MySQL using Prisma ORM
- Auto-generate unique QR codes for each shortened URL
- Redirect via short link or QR code scan
- RESTful API for integration

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express
- **Database:** MySQL with Prisma ORM
- **Utilities:** QR Code Generator (`qrcode` package)

---

## 📦 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/KamrAnDarmAn/snipr.git
cd snipr
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the root directory and set:

```env
DATABASE_URL="mysql://user:password@localhost:3306/snipr"
PORT=5000
```

### 4️⃣ Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

### 5️⃣ Start the server

```bash
npm start
```

---

## 🤝 Contributing

Contributions are welcome!
If you’d like to help improve Snipr:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a **Pull Request**

---

## 📜 License – MIT

MIT License

Copyright (c) 2025 Kamran Darman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
# ThoughtFlow
# ThoughtFlow
