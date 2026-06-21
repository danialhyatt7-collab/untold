import './styles/main.css';
import App from './core/App.js';

const app = new App();
app.start();

// expose for debugging in dev
if (import.meta.env.DEV) window.__untold = app;
