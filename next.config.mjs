/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  rewrites: async () => [{ source: '/', destination: '/home' }],
  redirects: async () => [
    { source: '/home', destination: '/', permanent: true },
    { source: '/chats/messages', destination: '/', permanent: true },
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '**' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com', pathname: '**' },
    ],
  },
};

export default nextConfig;
