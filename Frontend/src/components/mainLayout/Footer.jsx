import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Classroom Courses", href: "/course" },
    { name: "Test Series", href: "/test" },
    { name: "Contact Us", href: "/contact" },
    { name: "Terms & Conditions", href: "/termsandconditions" },
    { name: "Privacy Policy", href: "/privacypolicy" }
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook size={18} />,
      href: "https://www.facebook.com/rootsclasses1313/",
      color: "hover:bg-blue-600"
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={18} />,
      href: "https://www.instagram.com/roots_classes?igsh=cndtdml4MW0wNmFz",
      color: "hover:bg-pink-600"
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={18} />,
      href: "https://www.linkedin.com/company/roots-classes/",
      color: "hover:bg-blue-700"
    },
    {
      name: "YouTube",
      icon: <FaYoutube size={18} />,
      href: "https://www.youtube.com/@nikolaphysics",
      color: "hover:bg-red-600"
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center space-x-2">
                  <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />

                </Link>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Empowering learners worldwide. Discover courses, tutorials, and resources to enhance your skills.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 transition-all duration-300 hover:text-white ${social.color} hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Pages
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 mt-1"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <ChevronRight size={14} className="text-blue-500 transition-all duration-300 group-hover:translate-x-1" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Corporate Office
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 mt-1"></div>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-all duration-300">
                  <Phone size={18} className="text-gray-300 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    +91 98775-15330
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-all duration-300">
                  <Mail size={18} className="text-gray-300 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm break-all">
                    rootsclasses1313@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-all duration-300">
                  <MapPin size={18} className="text-gray-300 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Gill Rd, opp. Opposite ITI College,<br />
                    Shilapuri, Ludhiana, Punjab 141003
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>




      </div>

      {/* Decorative Bottom Gradient */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </footer>
  );
};

export default Footer;