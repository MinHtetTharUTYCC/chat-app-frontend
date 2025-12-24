import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

function UserAvatar({
    url = `${process.env.NEXT_PUBLIC_AVATAR_PLACEHOLDER}`,
    size = 6,
    username,
}: {
    url?: string;
    size?: number;
    username: string;
}) {
    const avatarSize = `size-${size}`;
    return (
        <Avatar className={`${avatarSize} bg-secondary cursor-pointer`}>
            <AvatarImage src={url} />
            <AvatarFallback className="w-full flex items-center justify-center">
                <p className="text-center text-xs">{username.substring(0, 2).toUpperCase()}</p>
            </AvatarFallback>
        </Avatar>
    );
}

export default UserAvatar;
