import { AuthProvider } from '@/features/auth';
import { ToastProvider, ConfirmProvider } from '@/core/ui';
import AppRoutes from '@/routes';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <ConfirmProvider>
                    <AppRoutes />
                </ConfirmProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;

