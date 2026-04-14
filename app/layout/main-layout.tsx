import { Outlet } from "react-router";
import { Footer } from "~/components/layout-components/Footer";
import { Navbar } from "~/components/layout-components/Navbar";
import type { Route } from "./+types/main-layout";
import { getUserId } from "~/server/cookie-session/session.server";

export async function loader({request} : Route.LoaderArgs) {
    const userId = await getUserId(request)
    return {isLoggedIn : !! userId} 
}
export default function MainLayout({loaderData } : Route.ComponentProps ) {
    return (
        <>
        <Navbar isLoggedIn = {loaderData.isLoggedIn}/>
        <main>
        <Outlet />
        </main>
        <Footer />
        </>
    )
}