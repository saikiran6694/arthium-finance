# 💰 AI-Powered Finance Platform

An **intelligent finance management platform** that helps users track, analyze, and automate their personal or business transactions.  
Users can upload transactions **manually** or through **receipts**, which are automatically analyzed using **Gemini AI** to extract key details such as date, amount, merchant, and category.

---

## 🚀 Features

### 🧠 AI Receipt Analysis
- Upload receipts and get transaction details extracted automatically using **Gemini AI**.
- Supports multiple receipt formats (image/pdf).

### 📊 Financial Insights & Visualization
- Automatically analyzes transactions to calculate:
  - Total income and expenses  
  - Income-to-expense ratio  
  - Monthly spending trends
- Interactive charts and graphs for data visualization.

### 🔁 Automation & Reports
- Automatically generates reports and transactions at user-defined time intervals.
- **Cron job system** for scheduled automation.

### 💬 AI Chat Interface
- Ask questions about your finances in **natural language** and get intelligent, context-aware responses.
- Powered by **Gemini AI** with full conversation history support (up to 50 messages).
- Responses are dynamically formatted based on the query:
  - 📝 **Text** — for general questions and summaries
  - 📋 **Bullets** — for lists and breakdowns
  - 📊 **Tables** — for structured transaction data
  - 📈 **Charts** — for trends (line, bar, pie, donut)
- The AI queries your personal finance database to give answers grounded in your actual data.

### 🔐 Secure Authentication & Authorization
- Custom-built **authentication and authorization** system.  
- Implemented **CSRF protection** and **JWT-based tokenization** from scratch.

### ☁️ Cloud Integration
- Upload and store receipts securely using **Cloudinary**.  
- Integrated **CI/CD pipeline** with **GitHub Actions** for continuous deployment.