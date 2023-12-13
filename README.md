# TradeVault 📈

## Introduction
TradeVault is a next-generation trading journal, designed for traders to log trades, record thoughts, and leverage AI for feedback and analysis. It's an all-in-one platform for monitoring trading strategies, performance, and staying informed with the latest market news.

## Technologies Used 🛠️
- **Backend**: Express.js (MVC model)
- **Database**: MongoDB 🍃
- **Styling**: Tailwind CSS 💅
- **Dynamic UI and Modals**: Flowbite and DaisyUI 🌸
- **Charts and Visualizations**: ApexCharts 📊
- **Stock News API**: AlphaVantage API 🗞️
- **AI Feedback**: OpenAI API 🧠

## Features 🌟
### Trade Logging and Management
1. **Account Balance Update** 🔄: Update your account balance easily with an editable modal, ensuring your balance reflects your trade entries and exits.
2. **New Trade Addition** 🆕: Add new trades across various markets with features to upload setup images, notes, and more.
3. **Trade Entry Editing** ✏️: Click on any trade entry to bring up the edit menu with three tabs – update your current position, add to it, or sell partially or entirely. This feature dynamically updates your trades, the table, charts, and your account balance.

### Trade Analysis
1. **Profit/Loss Chart** 📊: Visualize your trading journey with a dynamic P&L chart powered by ApexCharts.
2. **AI Feedback on Trades** 🤖: Get AI-driven insights on your trades by clicking the "Get Feedback" button, powered by OpenAI API.
3. **Dynamic Stats** 📊: Track your performance with real-time stats including wins, losses, average win/loss, and overall P&L.

### Market News and Insights
1. **Top Headlines for Favorite Tickers** 🗞️: Get the latest headlines for your chosen stock tickers on the "news" page, complete with links to full articles.

## Optimizations and Improvements 🔍
We're committed to continuous improvement and are exploring enhancements like:
- **Integration with Trading Platforms**: Streamlining trade logging and management through direct platform integration.
- **Advanced AI Analytics**: Enhancing AI feedback with predictive analytics and personalized suggestions.
- **Social Trading Features**: Adding a community aspect for sharing and learning from fellow traders.
- **Real-Time Alerts and Notifications**: Developing alerts for key market and trading strategy events.
- **Customizable Dashboard**: Allowing users to tailor their dashboard with their preferred information.
- **Educational Resources**: Providing learning materials for traders at all levels.
- **Risk Management Tools**: Offering tools for better risk calculation and management.
- **Multi-Language Support**: Expanding accessibility with multiple language options.
- **Feedback and Continuous Improvement**: Regularly collecting user feedback to guide future developments.

## Installation and Setup 🔧
To get TradeVault up and running on your local machine, follow these steps:
1. **Clone the Repository**:
   \```bash
   git clone [your-repo-link]
   \```
2. **Install Dependencies**:
   \```bash
   npm install
   \```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory of the project and fill it with the following variables:
   \```
   PORT=desired_port_number
   DB_STRING=mongodb_uri_string
   CLOUD_NAME=cloudinary_cloud_name
   API_KEY=cloudinary_api_key
   API_SECRET=cloudinary_api_secret
   OPEN_AI_KEY=openai_api_key
   OPEN_AI_URL=openai_api_url
   ALPHA_VANTAGE_KEY=alphavantage_api_key
   \```
   Replace `desired_port_number`, `mongodb_uri_string`, `cloudinary_cloud_name`, `cloudinary_api_key`, `cloudinary_api_secret`, `openai_api_key`, `openai_api_url`, and `alphavantage_api_key` with your actual configuration values.
4. **Start the Server**:
   \```bash
   npm start
   \```

## Usage 🖥️
- **Logging Trades**: Navigate to the trade log section to enter trade details.
- **Editing Trades**: Easily modify any trade entry through the edit menu for precise management.
- **Viewing Charts**: Check the dashboard for your P&L charts and trade analysis.
- **Getting AI Feedback**: Submit a trade and receive AI-generated insights.
- **Stock News Updates**: Visit the news section for the latest updates on your stocks.

## Contributing 👐
Interested in contributing to TradeVault? We welcome your ideas and improvements. Please read our contributing guidelines for more information.

## License 📜
TradeVault is open-sourced software licensed under the MIT License. For more details, see the LICENSE file in the repository.

## Contact Information
- Email: [Email Me](mailto:anaismateusc@gmail.com)
- LinkedIn: [LinkedIn Profile](https://www.linkedin.com/in/anaïsmateus/)
- Twitter: [Twitter Profile](https://twitter.com/anaiscodes)
- Portfolio: [Personal Website](https://anaiscodes.netlify.app/)