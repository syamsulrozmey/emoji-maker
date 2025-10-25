'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SupportWidget() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link
    const encodedSubject = encodeURIComponent(subject || 'Support Request');
    const encodedBody = encodeURIComponent(
      `${message}\n\n---\nFrom: ${userEmail}`
    );
    const mailtoLink = `mailto:support@emojimaker.xyz?subject=${encodedSubject}&body=${encodedBody}`;
    
    // Open email client
    // Open email client
    const anchor = document.createElement('a');
    anchor.href = mailtoLink;
    anchor.click();
    
    // Close panel and reset form
    setIsOpen(false);
    setSubject('');
    setMessage('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Contact Support"
      >
        <div className="relative">
          {/* Outer circle with pulsing animation */}
          <div className="absolute inset-0 bg-slate-900/10 rounded-full animate-pulse" />
          
          {/* Main button */}
          <div className="relative bg-slate-900 hover:bg-slate-800 transition-colors rounded-full p-4 shadow-lg hover:shadow-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </button>

      {/* Side Panel Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Side Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">
                  Contact Support
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Your Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      readOnly
                      className="bg-slate-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">
                      This is the email address associated with your account.
                    </p>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                      className="border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your issue or request in detail..."
                      required
                      rows={8}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      Your message will be sent via your default email client.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Footer Info */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <p className="text-xs text-slate-600">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

