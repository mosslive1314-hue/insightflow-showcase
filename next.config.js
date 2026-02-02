/** @type {import('next').NextConfig} */
const nextConfig = {
  // 删除 output: 'export'，使用 SSR 模式
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
