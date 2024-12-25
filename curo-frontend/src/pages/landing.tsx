import React from 'react'
import { MapPin, UserPlus, FileText, Calendar, ChevronRight, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'

export default function CuroLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white">
      <header className="w-full px-4 md:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <span className="text-2xl font-bold text-blue-800">Curo</span>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><a href="#" className="text-gray-600 hover:text-blue-500">Features</a></li>
            <li><a href="#" className="text-gray-600 hover:text-blue-500">About</a></li>
            <li><a href="#" className="text-gray-600 hover:text-blue-500">Contact</a></li>
          </ul>
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="w-full px-4 md:px-8 py-4">
            <ul className="space-y-2">
              <li><a href="#" className="block py-2 text-gray-600 hover:text-blue-500">Features</a></li>
              <li><a href="#" className="block py-2 text-gray-600 hover:text-blue-500">About</a></li>
              <li><a href="#" className="block py-2 text-gray-600 hover:text-blue-500">Contact</a></li>
            </ul>
          </nav>
        </div>
      )}

      <main>
        <section className="w-full px-4 md:px-8 py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6">
            Your Health, Simplified
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Curo brings together all your healthcare needs in one place. 
            From finding nearby hospitals to managing your health records, 
            we've got you covered.
          </p>
          <Button className="text-lg px-6 py-3 md:px-8 md:py-4">
            Get Started
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        <section className="w-full px-4 md:px-8 py-12 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-8 md:mb-12">
            Features that Care for You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
            {[
              { icon: MapPin, title: "Nearby Hospitals", description: "Locate and get information about hospitals near you with our interactive map." },
              { icon: UserPlus, title: "Secure Login", description: "Create an account and safely store your health information in one place." },
              { icon: FileText, title: "Health Records", description: "Access your complete medical history, prescriptions, and lab results anytime." },
              { icon: Calendar, title: "Easy Scheduling", description: "Book, reschedule, or cancel appointments with healthcare providers effortlessly." },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full bg-blue-800 text-white py-12 md:py-20">
          <div className="w-full px-4 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Ready to Take Control of Your Health?</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
              Join Curo today and experience a new way of managing your healthcare. 
              It's simple, secure, and designed with you in mind.
            </p>
            <Link to={'/auth'}>
            
            <Button variant="secondary" className="text-lg px-6 py-3 md:px-8 md:py-4">
              Sign Up Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full bg-gray-100 py-8 md:py-12">
        <div className="w-full px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">Facebook</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 md:mt-12 text-center text-gray-600">
            <p>&copy; 2024 Curo Health Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

