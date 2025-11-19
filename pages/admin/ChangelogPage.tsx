import React, { useEffect } from 'react';
import { usePageTitle } from '../../context/PageTitleContext';

const changelogData = [
  {
    version: '1.4.0',
    date: '2024-08-01',
    changes: {
      '✨ New Features': [
        'Added a comprehensive "Manage Students" page for admins with detailed student information columns.',
        'Implemented school and year filters on the admin "Manage Students" page.',
      ],
      '🚀 Improvements': [
        'Globally reduced font size to `sm` for a more compact UI.',
        'Updated school selection dropdowns to show IEMIS code before the school name for easier identification.',
      ],
    }
  },
  {
    version: '1.3.0',
    date: '2024-07-30',
    changes: {
        '✨ New Features': [
            'Added a "School Dashboard Viewer" for admins to see individual school dashboards.',
            'Added a "School Profile Viewer" for admins with an "Edit Profile" mode.',
        ],
        '🚀 Improvements': [
            'Replaced all action text buttons with icons (View, Edit, Delete) for a cleaner table UI.',
            'Redesigned the "Manage Subjects" table for better clarity, grouping theory and internal details.',
            'Updated subject data with a complete list of subjects for Grade 11.',
        ],
    }
  },
  {
    version: '1.2.0',
    date: '2024-07-28',
    changes: {
      '✨ New Features': [
        'Admin dashboard now shows a full system overview with key statistics and recent registrations.',
        'School dashboard now displays a detailed "School Profile" card.',
      ],
      '🚀 Improvements': [
        'Enhanced search on "Manage Schools" page to allow filtering by School Name, IEMIS Code, and Municipality.',
        'Added a read-only "Selected School" field on the Marks Entry page for clarity.',
      ],
      '🐛 Bug Fixes': [
        'Fixed a TypeScript type inference issue in the Sidebar component.',
        'Corrected pagination logic to reset on new searches.',
      ]
    }
  },
  {
    version: '1.0.0',
    date: '2024-07-25',
    changes: {
      '✨ New Features': [
        'Initial release of the Multi-School Result Management System.',
        'Separate dashboards for Admin and School users.',
        'Core modules: Manage Schools, Students, Subjects, Marks Entry, and Marksheet Printing.',
      ],
    }
  }
];

const ChangeTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const colorClasses = {
        '✨ New Features': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        '🚀 Improvements': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        '🐛 Bug Fixes': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    const defaultClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClasses[type as keyof typeof colorClasses] || defaultClass}`}>{type}</span>;
}

const ChangelogPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle('Changelog');
  }, [setPageTitle]);

  return (
    <div className="animate-fade-in">
      <p className="text-gray-500 dark:text-gray-400 mb-8">Tracking all the new features, improvements, and bug fixes.</p>

      <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
        {changelogData.map((entry, index) => (
          <div key={index} className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                </svg>
            </span>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Version {entry.version}</h2>
                    <time className="text-xs font-normal text-gray-400 dark:text-gray-500">{entry.date}</time>
                </div>
                <div className="space-y-4">
                    {Object.entries(entry.changes).map(([type, list]) => (
                        <div key={type}>
                            <ChangeTypeBadge type={type} />
                            <ul className="mt-2 ml-4 list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                                {list.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChangelogPage;
