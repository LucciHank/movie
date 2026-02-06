import { useEffect, useState } from 'react';
import { Box, Typography, Dialog, DialogContent } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const DevToolsBlocker = () => {
    const [showWarning, setShowWarning] = useState(false);

    // Skip blocking in development mode (localhost) or on mobile devices
    const isDevelopment = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('192.168.')
    );

    const isMobile = typeof window !== 'undefined' && (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 1024 // Tablet and below
    );

    useEffect(() => {
        // Don't block in development or on mobile
        if (isDevelopment || isMobile) return;

        let devtoolsOpen = false;
        const threshold = 160;

        const checkDevTools = () => {
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;

            if (widthDiff || heightDiff) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    setShowWarning(true);

                    // Reload after 5 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 5000);
                }
            } else {
                devtoolsOpen = false;
            }
        };

        // Check on resize
        window.addEventListener('resize', checkDevTools);

        // Also check periodically
        const interval = setInterval(checkDevTools, 1000);

        // Disable right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        const handleKeyDown = (e) => {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85) // Ctrl+U (view source)
            ) {
                e.preventDefault();
                setShowWarning(true);
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Initial check
        checkDevTools();

        return () => {
            window.removeEventListener('resize', checkDevTools);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, [isDevelopment]);

    return (
        <Dialog
            open={showWarning}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'error.dark',
                    borderRadius: 3
                }
            }}
        >
            <DialogContent>
                <Box sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'white'
                }}>
                    <WarningAmberIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        ⚠️ Cảnh báo!
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Không được vào đây xem đâu cưng 😘
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        Trang sẽ tự động tải lại sau 5 giây...
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default DevToolsBlocker;
