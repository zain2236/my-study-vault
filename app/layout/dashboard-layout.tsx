import type { Route } from './+types/dashboard-layout';
import { useState, useEffect } from 'react';
import { Outlet, redirect, useSearchParams, useLocation } from 'react-router';

import { Header } from '~/components/dashboard-components/Header';
import { Sidebar } from '~/components/dashboard-components/Sidebar';
import { getUserId } from '~/utils/cookie-session/session.server';
import prisma from '~/utils/prisma.server';
import { useDebounce } from '~/utils/hooks/use-debounce';

export async function loader({ request }: Route.LoaderArgs) {
    try {
        const userId = await getUserId(request)
        if (!userId) {
            return redirect('/login')
        }
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return redirect('/login')
        }

        return {
            userName: user.user_name,
            profileImg: (user as any).profileImg || null,
            error: null
        }
    } catch (error) {
        return {
            userName: 'User',
            profileImg: null,
            error: 'Database connection failed'
        }
    }
}

export default function DashboardLayout({ loaderData }: any) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Get current search and semester from URL
    const urlSearchQuery = searchParams.get('search') || '';
    const semesterParam = searchParams.get('semester');
    const selectedSemester = semesterParam ? parseInt(semesterParam, 10) : null;

    // Local state for search input (for immediate UI updates)
    const [searchInputValue, setSearchInputValue] = useState(urlSearchQuery);
    
    // Sync local state with URL when URL changes (e.g., when semester filter clears search)
    useEffect(() => {
        setSearchInputValue(urlSearchQuery);
    }, [urlSearchQuery]);

    // Debounce the search input value
    const debouncedSearch = useDebounce(searchInputValue, 500);

    // Update URL when debounced search changes
    useEffect(() => {
        const currentSearch = searchParams.get('search') || '';
        const newSearch = debouncedSearch.trim();
        // Only update if the value actually changed to avoid infinite revalidation
        if (currentSearch === newSearch) return;
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (newSearch) {
                params.set('search', newSearch);
            } else {
                params.delete('search');
            }
            return params;
        }, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    // Handlers for search and filters
    const handleSearchChange = (value: string) => {
        setSearchInputValue(value);
    };

    const handleSemesterClick = (semester: number | null) => {
        // Clear search when semester filter changes
        setSearchInputValue('');
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        if (semester) {
            params.set('semester', semester.toString());
        } else {
            params.delete('semester');
        }
        setSearchParams(params, { replace: true });
    };

    // Get semester counts from dashboard loader data
    const [semesterCounts, setSemesterCounts] = useState<Record<number, number>>({});

    useEffect(() => {
        const updateCounts = () => {
            const counts = (window as any).dashboardSemesterCounts;
            if (counts) setSemesterCounts(counts);
        };
        updateCounts();
        // Use a more efficient approach: listen for custom event instead of polling
        const handleCountsUpdate = () => updateCounts();
        window.addEventListener('dashboardCountsUpdated', handleCountsUpdate);
        return () => {
            window.removeEventListener('dashboardCountsUpdated', handleCountsUpdate);
        };
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-800">
            {/* Top Navigation Bar */}
            <Header 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                userInfo={loaderData}
                searchQuery={searchInputValue}
                onSearchChange={handleSearchChange}
            />

            <div className="max-w-7xl mx-auto">
                <div className="flex">
                    {/* Sidebar */}
                    <Sidebar 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen}
                        selectedSemester={selectedSemester}
                        onSemesterClick={handleSemesterClick}
                        semesterCounts={semesterCounts}
                    />

                    {/* Main Content */}
                    <main className="flex-1 p-4 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}