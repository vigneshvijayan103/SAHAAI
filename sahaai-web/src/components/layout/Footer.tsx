import React from 'react';
import { ShieldAlert, Heart, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Sahaai</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-4 leading-relaxed">
              On-demand rapid field dispatch platform connecting customers with certified emergency
              electricians, plumbers, mechanics, and technicians with real-time location matching.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> 24/7 Hotline: 1800-SAHAAI
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> support@sahaai.app
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Core Services</h4>
            <ul className="space-y-2 text-xs">
              <li>Emergency Electrical Work</li>
              <li>Plumbing & Leak Repairs</li>
              <li>Roadside Breakdown Assistance</li>
              <li>Home Appliance Diagnostics</li>
              <li>Emergency Locksmith</li>
            </ul>
          </div>

          {/* Dispatch Platform */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Coverage & Protocol</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Real-time GPS Dispatching
              </li>
              <li>Auto-expanding 5km Search Radius</li>
              <li>Voice-note Emergency Description</li>
              <li>Cloudinary Secure Image Evidence</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Sahaai Dispatch Network. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> on ASP.NET Core 10 & React
          </p>
        </div>
      </div>
    </footer>
  );
};

