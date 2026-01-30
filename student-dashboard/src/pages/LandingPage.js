import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  School, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: "Student Tracking",
      description: "Monitor your progress with precision using our advanced analytics dashboard."
    },
    {
      icon: <Rocket className="w-8 h-8 text-blue-500" />,
      title: "Improve Fast",
      description: "Get personalized insights to accelerate your learning and skill acquisition."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Peer Competition",
      description: "Compete with peers in real-time and climb the global leaderboards."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
      title: "Transparent Growth",
      description: "Clear metrics and visualization of your journey from novice to expert."
    },
    {
      icon: <School className="w-8 h-8 text-blue-500" />,
      title: "College Integration",
      description: "Colleges can track and support their students' development effectively."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
      title: "Verified Skills",
      description: "Earn verified badges and certificates to showcase your true potential."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                RankMySkills
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all hover:scale-105 transform flex items-center group"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
              Master Your Skills. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Prove Your Worth.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
              The ultimate platform for students to track growth, compete with peers, 
              and showcase their journey to colleges and recruiters with full transparency.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-lg font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
              >
                Start Your Journey
              </Link>
              <Link 
                to="/login"
                className="w-full sm:w-auto px-8 py-4 border border-white/20 rounded-full text-lg font-medium hover:bg-white/5 transition-all"
              >
                Login to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose RankMySkills?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built for ambitious students who want to take control of their career path.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group hover:bg-white/10"
              >
                <div className="mb-4 p-3 bg-blue-500/10 rounded-lg w-fit group-hover:bg-blue-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats/Call to Action */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center shadow-2xl shadow-blue-900/50">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to accelerate your career?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already using RankMySkills to tracking their progress 
              and landing their dream jobs.
            </p>
            <Link 
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all"
            >
              Create Free Account
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="text-xl font-bold text-white">RankMySkills</span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} RankMySkills. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
