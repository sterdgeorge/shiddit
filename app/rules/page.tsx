import MainLayout from '@/components/layout/MainLayout'

export default function RulesPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Shiddit Rules
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Community Guidelines
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                1. Remember the human
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                shiddit is a place for creating community and belonging, not for attacking marginalized or vulnerable groups of people. Everyone has a right to use shiddit free of harassment, bullying, and threats of violence.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                2. Abide by community rules
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Post authentic content into communities where you have a personal interest, and do not cheat or engage in content manipulation (including spamming, vote manipulation, ban evasion, or subscriber fraud) or otherwise interfere with or disrupt shiddit communities.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                3. Respect the privacy of others
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Instigating harassment, for example by revealing someone's personal or confidential information, is not allowed. Never post or threaten to post intimate or sexually-explicit media of someone without their consent.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                4. Don't impersonate an individual or an entity
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You may not impersonate individuals, groups, or entities in a manner that is intended to or does mislead, confuse, or deceive others.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                5. Don't break the site or do anything that interferes with normal use of shiddit
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You may not use shiddit's services in ways that interfere with, disrupt, negatively affect, or inhibit other users' full enjoyment of shiddit, or that could damage, disable, overburden, or impair the functioning of our services.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Enforcement
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We have a variety of ways of enforcing our rules, including, but not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400 space-y-1">
              <li>Asking you nicely to knock it off</li>
              <li>Asking you less nicely</li>
              <li>Temporary or permanent suspension of accounts</li>
              <li>Removal of privileges from, or adding restrictions to, accounts</li>
              <li>Adding restrictions to shiddit communities</li>
              <li>Removal of content</li>
              <li>Banning of shiddit communities</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 