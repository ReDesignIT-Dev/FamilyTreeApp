import { useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { PATH_HOME, PATH_MY_TREE } from '@/router/routes';
import { useAppSelector } from '@/reduxComponents/hooks';
import AccountMenu from './AccountMenu';

export default function Header() {
    const navigate = useNavigate();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

    return (
        <AppBar position="static">
            <Toolbar>
                <Button color="inherit" onClick={() => navigate(PATH_HOME, { replace: true })}>
                    <AccountTree sx={{ mr: 1 }} />
                    Family Tree App
                </Button>

                {isLoggedIn && (
                    <Button color="inherit" onClick={() => navigate(PATH_MY_TREE, { replace: true })}>
                        My Family Tree
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <AccountMenu />
            </Toolbar>
        </AppBar>
    );
}