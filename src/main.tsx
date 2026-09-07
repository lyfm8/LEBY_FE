import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './core/interceptors/error.interceptor';

async function enableMocking() {
    if (import.meta.env.DEV) {
        const { worker } = await import('./mocks/browser');
        return worker.start({
            onUnhandledRequest: 'bypass',
        });
    }
}

enableMocking().finally(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
});
