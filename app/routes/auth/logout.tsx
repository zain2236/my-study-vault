import type { Route } from './+types/logout';
import { logout } from '~/server/cookie-session/session.server';

export async function action({ request }: Route.ActionArgs) {
    return await logout(request);
}
