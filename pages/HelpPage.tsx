import React, { useState } from 'react';
import { usePageTitle } from '../context/PageTitleContext';

// FAQ data structure
const faqData = [
  {
    title: 'Account Management',
    items: [
      {
        question: 'How do I reset my password?',
        answer: 'To reset your password, go to the login page and click on "Forgot Password". Enter your email address or IEMIS code, and you will receive instructions to reset your password.'
      },
      {
        question: 'Can I change my email address associated with my account?',
        answer: 'Yes, you can update your email address by going to Settings > Security and entering a new email address. You will need to verify the new email address before it becomes active.'
      },
      {
        question: 'What should I do if I forget my login credentials?',
        answer: 'If you forget your login credentials, contact your system administrator who can help you reset your account information. For school accounts, this would be the admin team.'
      }
    ]
  },
  {
    title: 'Student Data Entry',
    items: [
      {
        question: 'How do I add new students to the system?',
        answer: 'To add students, go to the School Dashboard > Students > Add Student. Fill in all required student information including name, date of birth, grade, and roll number. You can also import students in bulk using the Excel upload feature.'
      },
      {
        question: 'Is there a limit to the number of students I can add?',
        answer: 'There is no strict limit on the number of students you can add. However, for performance reasons, it is recommended to manage students in batches if you have a very large number.'
      },
      {
        question: 'How do I update student information?',
        answer: 'To update student information, go to the Students page, find the student in the list, and click the edit icon. Make the necessary changes and save the updated information.'
      }
    ]
  },
  {
    title: 'Subject Management',
    items: [
      {
        question: 'How do I assign subjects to students?',
        answer: 'To assign subjects, go to School Dashboard > Assign Subjects. Select the grade and academic year, then choose students and assign the relevant subjects from the list.'
      },
      {
        question: 'Can I add new subjects to the system?',
        answer: 'Subject management is handled by administrators. If you need to add a new subject, contact the admin team who can add it to the master subject list.'
      },
      {
        question: 'What is the difference between theory and internal subjects?',
        answer: 'Theory subjects are those where students are assessed through written examinations. Internal subjects are assessed through continuous evaluation, practical work, or internal assessments conducted by the school.'
      }
    ]
  },
  {
    title: 'Marksheet Generation',
    items: [
      {
        question: 'How do I generate mark sheets for students?',
        answer: 'To generate mark sheets, go to School Dashboard > Marksheet. Select the grade and academic year, then choose the students for whom you want to generate mark sheets. The system will automatically calculate grades and generate printable mark sheets.'
      },
      {
        question: 'Can I customize the format of mark sheets?',
        answer: 'The mark sheet format follows the standard prescribed by the education department. Limited customization options are available in the settings, but major formatting changes require administrator approval.'
      },
      {
        question: 'What should I do if there is an error in a generated mark sheet?',
        answer: 'If you find an error in a generated mark sheet, correct the data in the Marks Entry section first. Then regenerate the mark sheet to reflect the updated information.'
      }
    ]
  }
];

// Accordion component for FAQ items
const AccordionItem: React.FC<{ 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void 
}> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
      <button
        className="flex justify-between items-center w-full p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <svg 
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  );
};

const HelpPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setPageTitle('Help');
  }, [setPageTitle]);

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="animate-fade-in">
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Find answers to frequently asked questions about using the Multi-School Result Management System.
      </p>

      <div className="space-y-8">
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <AccordionItem
                  key={itemIndex}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openItems[`${sectionIndex}-${itemIndex}`] || false}
                  onClick={() => toggleItem(sectionIndex, itemIndex)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;