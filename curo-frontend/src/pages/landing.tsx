import React from 'react'
import { 
  MapPin, 
  UserPlus, 
  FileText, 
  Calendar,
  CalendarIcon, 
  ChevronRight, 
  Menu, 
  Bell, 
  MessageSquareText, 
  ShoppingCart, 
  Calculator, 
  Building2, 
  Lock,
  FileCheck
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function CuroLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const navigate = useNavigate();

  
  const features = [
    {
      icon: Bell,
      title: "Medicine Reminder",
      description: "Never miss a dose with our smart medicine reminder system powered by Firebase Cloud Messaging. Get real-time notifications and track your medication schedule effortlessly.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: MessageSquareText,
      title: "MediChat AI Doctor",
      description: "Experience personalized healthcare guidance with our AI-powered chat system. Using advanced RAG approach with your health records context for more accurate consultations.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: ShoppingCart,
      title: "Medicine Price Comparison",
      description: "Find the best deals on medications by comparing prices across multiple online pharmacies. Save money while ensuring you get authentic medicines.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Calculator,
      title: "Insurance Premium Predictor",
      description: "Get accurate insurance premium estimates based on your medical history using our advanced ML model. Make informed decisions about your healthcare coverage.",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: Building2,
      title: "Healthcare Services Finder",
      description: "Discover nearby specialists, clinics, labs, and healthcare facilities. Compare services and read verified reviews from trusted patients.",
      gradient: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Lock,
      title: "Secure Login",
      description: "Your account is protected with enterprise-grade security. Multi-factor authentication and encrypted data transmission ensure your information stays private.",
      gradient: "from-teal-500 to-teal-600"
    },
    {
      icon: FileCheck,
      title: "Health Records",
      description: "Store and access your complete medical history, test results, and prescriptions in one secure place. Share records with healthcare providers when needed.",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: CalendarIcon,
      title: "Easy Appointments",
      description: "Book, reschedule, or cancel appointments with healthcare providers through NexHealth integration. Get reminders and manage your medical visits effortlessly.",
      gradient: "from-pink-500 to-pink-600"
    }
  ];
  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Medical Director",
      description: "Board-certified physician with expertise in digital healthcare transformation and AI implementation in medical systems.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300"
    },
    {
      name: "Alex Rivera",
      role: "AI Research Lead",
      description: "Specialist in healthcare AI systems and natural language processing for medical applications.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300"
    },
    {
      name: "Dr. Emily Watson",
      role: "Healthcare Analytics Head",
      description: "Expert in medical data analysis and predictive modeling for insurance and healthcare outcomes.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300"
    },
    {
      name: "Michael Chang",
      role: "Technical Architect",
      description: "Seasoned engineer specializing in secure healthcare systems and cloud infrastructure.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300"
    },
  ];

  const handleScrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAboutUs = () => {
    const aboutUsSection = document.getElementById('about-us-section');
    if (aboutUsSection) {
      aboutUsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <header className="w-full px-4 md:px-8 py-6 flex justify-between items-center bg-white bg-opacity-80 backdrop-blur-md fixed top-0 z-50">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
          <span className="text-2xl font-bold text-blue-800">Curo</span>
        </motion.div>
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <motion.li
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Button variant="ghost" onClick={handleScrollToFeatures} className="bg-transparent text-gray-600 hover:text-blue-500 hover:bg-transparent shadow-none">
                Features
              </Button>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button variant="ghost" onClick={handleAboutUs} className="bg-transparent text-gray-600 hover:text-blue-500 hover:bg-transparent shadow-none">
                About Us
              </Button>
            </motion.li>
          </ul>
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {isMenuOpen && (
        <motion.div
          className="md:hidden bg-white shadow-lg fixed top-16 left-0 right-0 z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <nav className="w-full px-4 md:px-8 py-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={handleScrollToFeatures}
                  className="block py-2 text-gray-600 hover:text-blue-500 w-full text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={handleAboutUs}
                  className="block py-2 text-gray-600 hover:text-blue-500 w-full text-left"
                >
                  About Us
                </button>
              </li>
            </ul>
          </nav>
        </motion.div>
      )}

      <main className="pt-20">
        <section className="w-full px-4 md:px-8 py-12 md:py-20 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-blue-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Complete Healthcare Companion
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience healthcare reimagined with AI-powered assistance, secure medical records storage, and integrated appointment booking. From finding the best medicine prices to connecting with healthcare providers, Curo is your all-in-one healthcare solution.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button className="text-lg px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
              Get Started <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="text-lg px-6 py-3 md:px-8 md:py-4">
              Watch Demo
            </Button>
          </motion.div>
        </section>

        <section
          id="features-section"
          className="w-full px-4 md:px-8 py-12 md:py-20"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Innovative Features for Modern Healthcare
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 md:py-24">
          <div className="w-full px-4 md:px-8 text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Transform Your Healthcare Experience
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join thousands of users who have already discovered a smarter way to manage their health. 
              With AI-powered assistance and comprehensive tools, taking control of your healthcare has never been easier.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to={'/auth'}>
                <Button variant="secondary" className="text-lg px-8 py-4 bg-white text-blue-800 hover:bg-blue-100 transition-all duration-300">
                  Sign Up Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section
          id='about-us-section'
          className="w-full px-4 md:px-8 py-16 md:py-24"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Meet Our Expert Team
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-6"
                />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{member.name}</h3>
                <p className="text-blue-500 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-2xl font-bold">Curo</span>
              <p className="mt-4 text-blue-200">Revolutionizing healthcare management with AI-powered solutions and comprehensive health services.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <nav>
                <ul className="space-y-2">
                  <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-blue-200 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </nav>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <nav>
                <ul className="space-y-2">
                  <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-blue-800 text-center text-blue-200">
            <p>&copy; 2025 Curo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}