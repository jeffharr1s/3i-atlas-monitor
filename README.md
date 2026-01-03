# 3I ATLAS Monitor

A web application that monitors 3I ATLAS data from global sources, analyzes it for "probable truths" using AI, and provides a dashboard for users to track significant changes.

## Features

- **Real-time Data Monitoring**: Continuously ingests and tracks 3I ATLAS data from configured global sources
- **AI-Powered Analysis**: Uses artificial intelligence to identify probable truths and significant patterns
- **Interactive Dashboard**: Beautiful, responsive dashboard built with React and Radix UI components
- **Change Tracking**: Monitors and alerts users to significant changes in the data
- **Modern Tech Stack**: Built with TypeScript, React, tRPC, and Drizzle ORM

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Recharts for data visualization
- Framer Motion for animations
- tRPC for type-safe API calls

### Backend
- Node.js with Express
- tRPC server
- Drizzle ORM for database management
- MySQL database
- TypeScript

### Development Tools
- Vite for fast development and building
- Vitest for testing
- Prettier for code formatting
- pnpm for package management

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (LTS recommended)
- **pnpm** (package manager)
- **MySQL** database (local or remote)
- **Git** for version control

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jeffharr1s/3i-atlas-monitor.git
cd 3i-atlas-monitor
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/atlas_monitor"

# Server Configuration
PORT=3000
NODE_ENV=development

# AI/API Keys (if applicable)
# Add your AI provider API keys here
AI_API_KEY=your_api_key_here
```

Adjust the `DATABASE_URL` to match your MySQL configuration.

### 4. Database Setup

Run the database migrations to set up your schema:

```bash
pnpm db:push
```

This command will:
- Generate the database schema
- Run migrations to create tables

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
pnpm dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend API**: `http://localhost:3000`

### Production Build

1. **Build the application**:

```bash
pnpm build
```

This compiles both the frontend and backend for production.

2. **Start the production server**:

```bash
pnpm start
```

The application will run on the port specified in your `.env` file (default: 3000).

## Available Scripts

- `pnpm dev` - Start development server with hot-reload
- `pnpm build` - Build for production (frontend + backend)
- `pnpm start` - Run production build
- `pnpm check` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run test suite with Vitest
- `pnpm db:push` - Generate and run database migrations

## Project Structure

```
3i-atlas-monitor/
├── client/              # Frontend React application
│   ├── src/
│   └── ...
├── server/              # Backend Express + tRPC server
│   ├── _core/          # Server core files
│   └── ...
├── shared/              # Shared types and utilities
├── drizzle/             # Database schema and migrations
├── patches/             # Package patches
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Using the Application

### Dashboard Overview

1. **Home/Dashboard**: View real-time data and insights about 3I ATLAS observations
2. **Data Sources**: Configure and manage your data source connections
3. **Analysis**: Review AI-generated insights and probable truth assessments
4. **Alerts**: Set up notifications for significant changes or anomalies

### Configuring Data Sources

1. Navigate to the settings or data sources section
2. Add your 3I ATLAS data feed URLs or API endpoints
3. Configure polling intervals and data filters
4. Save and activate your sources

### Understanding AI Analysis

The application uses AI to:
- Identify patterns across multiple data sources
- Score observations for reliability and significance
- Flag probable truths based on correlation and verification
- Alert on significant deviations or anomalies

## Development

### Code Style

This project uses Prettier for consistent code formatting. Run before committing:

```bash
pnpm format
```

### Type Checking

Ensure type safety across the codebase:

```bash
pnpm check
```

### Testing

Run the test suite:

```bash
pnpm test
```

## Database Management

The project uses Drizzle ORM for type-safe database operations.

### Modifying the Schema

1. Edit schema files in the `drizzle/` directory
2. Generate and run migrations:

```bash
pnpm db:push
```

### Database Schema

Key tables include:
- Data sources and configurations
- Observation records
- AI analysis results
- User notifications and alerts

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure production database URL
- [ ] Set up proper API keys and secrets
- [ ] Run `pnpm build` to create production bundle
- [ ] Set up process manager (PM2, systemd, etc.)
- [ ] Configure reverse proxy (nginx, Apache)
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall and security settings

### Deployment Options

- **VPS/Cloud Server**: Deploy to DigitalOcean, AWS, or similar
- **Container**: Docker/Docker Compose support can be added
- **Platform**: Adapt for Vercel, Railway, or other platforms

## Troubleshooting

### Common Issues

**Database connection fails**:
- Verify MySQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database user has proper permissions

**Port already in use**:
- Change `PORT` in `.env` file
- Kill process using the port: `lsof -ti:3000 | xargs kill`

**Dependencies won't install**:
- Clear pnpm cache: `pnpm store prune`
- Delete `node_modules` and `pnpm-lock.yaml`
- Run `pnpm install` again

**Build fails**:
- Run `pnpm check` to identify TypeScript errors
- Ensure all environment variables are set

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Built With Manus

This project was built using [Manus](https://manus.im), an AI-powered browser automation tool.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [Your contact information]

## Acknowledgments

- 3I ATLAS data providers
- Open source community
- All contributors
