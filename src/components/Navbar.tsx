import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './theme-provider';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from '../components/ui/resizeable-navbar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
    {
        name: 'Home',
        link: '/',
    },
];

export default function NavbarResizable() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    return (
        <div className="relative w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <NavbarButton variant="secondary">
                                    <Link to="/create">Create</Link>
                                </NavbarButton>
                                <NavbarButton variant="secondary" onClick={handleLogout}>
                                    Logout
                                </NavbarButton>
                            </>
                        ) : (
                            <>
                                <NavbarButton variant="secondary">
                                    <Link to="/login">Login</Link>
                                </NavbarButton>
                                <NavbarButton variant="secondary">
                                    <Link to="/register">Register</Link>
                                </NavbarButton>
                            </>
                        )}
                        {/* <NavbarButton
                            variant="primary"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </NavbarButton> */}
                        <Link to='/my-profile'>
                            <Avatar className="h-10 w-10">
                                <AvatarFallback >
                                    {user?.firstName[0]}{user?.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                            <Link
                                key={`mobile-link-${idx}`}
                                to={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="block">{item.name}</span>
                            </Link>
                        ))}
                        <div className="flex w-full flex-col gap-4">
                            {user ? (
                                <>
                                    <NavbarButton
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate('/create');
                                        }}
                                    >
                                        Create
                                    </NavbarButton>
                                    <NavbarButton
                                        variant="secondary"
                                        className="w-full"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </NavbarButton>
                                </>
                            ) : (
                                <>
                                    <NavbarButton
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate('/login');
                                        }}
                                    >
                                        Login
                                    </NavbarButton>
                                    <NavbarButton
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate('/register');
                                        }}
                                    >
                                        Register
                                    </NavbarButton>
                                </>
                            )}
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}