import React from 'react'
import { MapPin, UserPlus, FileText, Calendar, ChevronRight, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function CuroLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const navigate = useNavigate();
  const team = [
    {
      name: "Alice Johnson",
      role: "Team Lead",
      description:
        "Alice is a passionate leader with 5 years of experience in managing software projects. She loves collaborating with teams and delivering high-quality results.",
      image: "/placeholder.svg?height=150&width=150"
    },
    {
      name: "Bob Smith",
      role: "Frontend Developer",
      description:
        "Bob specializes in building responsive and user-friendly interfaces. He enjoys exploring new frameworks and enhancing user experiences.",
      image: "/placeholder.svg?height=150&width=150"
    },
    {
      name: "Charlie Brown",
      role: "Backend Developer",
      description:
        "Charlie is an expert in server-side development and database management. He ensures the application is robust and scalable.",
      image: "/placeholder.svg?height=150&width=150"
    },
    {
      name: "Diana Lee",
      role: "UI/UX Designer",
      description:
        "Diana crafts intuitive designs that resonate with users. She is dedicated to creating seamless and aesthetically pleasing user journeys.",
      image: "/placeholder.svg?height=150&width=150"
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
            className="text-4xl md:text-5xl font-bold text-blue-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Health, Simplified
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Curo brings together all your healthcare needs in one place. From finding nearby hospitals to managing your health records, we've got you covered.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button className="text-lg px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
              Get Started <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </section>

        <section
          id="features-section"
          className="w-full px-4 md:px-8 py-12 md:py-20"
        >
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Features that Care for You
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
            {[
              { icon: MapPin, title: "Nearby Hospitals", description: "Locate and get information about hospitals near you with our interactive map." },
              { icon: UserPlus, title: "Secure Login", description: "Create an account and safely store your health information in one place." },
              { icon: FileText, title: "Health Records", description: "Access your complete medical history, prescriptions, and lab results anytime." },
              { icon: Calendar, title: "Easy Scheduling", description: "Book, reschedule, or cancel appointments with healthcare providers effortlessly." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 md:py-20">
          <div className="w-full px-4 md:px-8 text-center">
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ready to Take Control of Your Health?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join Curo today and experience a new way of managing your healthcare.
              It's simple, secure, and designed with you in mind.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to={'/auth'}>
                <Button variant="secondary" className="text-lg px-6 py-3 md:px-8 md:py-4 bg-white text-blue-800 hover:bg-blue-100 transition-all duration-300">
                  Sign Up Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section
          id='about-us-section'
          className="w-full px-4 md:px-8 py-12 md:py-20"
        >
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 mx-auto rounded-full"
                />
                <h3 className="text-xl font-semibold text-blue-800">{member.name}</h3>
                <p className="text-blue-500 font-medium">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full bg-blue-800 text-white py-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold">Curo</span>
              <p className="mt-2">Your health, our priority</p>
            </div>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="#" className="hover:text-blue-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-300">Contact Us</a></li>
              </ul>
            </nav>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2025 Curo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

