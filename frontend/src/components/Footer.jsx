import { motion } from "framer-motion";
import { Sparkles, Star, Trophy, Mail, MapPin, Phone, Facebook, Twitter, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const Footer = () => {
  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Security", "Roadmap", "Blog"]
    },
    {
      title: "Company",
      links: ["About Us", "Team", "Careers", "Press", "Contact"]
    },
    {
      title: "Resources",
      links: ["Documentation", "API Docs", "Support", "Community", "Status"]
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Compliance"]
    }
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", url: "#" },
    { icon: Twitter, label: "Twitter", url: "#" },
    { icon: Linkedin, label: "LinkedIn", url: "#" }
  ];

  return (
    <footer className="relative py-20 border-t border-border bg-brand-600 hover:bg-brand-700 text-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-brand-700/60" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-4 mb-4">
              <img src="/SARATHI-Picsart-BackgroundRemover.jpg" alt="SARATHI" className="h-24 w-24 object-contain" />
              <div>
                <span className="font-display text-4xl font-bold text-white">
                  SARATHI
                </span>
                <p className="text-sm text-white/90">
                  Guiding Every Learner with AI
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-6">
              Empowering students and professionals with AI-powered adaptive assessments that personalize learning and maximize potential.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white flex items-center justify-center transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-white group-hover:text-brand-600" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-border mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Email</p>
              <a href="mailto:support@sarathi.com" className="font-semibold text-white hover:text-white/80">
                support@sarathi.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Phone</p>
              <a href="tel:+919876543210" className="font-semibold text-white hover:text-white/80">
                +91 9876 543 210
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Address</p>
              <p className="font-semibold text-white">
                Bangalore, India
              </p>
            </div>
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 rounded-2xl p-8 mb-12 border border-white/20"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              Stay Updated with SARATHI
            </h3>
            <p className="text-white/80 text-center mb-6">
              Get the latest updates, tips, and exclusive content delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors"
              />
              <Button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all group flex items-center gap-2">
                Subscribe
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/20"
        >
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/80">
              © 2024 SARATHI. All rights reserved.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="font-bold text-white text-lg">50K+</p>
              <p className="text-xs text-white/70">Active Learners</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-white text-lg">1M+</p>
              <p className="text-xs text-white/70">Assessments</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-white text-lg">98%</p>
              <p className="text-xs text-white/70">Success Rate</p>
            </div>
          </div>

          {/* Built Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full border border-white/30 shadow-md">
            <Trophy className="w-4 h-4 text-white" />
            <span className="text-sm text-white">
              Built for <span className="text-white font-medium">Hackathon 2024</span>
            </span>
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
