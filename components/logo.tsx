
export const Logo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <circle cx="500" cy="500" r="500" fill="url(#paint0_linear_1394_2209)" />
        <rect x="452" y="167" width="380" height="380" rx="190" fill="white" />
        <rect x="152" y="423" width="300" height="300" rx="150" fill="white" />
        <rect x="500" y="648" width="150" height="150" rx="75" fill="white" />
        <defs>
            <linearGradient
                id="paint0_linear_1394_2209"
                x1="500"
                y1="0"
                x2="500"
                y2="1000"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#F9B16E" />
                <stop offset="1" stopColor="#F68080" />
            </linearGradient>
        </defs>
    </svg>
)