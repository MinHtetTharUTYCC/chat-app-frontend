import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

function UserAvatar({
    url = 'https://images.unsplash.com/pphoto-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    size = 6,
    username,
}: {
    url?: string;
    size?: number;
    username: string;
}) {
    return (
        <Avatar className={`size-${size} bg-secondary cursor-pointer`}>
            <AvatarImage src={url} />
            <AvatarFallback className="w-full flex items-center justify-center">
                <p className="text-center text-xs">{username.substring(0, 2).toUpperCase()}</p>
            </AvatarFallback>
        </Avatar>
    );
}

export default UserAvatar;
