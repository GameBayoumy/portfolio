# XR Portfolio Template

A comprehensive Next.js 14 template for creating immersive XR developer portfolios with React Three Fiber, TypeScript, and cutting-edge web technologies.

## 🚀 Features

- **Next.js 14** with App Router and TypeScript
- **React Three Fiber** for 3D experiences
- **Tailwind CSS** with custom XR-focused theme
- **Magic UI** components integration
- **WebXR** ready with AR/VR support
- **Performance optimized** for 3D content
- **Responsive design** with mobile-first approach
- **Dark/Light mode** with system preference detection
- **SEO optimized** with proper meta tags
- **Accessibility focused** with ARIA labels
- **PWA ready** for offline experience

## 🛠 Tech Stack

### Core Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 18** - Latest React features
- **Tailwind CSS** - Utility-first CSS framework

### 3D & XR Technologies
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Useful helpers for R3F
- **Three.js** - 3D JavaScript library
- **React Three XR** - WebXR integration

### UI & Animation
- **Magic UI** - Beautiful UI components
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── three/            # 3D components
│   ├── ui/               # UI components
│   ├── sections/         # Page sections
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript definitions
└── utils/                # Helper functions

public/
├── models/               # 3D models (.glb, .gltf)
├── textures/            # 3D textures
├── icons/               # App icons
└── images/              # Static images
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Copy template files to your project:**
   ```bash
   # Copy all template files to your project directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Your XR Portfolio"

# Feature Flags
NEXT_PUBLIC_ENABLE_XR_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_id
```

### Customization

1. **Update branding in `src/app/layout.tsx`**
2. **Modify colors in `tailwind.config.ts`**
3. **Add your projects in `src/data/projects.ts`**
4. **Customize 3D scenes in `src/components/three/`**

## 📱 Responsive Design

The template includes responsive breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

All components are optimized for touch interactions and various screen sizes.

## 🎨 Theming

### Color Scheme
The template uses a custom color system with:
- **Neon colors** for XR aesthetics
- **Glow effects** for interactive elements
- **Gradient backgrounds** for depth
- **Dark/Light mode** support

### Typography
- **Display font**: Orbitron (futuristic)
- **Body font**: Inter (readable)
- **Mono font**: JetBrains Mono (code)

## 🚀 Performance

### Optimizations Included
- **Image optimization** with Next.js Image
- **Code splitting** with dynamic imports
- **3D asset optimization** with compression
- **Bundle analysis** tools included
- **Lazy loading** for 3D components
- **Performance monitoring** in development

### Bundle Size
The template is optimized for performance:
- First Load JS: ~300KB (target)
- 3D libraries loaded on-demand
- Images served in WebP/AVIF formats

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript check
npm run format       # Format code with Prettier
npm run analyze      # Analyze bundle size
```

### Code Quality
- **ESLint** configuration for React and TypeScript
- **Prettier** for consistent formatting
- **Husky** pre-commit hooks
- **TypeScript** strict mode enabled

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
The template works on any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Digital Ocean

## 📊 Analytics & Monitoring

### Supported Services
- Google Analytics 4
- Vercel Analytics
- Sentry (error tracking)

Configure in environment variables and enable in `layout.tsx`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This template is open source and available under the MIT License.

## 🆘 Support

- Check the documentation
- Search existing issues
- Create a new issue for bugs
- Join our community discussions

## 🚀 Next Steps

After setup:

1. **Customize your portfolio content**
2. **Add your 3D models to `/public/models/`**
3. **Configure analytics and SEO**
4. **Deploy to your preferred platform**
5. **Share your amazing XR portfolio!**

---

Built with ❤️ for the XR developer community