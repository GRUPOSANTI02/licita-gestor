/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/dashboard',
                destination: '/',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
