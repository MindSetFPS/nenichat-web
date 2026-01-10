import { avataaars } from "@dicebear/collection"
import { createAvatar } from "@dicebear/core"
import { AvatarImage } from "./ui/avatar"

export default function ContactAvatar({ seed }: { seed: string }) {
    const avatar = createAvatar(avataaars, {
        seed: seed,
        size: 64,
    })
    const avatarSvg = avatar.toDataUri()
    return (
        <AvatarImage src={avatarSvg} />
    )
}