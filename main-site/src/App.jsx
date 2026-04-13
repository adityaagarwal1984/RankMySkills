import React, { useState, useEffect, Component } from 'react';
import { motion } from 'framer-motion';
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

const FlipCard = ({ title, desc, link, linkText, icon, image, step }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full h-[400px] cursor-pointer group"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.location.href = link}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {/* Front */}
        <div className="absolute w-full h-full rounded-xl border border-emerald-500/20 bg-[#04080c] overflow-hidden flex flex-col justify-end" style={{ backfaceVisibility: 'hidden' }}>
          <div className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105" style={{ backgroundImage: `url(${image})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#04080c] via-[#04080c]/60 to-transparent"></div>
          <div className="absolute top-0 right-0 p-6 text-6xl font-black text-white/10 pointer-events-none transition-colors duration-500 group-hover:text-[#3ce3a8]/20">{step}</div>
          <div className="p-6 relative z-10">
             <div className="w-12 h-12 rounded-lg bg-[#3ce3a8]/10 text-[#3ce3a8] border border-[#3ce3a8]/30 flex items-center justify-center mb-4 backdrop-blur-sm">
                {icon}
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">{title}</h3>
          </div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full rounded-xl border border-[#3ce3a8]/40 bg-black overflow-hidden p-6 flex flex-col items-center justify-center text-center shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.1]" style={{ backgroundImage: `url(${image})` }}></div>
          <div className="relative z-10 flex flex-col items-center w-full" style={{ transform: 'translateZ(30px)' }}>
            <div className="w-12 h-12 rounded-full bg-[#3ce3a8]/10 text-[#3ce3a8] border border-[#3ce3a8]/30 flex items-center justify-center mb-3">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white hover:text-[#3ce3a8] transition-colors">{title}</h3>
            <p className="text-[13px] text-gray-300 mb-5 leading-relaxed w-full max-w-[95%] mx-auto">{desc}</p>
            <div 
              className="bg-[#3ce3a8] text-black px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all group-hover:-translate-y-0.5"
            >
              {linkText} <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EcosystemSteps = () => {
  const steps = [
    { step: "1", title: "Students Join", desc: "Register & complete skills." },
    { step: "2", title: "College Registers", desc: "Admin requests access." },
    { step: "3", title: "Admin Approves", desc: "Platform admin reviews." },
    { step: "4", title: "Access Granted", desc: "College gets dashboards." },
    { step: "5", title: "Insights Visible", desc: "Data becomes visible." }
  ];

  return (
    <div className="max-w-5xl mx-auto relative mt-16 pb-12">
      <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-1.5 bg-gray-800/80 rounded-full z-0 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-teal-400 via-emerald-500 to-green-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 1.5, ease: "linear" }}
        />
      </div>
      
      <div className="grid md:grid-cols-5 gap-8">
        {steps.map((item, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
            <motion.div 
              className="w-16 h-16 rounded-full bg-[#0a1118] border-4 border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 mb-6 transition-all"
              initial={{ borderColor: "#374151", color: "#6b7280", backgroundColor: "#0a1118", scale: 0.8 }}
              whileInView={{ 
                borderColor: "#10b981", 
                backgroundColor: "#10b981", 
                color: "#ffffff",
                scale: 1,
                boxShadow: "0 0 30px rgba(16,185,129,0.6)"
              }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (idx * 0.3) }}
            >
              {item.step}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (idx * 0.3) + 0.2, type: "spring", stiffness: 100 }}
            >
               <h4 className="font-bold text-lg mb-2 text-white drop-shadow-md">{item.title}</h4>
               <p className="text-sm text-gray-400 leading-relaxed max-w-[150px] mx-auto">{item.desc}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Typewriter = ({ phrases }) => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(80);

  useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        setTypingSpeed(30);
      } else {
        setText(fullText.substring(0, text.length + 1));
        setTypingSpeed(80);
      }

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typingSpeed]);

  return (
    <span className="border-r-4 border-[#3ce3a8] pr-1 inline-block min-h-[3rem]">
      {text}
    </span>
  );
};

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
      <div className="fixed inset-0 z-0 h-screen w-screen pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
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
          <div className="w-9 h-9 rounded bg-[#10b981] flex items-center justify-center font-black text-[#04080c] shadow-lg shadow-emerald-500/50">
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
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pb-6 pt-24 lg:pt-20 flex flex-col lg:flex-row items-center lg:items-start xl:items-center gap-4 sm:gap-8 lg:gap-12 relative min-h-[100dvh] lg:min-h-screen justify-center overflow-hidden lg:overflow-visible">
          
          <div className="w-full lg:w-1/2 flex flex-col z-10 lg:-mt-8 text-center lg:text-left items-center lg:items-start max-w-2xl mx-auto lg:mx-0">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3ce3a8]/30 w-fit text-[10px] font-bold bg-[#3ce3a8]/5 text-[#3ce3a8] tracking-widest mb-2 md:mb-4"
            >
              {/* <span className="text-[10px]">✦</span>
              UNIFIED ECOSYSTEM */}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[2.5rem] leading-[1.1] sm:text-5xl lg:text-[4rem] font-bold tracking-tight text-white mb-4 lg:mb-6 w-full"
            >
              <br className="hidden lg:block"></br>
              <span className="text-[#3ce3a8]">The Ultimate<br /> Ecosystem</span>
              <span className="text-white"> for</span><br />
              <div className="text-xl sm:text-3xl lg:text-[2.5rem] leading-[1.2] min-h-[60px] sm:min-h-[90px] lg:min-h-[100px] mt-3 lg:mt-4 font-medium flex justify-center lg:justify-start">
                <Typewriter phrases={[
                  "Students to compete and grow faster",
                  "College Admins to track student activity",
                  "Superadmins to monitor students and admins"
                ]} />
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-300 text-[13px] sm:text-sm lg:text-base font-normal leading-relaxed text-center lg:text-left mb-6 max-w-md lg:max-w-xl mx-auto lg:mx-0"
            >
              A unified platform connecting engineering talent with placement opportunities. Track activities, manage assessments, and accelerate career growth through one seamless ecosystem.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 lg:gap-4 pb-4"
            >
              <a 
                href="https://student.rankmyskills.in" 
                className="bg-[#3ce3a8] text-[#04080c] px-6 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:bg-[#20caa0] hover:-translate-y-0.5 text-sm w-full sm:w-auto"
              >
                Open Student Dashboard <ArrowRight size={16} />
              </a>
              <a 
                href="https://college.rankmyskills.in" 
                className="bg-transparent border border-gray-600 text-white px-6 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/5 hover:border-gray-400 hover:-translate-y-0.5 text-sm w-full sm:w-auto"
              >
                College Dashboard <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full lg:w-1/2 relative h-[250px] sm:h-[400px] lg:h-[500px] mt-4 lg:mt-8 lg:ml-8 flex-shrink-0"
          >
            {/* 3D Network Concept in Hero replacing the static dashboard */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/5 bg-[#0a1118]/40 backdrop-blur-sm shadow-[0_0_50px_rgba(16,185,129,0.15)] flex items-center justify-center pointer-events-none">
              <ErrorBoundary>
                {/* A generic prebuilt spline that provides a nice 3d network / node vibe replacing old design */}
                <div className="w-[150%] h-[150%] pointer-events-auto hidden sm:block">
                  <Spline scene="https://prod.spline.design/kZIGLNcdAJe-2V5i/scene.splinecode" />
                </div>
              </ErrorBoundary>
            </div>

            {/* Overlaid Animated Nodes for Student, College, Admin */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div 
                className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] scale-90 sm:scale-100 lg:scale-110"
                animate={{ rotate: 360 }}
                transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-1/2 left-1/2 rounded-full border border-emerald-500/30 w-56 h-56 sm:w-80 sm:h-80 -translate-x-1/2 -translate-y-1/2 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]"></div>
                <div className="absolute top-1/2 left-1/2 border border-emerald-500/10 rounded-full w-40 h-40 sm:w-56 sm:h-56 -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Central "RankMySkills" Hub */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0a1118] border border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center z-20 backdrop-blur-md"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#10b981] flex items-center justify-center font-black text-[#04080c] shadow-[0_0_15px_rgba(16,185,129,0.6)] text-xl sm:text-2xl">
                    R
                  </div>
                </motion.div>

                {/* Student Node */}
                <div className="absolute top-[10%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-30">
                  <motion.div 
                     className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#162330]/90 backdrop-blur border border-blue-500/60 flex flex-col items-center justify-center p-1 sm:p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                     animate={{ rotate: -360 }}
                     transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                  >
                    <Users size={16} className="text-blue-400 mb-1 sm:w-5 sm:h-5" />
                    <span className="text-[10px] sm:text-xs font-bold text-center">Students</span>
                  </motion.div>
                </div>

                {/* College Node */}
                <div className="absolute top-[70%] left-[15.36%] -translate-x-1/2 -translate-y-1/2 z-30">
                  <motion.div 
                     className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#162330]/90 backdrop-blur border border-red-500/60 flex flex-col items-center justify-center p-1 sm:p-2 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                     animate={{ rotate: -360 }}
                     transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                  >
                    <BarChart3 size={16} className="text-red-400 mb-1 sm:w-5 sm:h-5" />
                    <span className="text-[10px] sm:text-xs font-bold text-center">Colleges</span>
                  </motion.div>
                </div>

                {/* Admin Node */}
                <div className="absolute top-[70%] left-[84.64%] -translate-x-1/2 -translate-y-1/2 z-30">
                  <motion.div 
                     className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#162330]/90 backdrop-blur border border-yellow-300/60 flex flex-col items-center justify-center p-1 sm:p-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                     animate={{ rotate: -360 }}
                     transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                  >
                    <ShieldCheck size={16} className="text-yellow-300 mb-1 sm:w-5 sm:h-5" />
                    <span className="text-[10px] sm:text-xs font-bold text-center">Admins</span>
                  </motion.div>
                </div>

              </motion.div>
            </div>
            
          </motion.div>
        </section>

        {/* Dashboards Section with 3D Flipping Cards */}
        <section id="ecosystem" className="py-20 bg-[#080d13] relative border-t border-white/5">
          <div className="container mx-auto px-6 text-center relative z-10">
            <h3 className="text-[#3ce3a8] font-bold tracking-widest text-xs mb-3 uppercase">THE ECOSYSTEM</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">Three Dashboards. <span className="text-[#3ce3a8]">One Unified Platform.</span></h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <FlipCard 
                title="Student Dashboard"
                desc="Students track assessments, view rankings, and monitor placement readiness in real time. Build your portfolio and level up your engineering skills seamlessly."
                link="https://student.rankmyskills.in"
                linkText="Open Dashboard"
                icon={<Users size={28} />}
                image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800"
                step="01"
              />
              <FlipCard 
                title="College Dashboard"
                desc="College admins view enrolled students, leaderboard positions, and performance data for their institution. Manage batches and improve placement outputs effectively."
                link="https://college.rankmyskills.in"
                linkText="College Login"
                icon={<BarChart3 size={28} />}
                image="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800"
                step="02"
              />
              <FlipCard 
                title="Admin Dashboard"
                desc="Platform admins manage college approvals, oversee all data, and control access across the ecosystem. Ensure data integrity and system health globally."
                link="https://admin.rankmyskills.in"
                linkText="Admin Login"
                icon={<ShieldCheck size={28} />}
                image="https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=800"
                step="03"
              />
            </div>
          </div>
        </section>

        {/* Process Section with Filling Animation */}
        <section id="process" className="py-24 bg-[#0a1118] relative overflow-hidden">
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-[#3ce3a8] font-bold tracking-widest text-xs mb-3 uppercase">PROCESS</h3>
              <h2 className="text-3xl md:text-4xl font-bold">How the Ecosystem Works</h2>
              <p className="text-gray-400 mt-3 text-base">A seamless flow connecting every stakeholder.</p>
            </div>
            
            <EcosystemSteps />
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 bg-[#080d13] border-t border-white/5 relative">

          <div className="container mx-auto px-6 text-center max-w-5xl relative z-10">
            <h3 className="text-[#3ce3a8] font-bold tracking-widest text-xs mb-3 uppercase">DEMO</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See RankMySkills in Action</h2>
            <p className="text-gray-400 text-base mb-12 max-w-xl mx-auto">Watch how students, colleges, and admins interact across the unified platform.</p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative rounded-2xl overflow-hidden border border-[#3ce3a8]/20 shadow-xl group pb-[56.25%] backdrop-blur-sm bg-black/80"
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
        <section className="py-24 bg-[#0a1118] border-t border-white/5 text-center relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3ce3a8]/30 text-[#3ce3a8] text-xs font-bold mb-6 tracking-widest bg-[#3ce3a8]/5">
              <span className="text-[10px]">✦</span>
              GET STARTED TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to Unlock <span className="text-[#3ce3a8]">Placement<br/>Intelligence?</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-10 max-w-xl mx-auto font-normal">
              Join the RankMySkills ecosystem and unlock complete placement intelligence for your institution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <a 
                href="https://student.rankmyskills.in" 
                className="bg-[#3ce3a8] text-[#0a1118] px-8 py-3.5 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:bg-[#20caa0] text-sm flex items-center gap-2"
              >
                Open Student Dashboard <ArrowRight size={18} />
              </a>
              <a 
                href="https://admin.rankmyskills.in" 
                className="bg-transparent border border-gray-600 hover:border-gray-400 text-white px-6 py-3.5 rounded-lg font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                Admin Dashboard
              </a>
              <a 
                href="https://college.rankmyskills.in" 
                className="bg-transparent border border-gray-600 hover:border-gray-400 text-white px-6 py-3.5 rounded-lg font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                Register as College Admin
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#04080c] py-6 text-center text-gray-500 text-sm relative z-10">
          <div className="container mx-auto px-6 flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="w-6 h-6 rounded bg-[#3ce3a8] flex items-center justify-center font-black text-[#060b13] text-xs shadow-[0_0_15px_rgba(60,227,168,0.5)]">
                R
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">RankMy<span className="text-[#3ce3a8]">Skills</span></span>
            </div>
            <p className="font-medium">© 2026 RankMySkills. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;