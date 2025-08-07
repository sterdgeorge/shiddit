import MainLayout from '@/components/layout/MainLayout'

export default function AccessibilityPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Accessibility
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Commitment to Accessibility
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                shiddit is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Accessibility Features
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our platform includes the following accessibility features:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Keyboard navigation support</li>
                <li>Screen reader compatibility</li>
                <li>High contrast mode</li>
                <li>Resizable text</li>
                <li>Alternative text for images</li>
                <li>Semantic HTML structure</li>
                <li>Focus indicators for interactive elements</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Conformance Status
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Known Issues
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We are aware of some accessibility issues and are working to resolve them. If you encounter any accessibility barriers, please contact us so we can address them.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Feedback and Contact
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We welcome your feedback on the accessibility of shiddit. Please let us know if you encounter accessibility barriers:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Email: accessibility@shiddit.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Internet Street, Web City, WC 12345</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Technical Specifications
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                shiddit relies on the following technologies to work with the particular accessibility features:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>HTML</li>
                <li>CSS</li>
                <li>JavaScript</li>
                <li>WAI-ARIA</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Assessment Methods
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                shiddit assessed the accessibility of our platform using the following methods:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-2">
                <li>Self-evaluation</li>
                <li>External evaluation</li>
                <li>User testing with people with disabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 