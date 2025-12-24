import { redirect } from 'next/navigation';

export default function Home() {
    // const { setCurrentUser } = useAppStore();
    // Initial Auth Check
    // useEffect(() => {
    //     const checkAuth = async () => {
    //         try {
    //             const { data } = await api.get('/users/me');
    //             setCurrentUser(data);
    //         } catch (error) {
    //             // Redirect logic handled in api interceptor or here
    //             console.error('Not authenticated');
    //         }
    //     };
    //     checkAuth();
    // }, [setCurrentUser]);
    // useEffect(() => {
    //     initAuth();
    // });

    redirect('/chats');
}
