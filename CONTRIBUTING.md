# Contributing to Valorant Stats Bot

Thank you for considering contributing! 🎉

## 📋 How to Contribute
1. **Fork the repository**
   - Click the **Fork** button on the top‑right of the repo page.
2. **Clone your fork**
   ```bash
   git clone https://github.com/<your‑username>/valorant-stats-bot.git
   cd valorant-stats-bot
   ```
3. **Create a new branch** for your work (use a clear name).
   ```bash
   git checkout -b feat/your-feature
   ```
4. **Install dependencies**
   ```bash
   npm ci   # or yarn install / pnpm i
   ```
5. **Make your changes**
   - Follow the existing code style (ESLint + Prettier).
   - Write or update **unit tests** (Jest) for new functionality.
6. **Run the test suite**
   ```bash
   npm test
   ```
7. **Commit with a conventional message**
   ```bash
   git add .
   git commit -m "feat: description of your feature"
   ```
8. **Push and open a Pull Request**
   ```bash
   git push origin feat/your-feature
   ```
   - Fill the PR template, explain why the change is needed, and reference any related issues.

## 🧪 Testing
- The project uses **Jest** for unit tests. Add tests under the `src/**/*.test.ts` pattern.
- Run `npm run test` to execute the suite.
- CI will automatically run lint, type‑checking, and tests on each PR.

## 🧹 Code Style
- **ESLint** with the recommended TypeScript rules.
- **Prettier** formatting – run `npm run lint -- --fix` before committing.
- No `any` types – use explicit typings or generics.

## 🛡️ Security
- Do **not** commit `.env` or any secrets.
- Sensitive data must be read from environment variables.
- If you discover a vulnerability, please open a **private** issue or contact the maintainers directly.

## 📚 Documentation
- Keep the `README.md` up‑to‑date when adding new features.
- Add JSDoc comments to public functions.
- If you add new commands, update the **Commands** section in the README.

## 🎉 Thank You!
Your contributions make this bot better for the community. Happy coding!