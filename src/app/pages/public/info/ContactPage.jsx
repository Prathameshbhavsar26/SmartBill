import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Footer from '../../../components/common/Footer';
import PublicNavbar from '../../../components/common/PublicNavbar';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <section className="px-8 py-16 max-w-7xl mx-auto w-full flex-1">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Get in touch</h1>
          <p className="text-lg text-slate-600">Have questions about pricing, features, or need technical support? Our team is here to help you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          
          {/* Form */}
          <div className="lg:col-span-3 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Send us a message</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">How can we help?</label>
                <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all resize-none" placeholder="Tell us more about your inquiry..."></textarea>
              </div>

              <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Alternative Contacts */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chat with Sales</h3>
              <p className="text-blue-100 mb-6">Speak to our friendly team about enterprise plans and custom solutions.</p>
              <a href="mailto:prathameshbhavsar@gmail.com" className="font-bold text-lg hover:underline">prathameshbhavsar@gmail.com</a>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                <Phone className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Call Support</h3>
              <p className="text-slate-500 mb-6">Mon-Fri from 9am to 6pm IST.</p>
              <a href="tel:+918830164600" className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors">+91 88301 64600</a>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                <MapPin className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Visit Us</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">Nashik, Maharashtra, 422001</p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
