// src/app/support/page.tsx
import { SupportForm } from "@/components/support/SupportForm";

export const metadata = {
  title: "Trackio - Support",
  description: "Get help with Trackio",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-gray-400 mt-2">
              Need help with Trackio? Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">How do I track a habit?</h3>
                <p className="text-gray-400">Click the "+" button to create a new habit, then click the checkbox next to it to mark it as complete for the day.</p>
              </div>
              <div>
                <h3 className="font-medium">Can I edit a habit?</h3>
                <p className="text-gray-400">Yes, click the three dots menu next to any habit to edit or delete it.</p>
              </div>
              <div>
                <h3 className="font-medium">How do I download the iOS app?</h3>
                <p className="text-gray-400">You can download Trackio from the App Store using the link below:</p>
                <a 
                  href="https://apps.apple.com/app/trackio"
                  className="text-blue-400 hover:text-blue-300 inline-block mt-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download on the App Store →
                </a>
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <SupportForm />
          </div>
        </div>
      </div>
    </div>
  );
}