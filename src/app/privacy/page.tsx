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
                At Trackio, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, and protect your personal information when you use our habit tracking application 
                ("Trackio" or the "App"), available both as a web application and iOS app.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Account Information</h3>
                <p className="text-gray-300">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                  <li>Email address</li>
                  <li>Password (securely hashed)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-medium">Usage Data</h3>
                <p className="text-gray-300">
                  We collect data about how you use Trackio, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                  <li>Habits you create and track</li>
                  <li>Completion records of your habits</li>
                  <li>App preferences and settings</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
              <p className="text-gray-300">
                We use the collected information to:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Provide and maintain the App</li>
                <li>Track your habit progress and generate insights</li>
                <li>Send important updates about the App</li>
                <li>Respond to your support requests</li>
                <li>Improve the App based on usage patterns</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Data Storage and Security</h2>
              <p className="text-gray-300">
                Your data is stored securely in our databases using industry-standard encryption. 
                We implement appropriate security measures to protect against unauthorized access, 
                alteration, disclosure, or destruction of your information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Data Sharing</h2>
              <p className="text-gray-300">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share anonymous, aggregated data for analytical purposes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Your Rights</h2>
              <p className="text-gray-300">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Cookies</h2>
              <p className="text-gray-300">
                We use cookies and similar tracking technologies to track activity on our App 
                and hold certain information. Cookies are files with a small amount of data 
                which may include an anonymous unique identifier.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Children's Privacy</h2>
              <p className="text-gray-300">
                Our App is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13.
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