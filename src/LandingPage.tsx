import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  Brain,
  Globe2,
  Zap,
  Play,
  ArrowRight,
  Github,
  FileSearch,
  Wand2,
  History,
  Moon,
  Columns,
  CheckCircle2,
  EyeOff,
  LineChart,
} from "lucide-react";

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fake 3D Particle Canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      z: number;
      size: number;
      vx: number;
      vy: number;
    }[] = [];
    const numParticles = 100;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      particles.forEach((p, i) => {
        p.z -= 2;
        if (p.z <= 0) {
          p.z = 1000;
          p.x = Math.random() * canvas.width - canvas.width / 2;
          p.y = Math.random() * canvas.height - canvas.height / 2;
        }

        const perspective = 300 / p.z;
        const x = p.x * perspective;
        const y = p.y * perspective;
        const size = p.size * perspective;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${1 - p.z / 1000})`;
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dz = p.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 150) {
            const p2Perspective = 300 / p2.z;
            const x2 = p2.x * p2Perspective;
            const y2 = p2.y * p2Perspective;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(79, 172, 254, ${(1 - dist / 150) * 0.3 * (1 - p.z / 1000)})`;
            ctx.stroke();
          }
        });
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-[#00f2fe]" />,
      title: "Instant Batch Screening",
      desc: "Bulk upload 100+ resumes, auto-rank candidates by relevance, and view summarized candidate cards instantly.",
    },
    {
      icon: <EyeOff className="w-8 h-8 text-[#00f2fe]" />,
      title: "Smart Bias Shield",
      desc: "One-click anonymization to mask names, gender, and graduation years, ensuring 100% compliant DE&I hiring.",
    },
    {
      icon: <Brain className="w-8 h-8 text-[#00f2fe]" />,
      title: "Contextual AI Search",
      desc: "Move beyond keyword matching; our AI understands career trajectories, skill depth, and synonym equivalents.",
    },
    {
      icon: <FileSearch className="w-8 h-8 text-[#00f2fe]" />,
      title: "Gap Analysis",
      desc: "Instantly compare a resume against a specific JD to find missing skills and ATS formatting issues.",
    },
    {
      icon: <Wand2 className="w-8 h-8 text-[#00f2fe]" />,
      title: "AI Smart Edit",
      desc: "Automatically rewrite weak resume bullet points using industry-standard action verbs and metrics.",
    },
    {
      icon: <History className="w-8 h-8 text-[#00f2fe]" />,
      title: "Version Control",
      desc: "Save multiple variations of resumes for different roles and easily switch between them in the dashboard.",
    },
    {
      icon: <LineChart className="w-8 h-8 text-[#00f2fe]" />,
      title: "Comparison Radar",
      desc: "Visually compare multiple candidates across technical fit, leadership, and culture fit axes.",
    },
    {
      icon: <Columns className="w-8 h-8 text-[#00f2fe]" />,
      title: "Kanban Pipeline",
      desc: "Drag-and-drop candidates through your recruitment stages with our intuitive integrated Kanban board.",
    },
    {
      icon: <Moon className="w-8 h-8 text-[#00f2fe]" />,
      title: "Adaptive Dark Mode",
      desc: "Eye-friendly interface that seamlessly transitions between light and dark themes based on preference.",
    },
  ];

  const fiftyFeatures = [
    "AI Resume Parsing",
    "Semantic Skill Matching",
    "Automated Gap Analysis",
    "AI Bullet Point Rewriting",
    "Multi-Version Resume Support",
    "Blind Hiring Mode",
    "DEI Bias Detection",
    "Candidate Radar Charts",
    "Kanban Pipeline View",
    "Dark Mode Support",
    "Printable Reports",
    "CSV Export",
    "Bulk Resume Upload",
    "ATS Readability Scoring",
    "Keyword Density Analysis",
    "Soft Skill Extraction",
    "Leadership Potential Scoring",
    "Experience Normalization",
    "Education Verification Prep",
    "Custom Filtering",
    "Interview Question Generation",
    "Technical Assessment Prep",
    "Salary Insights (Predicted)",
    "Location Tracking",
    "Source Attribution",
    "Time-in-Role Analysis",
    "Career Velocity Tracking",
    "Job Description Parsing",
    "Required vs Nice-to-Have Matching",
    "Auto-Rejection Filtering",
    "Smart Shortlisting",
    "PDF & TXT Support",
    "Responsive Mobile Design",
    "Print-Optimized Views",
    "Real-Time Scoring",
    "Offline History Storage",
    "Recent Scans Memory",
    "Side-by-Side Comparison",
    "Action Verb Detection",
    "Impact Metric Highlighting",
    "Formatting Issue Detection",
    "Typo & Grammar Flagging",
    "Missing Skill Suggestions",
    "Industry Standard Alignment",
    "Executive Summary Generation",
    "Candidate Contact Extraction",
    "Portfolio Link Parsing",
    "GitHub Profile Analysis",
    "LinkedIn Pattern Matching",
    "Zero-Data Retention Mode",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden relative selection:bg-[#00f2fe] selection:text-gray-900">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00f2fe]/10 via-transparent to-transparent"></div>
      </div>

      {/* Fake-3D Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none opacity-60"
      />

      <div className="relative z-10">
        {/* Glassmorphic Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] flex items-center justify-center text-gray-950 shadow-[0_0_15px_rgba(0,242,254,0.5)]">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                AI Resume Checker
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide"
              >
                Features
              </a>
              <a
                href="#capabilities"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide"
              >
                50+ Capabilities
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide"
              >
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onLaunch}
                className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide"
              >
                Login
              </button>
              <button
                onClick={onLaunch}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-gray-950 font-bold text-sm tracking-wide hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* HERO AREA */}
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Hire for Context,
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe]">
                Not Keywords.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
              The ultimate AI-powered Talent Intelligence Suite boasting over
              50+ advanced features to decode career velocity, eliminate ATS
              bias, and instantly upgrade your hiring workflow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={onLaunch}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] rounded-full text-gray-950 font-bold text-lg tracking-wide hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all flex items-center gap-3 w-full sm:w-auto justify-center hover:scale-105"
              >
                Launch Application
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onLaunch}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-medium text-lg tracking-wide backdrop-blur-sm transition-all flex items-center gap-3 w-full sm:w-auto justify-center hover:border-white/20"
              >
                <Play className="w-5 h-5 text-[#00f2fe]" />
                Explore 50+ Features
              </button>
            </div>
          </motion.div>
        </main>

        {/* CORE FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Highlight Features
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our most powerful capabilities designed to uncover top talent
              faster and fairer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-white/5 hover:border-[#00f2fe]/30 p-8 rounded-3xl transition-all hover:bg-gray-800/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00f2fe]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                <div className="w-14 h-14 rounded-2xl bg-gray-950/80 border border-white/5 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 50+ CAPABILITIES GRID */}
        <section
          id="capabilities"
          className="max-w-7xl mx-auto px-6 py-24 border-t border-white/10"
        >
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe]">
                50+ Enterprise Capabilities
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A comprehensive suite covering every aspect of modern talent
              intelligence and resume optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fiftyFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 10) * 0.05 }}
                onClick={onLaunch}
                className="flex items-center gap-3 bg-gray-900/40 border border-white/5 p-4 rounded-xl hover:bg-gray-800 hover:border-[#00f2fe]/40 transition-colors cursor-pointer group"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00f2fe] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS WORKFLOW */}
        <section
          id="how-it-works"
          className="max-w-7xl mx-auto px-6 py-24 border-t border-white/10"
        >
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Drop your resumes and let our AI handle the rest.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#00f2fe]/30 to-transparent -translate-y-1/2 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center p-6 bg-gray-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-gray-950 border border-[#00f2fe]/30 flex items-center justify-center text-2xl font-black text-[#00f2fe] mb-6 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                Upload Resumes
              </h3>
              <p className="text-gray-400 text-sm">
                Sync your existing ATS or simply drag-and-drop your candidate
                resumes in bulk.
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center p-6 bg-gray-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-gray-950 border border-[#00f2fe]/30 flex items-center justify-center text-2xl font-black text-[#00f2fe] mb-6 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                AI Rank & Filter
              </h3>
              <p className="text-gray-400 text-sm">
                Our AI extracts skills, contextualizes experience, and ranks
                candidates against your criteria.
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center p-6 bg-gray-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-gray-950 border border-[#00f2fe]/30 flex items-center justify-center text-2xl font-black text-[#00f2fe] mb-6 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                Shortlist & Analyze
              </h3>
              <p className="text-gray-400 text-sm">
                Review an instant shortlist of the best candidates, run gap
                analyses, and export reports.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <button
              onClick={onLaunch}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold text-sm tracking-wide transition-all hover:border-[#00f2fe]/50"
            >
              Get Started Now
            </button>
          </div>
        </section>

        {/* TRUST & COMPLIANCE */}
        <section className="bg-[#00f2fe]/5 py-16 border-y border-[#00f2fe]/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
              Trusted & Compliant
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-70">
              <span className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-300">
                SOC 2 Type II
              </span>
              <span className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-300">
                GDPR Compliant
              </span>
              <span className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-300">
                EEOC / CCPA Aligned
              </span>
              <span className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-300">
                Greenhouse Partner
              </span>
              <span className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-300">
                Workday Integration
              </span>
            </div>
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="bg-gray-900/40 p-8 rounded-3xl border border-white/5 text-left relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#00f2fe] text-gray-950 text-xs font-black px-3 py-1 rounded-full">
                  40% FASTER
                </div>
                <p className="italic text-gray-300 mb-6">
                  "Reduced our time-to-hire by 40% in month one. The contextual
                  analysis caught top candidates our old keyword scanners
                  completely missed."
                </p>
                <div>
                  <p className="font-bold text-white">Sarah Jenkins</p>
                  <p className="text-sm text-[#00f2fe]">
                    VP of Talent Acquisition, TechGrowth
                  </p>
                </div>
              </div>
              <div className="bg-gray-900/40 p-8 rounded-3xl border border-white/5 text-left relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#00f2fe] text-gray-950 text-xs font-black px-3 py-1 rounded-full">
                  3X PLACEMENTS
                </div>
                <p className="italic text-gray-300 mb-6">
                  "We batch process hundreds of resumes daily. The instant
                  ranking and contextual search have tripled our agency's
                  successful placements."
                </p>
                <div>
                  <p className="font-bold text-white">Marcus Chen</p>
                  <p className="text-sm text-[#00f2fe]">
                    Founder, Apex Recruiting
                  </p>
                </div>
              </div>
              <div className="bg-gray-900/40 p-8 rounded-3xl border border-white/5 text-left relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#00f2fe] text-gray-950 text-xs font-black px-3 py-1 rounded-full">
                  100% UNBIASED
                </div>
                <p className="italic text-gray-300 mb-6">
                  "The one-click anonymization is a game changer for our DE&I
                  goals. We're interviewing a much more diverse,
                  highly-qualified talent pool."
                </p>
                <div>
                  <p className="font-bold text-white">Elena Rodriguez</p>
                  <p className="text-sm text-[#00f2fe]">
                    Head of HR, GlobalScale
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TIERS */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Scale your hiring without scaling your costs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-white/10 hover:border-[#00f2fe]/30 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">
                Free Trial / Pilot
              </h3>
              <p className="text-[#00f2fe] font-black text-4xl mb-6">
                $0
                <span className="text-sm text-gray-500 font-medium"> / mo</span>
              </p>
              <ul className="text-gray-400 text-sm space-y-4 mb-8">
                <li>• Up to 50 resumes/month</li>
                <li>• Basic Contextual Search</li>
                <li>• Standard Bias Shield</li>
              </ul>
              <button
                className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 font-bold text-white transition-colors"
                onClick={onLaunch}
              >
                Start Free Trial
              </button>
            </div>
            <div className="bg-gradient-to-b from-[#00f2fe]/10 to-transparent p-8 rounded-3xl border border-[#00f2fe]/50 shadow-[0_0_30px_rgba(0,242,254,0.1)] relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#00f2fe] text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Growth Tier</h3>
              <p className="text-[#00f2fe] font-black text-4xl mb-6">
                $299
                <span className="text-sm text-gray-500 font-medium"> / mo</span>
              </p>
              <ul className="text-gray-400 text-sm space-y-4 mb-8">
                <li>• Unlimited Parsing</li>
                <li>• Standard ATS Integrations</li>
                <li>• Candidate Cloning Tool</li>
                <li>• Auto-Generated Interview Questions</li>
              </ul>
              <button
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-gray-950 font-bold hover:scale-105 transition-transform"
                onClick={onLaunch}
              >
                Upgrade to Growth
              </button>
            </div>
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-white/10 hover:border-[#00f2fe]/30 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-white font-black text-4xl mb-6">Custom</p>
              <ul className="text-gray-400 text-sm space-y-4 mb-8">
                <li>• Custom ATS Integrations</li>
                <li>• Dedicated Account Support</li>
                <li>• Strict SLA Agreements</li>
                <li>• Custom Compliance Audits</li>
              </ul>
              <button className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 font-bold text-white transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* PRE-FOOTER CTA */}
        <section className="border-t border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
              Stop digging through inbox piles.
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Experience the full suite of 50+ talent intelligence features
              today.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onLaunch}
                className="px-8 py-4 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] rounded-full text-gray-950 font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,242,254,0.3)]"
              >
                Launch Application
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-gray-950/80 backdrop-blur-lg py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#4facfe]" />
              <span className="font-bold text-lg tracking-tight text-white">
                AI Resume Checker
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Built for the India runs data and AI challenge.
            </p>
            <div className="flex items-center gap-4 text-gray-500">
              <a href="#" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
