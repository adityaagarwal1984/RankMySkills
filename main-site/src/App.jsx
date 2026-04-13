import React, { useState, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { Play, ArrowRight, ShieldCheck, BarChart3, Users } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("3D Background Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 h-screen w-screen pointer-events-none opacity-20 bg-gradient-to-b from-[#00df9a]/10 to-transparent"></div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1118] text-white relative overflow-x-hidden font-sans">
      
      {/* Interactive Spline 3D Background */}
      <div className="fixed inset-0 z-0 h-screen w-screen pointer-events-none opacity-50 mix-blend-screen overflow-hidden">
         <ErrorBoundary>
           <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9I/scene.splinecode" />
         </ErrorBoundary>
      </div>
      
      {/* Fixed Transparent Header */}
      <nav className={`fixed top-0 left-0 w-full z-50 py-5 px-8 flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-[#0a1118]/80 backdrop-blur-xl border-b border-emerald-500/20 shadow-[0_4px_30px_rgba(16,185,129,0.15)]' : 'bg-transparent border-b border-transparent'}`}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        >
          <div className="w-9 h-9 rounded bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-[#04080c] shadow-lg shadow-emerald-500/50">
            R
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">RankMy<span className="text-emerald-400">Skills</span></span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex gap-10 text-sm font-semibold tracking-wide text-gray-300 uppercase"
        >
          <a href="#ecosystem" className="hover:text-emerald-400 transition-colors drop-shadow-[0_0_8px_rgba(16,185,129,0)] hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Dashboards</a>
          <a href="#process" className="hover:text-emerald-400 transition-colors drop-shadow-[0_0_8px_rgba(16,185,129,0)] hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">How It Works</a>
          <a href="#demo" className="hover:text-emerald-400 transition-colors drop-shadow-[0_0_8px_rgba(16,185,129,0)] hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Demo</a>
        </motion.div>
        {/* <motion.a 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          href="https://college.rankmyskills.in"
          className="border border-emerald-500 hover:bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
        >
          College Login
        </motion.a> */}
      </nav>

      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pb-24 flex flex-col lg:flex-row items-center gap-12 relative">
          
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen animate-pulse"></div>

          <div className="lg:w-1/2 flex flex-col gap-6 z-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-400 w-fit text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              UNIFIED ECOSYSTEM
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-6xl font-extrabold leading-[1.1] tracking-tight"
            >
              
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-green-300">
                A Unified Ecosystem
              </span> <br/>
              for Engineering Student Growth and Placement Intelligence
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed"
            >
              One ecosystem. Three dashboards. Complete visibility into student performance, college rankings, and placement outcomes.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <a 
                href="https://rankmyskills.in" 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 text-[#04080c] px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] transform hover:-translate-y-1 hover:scale-[1.02]"
              >
                Open Student Dashboard <ArrowRight size={18} />
              </a>
              <a 
                href="https://admin.rankmyskills.in" 
                className="bg-[#0b131c]/50 backdrop-blur-md border border-emerald-500/40 text-emerald-400 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1"
              >
                Admin Dashboard <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            {/* Abstract visual representation of a dashboard in 3D-ish CSS */}
            <div className="relative w-full max-w-lg mx-auto aspect-video rounded-xl border border-white/10 bg-[#0d1620] shadow-2xl overflow-hidden transform perspective-1000 rotate-y-[-5deg] rotate-x-[5deg]">
              <div className="absolute top-0 w-full h-8 bg-[#121c26] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 text-xs text-gray-500 font-mono">rankmyskills.in/dashboard</div>
              </div>
              <div className="p-6 pt-12 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-1/3 h-24 rounded-lg bg-[#162330] border border-white/5 p-4">
                    <div className="text-xs text-gray-500 mb-2">STUDENTS</div>
                    <div className="text-2xl font-bold">1,248</div>
                    <div className="text-xs text-emerald-400 mt-1">+12% this month</div>
                  </div>
                  <div className="w-1/3 h-24 rounded-lg bg-[#162330] border border-white/5 p-4">
                    <div className="text-xs text-gray-500 mb-2">ASSESSMENTS</div>
                    <div className="text-2xl font-bold">3,820</div>
                    <div className="text-xs text-emerald-400 mt-1">+8% this month</div>
                  </div>
                  <div className="w-1/3 h-24 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/5 p-4 border border-emerald-500/30">
                    <div className="text-xs text-emerald-400/80 mb-2">RANKING</div>
                    <div className="text-2xl font-bold text-emerald-400">#3</div>
                    <div className="text-xs text-gray-400 mt-1">Nationally</div>
                  </div>
                </div>
                <div className="w-full h-32 rounded-lg bg-[#162330] border border-white/5 p-4 flex items-end gap-2">
                   {/* Fake chart bars */}
                   {[40, 60, 45, 80, 55, 90, 70, 100].map((h, i) => (
                     <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/20 to-teal-400/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                   ))}
                </div>
              </div>
            </div>
            
            {/* Floating element */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-8 top-16 bg-[#162330] border border-white/10 p-3 rounded-lg shadow-xl flex items-center gap-3 backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users size={18} />
              </div>
              <div>
                <div className="text-sm font-bold">New Student Joined</div>
                <div className="text-xs text-gray-400">Sneha Patel • 2 min ago</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Dashboards Section */}
        <section id="ecosystem" className="py-24 bg-[#080d13] relative border-t border-white/5">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-emerald-400 font-semibold tracking-widest text-sm mb-4 uppercase">THE ECOSYSTEM</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-16">Three Dashboards. <span className="text-emerald-400">One Unified Platform.</span></h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
              {/* Card 1 */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-[#0f1722] border border-white/5 hover:border-emerald-500/30 p-8 rounded-2xl shadow-lg transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/[0.02] pointer-events-none group-hover:text-emerald-500/[0.05] transition-colors">01</div>
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors border border-white/5">
                   <Users size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Student Dashboard</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">Students track assessments, view rankings, and monitor placement readiness in real time.</p>
                <a href="https://rankmyskills.in" className="text-emerald-400 font-semibold flex items-center gap-2 hover:text-emerald-300">
                  Open Student Dashboard <ArrowRight size={16} />
                </a>
              </motion.div>
              
              {/* Card 2 */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-[#0f1722] border border-emerald-500/20 p-8 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/[0.02] pointer-events-none group-hover:text-emerald-500/[0.05] transition-colors">02</div>
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-6">
                   <BarChart3 size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">College Dashboard</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">College admins view enrolled students, leaderboard positions, and performance data for their institution.</p>
                <a href="https://college.rankmyskills.in" className="text-emerald-400 font-semibold flex items-center gap-2 hover:text-emerald-300">
                  Open College Dashboard <ArrowRight size={16} />
                </a>
              </motion.div>
              
              {/* Card 3 */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-[#0f1722] border border-white/5 hover:border-emerald-500/30 p-8 rounded-2xl shadow-lg transition-all group relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/[0.02] pointer-events-none group-hover:text-emerald-500/[0.05] transition-colors">03</div>
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors border border-white/5">
                   <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Admin Dashboard</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">Platform admins manage college approvals, oversee all data, and control access across the ecosystem.</p>
                <a href="https://admin.rankmyskills.in" className="text-emerald-400 font-semibold flex items-center gap-2 hover:text-emerald-300">
                  Open Admin Dashboard <ArrowRight size={16} />
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-24 bg-[#0a1118] relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-emerald-400 font-semibold tracking-widest text-sm mb-4 uppercase">PROCESS</h3>
              <h2 className="text-4xl font-bold">How the Ecosystem Works</h2>
            </div>
            
            <div className="max-w-5xl mx-auto relative mt-16">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gray-800 via-emerald-500/50 to-gray-800 z-0"></div>
              
              <div className="grid md:grid-cols-5 gap-8">
                {[
                  { step: "1", title: "Students Join", desc: "Students register and complete skill assessments." },
                  { step: "2", title: "College Registers", desc: "College admin requests platform access." },
                  { step: "3", title: "Admin Approves", desc: "Platform admin reviews college registration." },
                  { step: "4", title: "Access Granted", desc: "College admin gains full dashboard access." },
                  { step: "5", title: "Insights Visible", desc: "Rankings and placement data become visible." }
                ].map((item, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                    <div className="w-14 h-14 rounded-full bg-[#0a1118] border-2 border-emerald-500/50 flex items-center justify-center text-xl font-bold text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110">
                      {item.step}
                    </div>
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-24 bg-[#080d13] border-t border-white/5 relative">
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <h3 className="text-emerald-400 font-semibold tracking-widest text-sm mb-4 uppercase">DEMO</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">See RankMySkills in Action</h2>
            <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">Watch how students, colleges, and admins interact across the unified platform.</p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative rounded-2xl overflow-hidden border border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.3)] group pb-[56.25%] backdrop-blur-sm bg-black/40 ring-1 ring-emerald-500/50"
            >
              <div className="absolute top-0 w-full h-8 bg-[#121c26] border-b border-white/5 flex items-center px-4 gap-2 z-10">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 text-xs text-gray-500 font-mono">rankmyskills.in</div>
              </div>
              <video 
                controls 
                className="absolute top-8 left-0 w-full h-[calc(100%-2rem)] object-cover bg-black"
                poster="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070"
              >
                <source src="https://res.cloudinary.com/dkbpxiuw9/video/upload/v1775428579/0329_acpgxi.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-b from-[#0a1118] to-[#080d13] border-t border-white/5 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full"></div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8 bg-[#0a1118]/50 backdrop-blur-md">
              ✨ GET STARTED TODAY
            </span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Unlock <span className="text-emerald-400">Placement<br/>Intelligence?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Join the RankMySkills ecosystem and unlock complete placement intelligence for your institution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <a 
                href="https://rankmyskills.in" 
                className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1118] px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] transform hover:-translate-y-1"
              >
                Open Student Dashboard →
              </a>
              <a 
                href="https://admin.rankmyskills.in" 
                className="bg-[#121c26] border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 px-8 py-4 rounded-xl font-semibold transition-all hover:bg-emerald-500/5"
              >
                Admin Dashboard →
              </a>
              <a 
                href="https://college.rankmyskills.in" 
                className="bg-[#121c26] border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 px-8 py-4 rounded-xl font-semibold transition-all hover:bg-emerald-500/5"
              >
                Register as College Admin →
              </a>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#060b13] py-12 text-center text-gray-500 text-sm">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center font-bold text-[#060b13] text-xs">
                R
              </div>
              <span className="font-bold text-gray-300">RankMySkills</span>
            </div>
            <p>© 2026 RankMySkills. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;