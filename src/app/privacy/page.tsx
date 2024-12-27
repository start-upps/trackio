// src/app/privacy/page.tsx
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  const lastUpdated = "December 27, 2024";

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-12">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: {lastUpdated}</p>
          </header>

          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Introduction</h2>
              <p className="text-gray-300">
                At Trackio, we take your privacy seriously. This Privacy Policy explains how our habit tracking 
                applications ("Trackio" or the "App") handle data, both for our web application and iOS app.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">iOS App Privacy</h2>
              <p className="text-gray-300">
                The Trackio iOS app is designed with your privacy in mind:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>All data is stored locally on your device</li>
                <li>We do not collect, transmit, or store any personal information</li>
                <li>No analytics or tracking systems are implemented</li>
                <li>No account creation is required</li>
                <li>No internet connection is required to use the app</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Web Application</h2>
              <p className="text-gray-300">
                For users of our web application (www.trackio.art), we collect minimal information 
                necessary to provide the service:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Email address (for account creation)</li>
                <li>Password (securely hashed)</li>
                <li>Habit tracking data (stored securely on our servers)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Data Security</h2>
              <p className="text-gray-300">
                For our web application users, data is stored securely using industry-standard 
                encryption. iOS app data remains solely on your device and is protected by your 
                device's built-in security features.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Data Sharing</h2>
              <p className="text-gray-300">
                We do not sell, trade, or rent any personal information to third parties. 
                The iOS app does not share any data as all information remains local to your device.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Your Rights</h2>
              <p className="text-gray-300">
                For web application users, you have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Access your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your data</li>
              </ul>
              <p className="text-gray-300 mt-2">
                For iOS app users, you have complete control over your data as it's stored locally 
                on your device. You can delete the app at any time to remove all associated data.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Children's Privacy</h2>
              <p className="text-gray-300">
                Our App is not intended for children under 13 years of age. The iOS app does not 
                collect any personal information from any users, including children.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
              <p className="text-gray-300">
                We may update our Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the 
                "last updated" date.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <ul className="space-y-2 text-gray-300">
                  <li>Email: ismetsemedov@gmail.com</li>
                  <li>Website: www.trackio.art</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}