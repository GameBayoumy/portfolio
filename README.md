# XR Developer Portfolio - Sharif Bayoumy

A modern, interactive portfolio showcasing XR (Virtual/Augmented Reality) development work, built with Next.js 14, Three.js, and cutting-edge web technologies.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Three.js](https://img.shields.io/badge/Three.js-Latest-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

## ✨ Features

- **Interactive 3D Background** - Immersive VR headset model with mathematical shader effects
- **LinkedIn Professional Visualizers** - Interactive experience timeline, skills radar, and achievements
- **Performance Optimized** - Adaptive quality settings based on device capabilities
- **Responsive Design** - Perfect experience across desktop, tablet, and mobile
- **Modern UI Components** - Built with Magic UI and Tailwind CSS
- **XR Project Showcase** - Detailed project presentations with interactive elements
- **WebGL Fallbacks** - Graceful degradation for devices without WebGL support
- **SEO Optimized** - Full meta tags, OpenGraph, and structured data
- **Fast Loading** - Code splitting, lazy loading, and bundle optimization
- **CI/CD Pipeline** - Automated testing, deployment, and release management

## 🚀 Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling

### 3D Graphics & XR
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **D3.js** - Data visualization for LinkedIn components
- **WebXR Support** - For VR/AR experiences

### UI & Animation
- **Magic UI** - Modern animated components
- **Framer Motion** - Advanced animations
- **Lucide React** - Beautiful icons

### Performance & Quality
- **Adaptive Quality Settings** - Device-based optimization
- **Bundle Analysis** - Code splitting and optimization
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality control

### DevOps & CI/CD
- **GitHub Actions** - Automated CI/CD pipelines
- **Semantic Release** - Automated versioning and changelog
- **Conventional Commits** - Standardized commit messages
- **Vercel Deployment** - Automated production deployments
- **Quality Gates** - Automated testing and security scanning

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/GameBayoumy/portfolio.git
cd portfolio

# Install dependencies (with legacy peer deps for compatibility)
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Analyze bundle
npm run analyze
```

## 🎨 Project Structure

```
src/
├── components/          # React components
│   ├── three/          # Three.js 3D components
│   ├── linkedin/       # LinkedIn integration components
│   ├── sections/       # Page sections
│   └── ui/             # UI components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── styles/             # Global styles

app/                    # Next.js 14 App Router
├── api/                # API routes (version, sitemap, etc.)
├── layout.tsx          # Root layout
├── page.tsx            # Home page
└── globals.css         # Global styles

docs/                   # Documentation
├── architecture/       # System architecture docs
├── deployment/         # Deployment guides
└── *.md               # Feature specifications

.github/                # GitHub Actions workflows
├── workflows/          # CI/CD pipelines
└── actions/           # Reusable actions

public/                 # Static assets
├── models/             # 3D models
├── images/             # Images
└── fonts/              # Custom fonts
```

## 🎯 Key Components

### 3D Scene Components
- **VRHeadsetModel** - Interactive VR headset with animations
- **ParticleField** - Dynamic particle system
- **MathematicalShapes** - Animated geometric shapes
- **ThreeDBackground** - Main 3D scene manager

### LinkedIn Professional Components
- **ExperienceTimeline** - Interactive professional experience timeline
- **SkillsRadar** - D3.js-powered skills visualization
- **EducationTimeline** - Educational background with achievements
- **ExperienceCards** - Detailed experience information cards

### Page Sections
- **HeroSection** - Landing with animated introduction
- **AboutSection** - Skills, experience, and achievements
- **ProjectsSection** - Interactive project showcase
- **ContactSection** - Contact form and information

## ⚡ Performance Features

- **Adaptive Quality**: Automatically adjusts 3D quality based on device performance
- **Progressive Loading**: Critical path optimization and code splitting
- **Memory Management**: Automatic cleanup of 3D resources
- **Responsive 3D**: Adapts 3D complexity for different screen sizes
- **WebGL Detection**: Graceful fallbacks for unsupported devices

## 🎮 Interactive Elements

- **VR Headset**: Click to trigger animations and project highlights
- **Particle System**: Responds to user interactions
- **Smooth Scrolling**: Animated transitions between sections
- **Hover Effects**: Enhanced UI feedback throughout
- **Form Validation**: Real-time contact form validation

## 🌐 Deployment

### Automated CI/CD (Recommended)
The project includes a comprehensive CI/CD pipeline with:
- **Automated testing** on every push/PR
- **Quality gates** with linting and type checking
- **Security scanning** and dependency audits
- **Automated deployment** to Vercel on main branch
- **Semantic versioning** and changelog generation

Simply push to `main` branch to trigger automatic deployment.

### Manual Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Or connect your GitHub repository to Vercel dashboard
```

### Manual Build
```bash
# Build the project
npm run build

# The output will be in the `.next` directory for deployment
```

## 📱 Browser Support

- **Modern Browsers**: Chrome 91+, Firefox 90+, Safari 15+, Edge 91+
- **Mobile**: iOS Safari 15+, Chrome Mobile 91+
- **WebGL**: Required for 3D features (graceful fallback provided)
- **WebXR**: Optional, enhances VR/AR experiences where supported

## 🔧 Configuration

### Environment Variables
```env
CONTACT_EMAIL=your@email.com
GITHUB_URL=https://github.com/yourusername
LINKEDIN_URL=https://linkedin.com/in/yourprofile
```

### Performance Tuning
Adjust quality settings in `src/lib/utils.ts`:
```typescript
const settings = {
  low: { pixelRatio: 1, particleCount: 50 },
  medium: { pixelRatio: 1.5, particleCount: 150 },
  high: { pixelRatio: 2, particleCount: 300 }
};
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Sharif Bayoumy** - XR Developer & Computer Scientist

- Email: contact@sharifbayoumy.com
- GitHub: [@GameBayoumy](https://github.com/GameBayoumy)
- LinkedIn: [sharif-bayoumy](https://www.linkedin.com/in/sharif-bayoumy/)
- Portfolio: [sharifbayoumy.com](https://sharifbayoumy.com)

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for 3D graphics capabilities
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Magic UI](https://magicui.design/) for beautiful animated components
- [Vercel](https://vercel.com/) for seamless deployment platform

---

**Built with ❤️ for the XR community**