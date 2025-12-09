import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  emoji: string;
  category: string;
}

const FAQs: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 'shipping-1',
      category: 'Shipping & Delivery',
      emoji: '🚀',
      question: 'How long does shipping take?',
      answer: 'We blast off your order within 24 hours! Most orders arrive within 2-3 business days. You\'ll receive a tracking number via email as soon as your package ships, so you can follow your magical toys on their journey to your doorstep.',
    },
    {
      id: 'shipping-2',
      category: 'Shipping & Delivery',
      emoji: '🚀',
      question: 'Do you offer free shipping?',
      answer: 'We offer competitive shipping rates on all orders. Check your cart for shipping costs before checkout. We often have promotions and free shipping offers - keep an eye on our store for special deals!',
    },
    {
      id: 'shipping-3',
      category: 'Shipping & Delivery',
      emoji: '🚀',
      question: 'Can I track my order?',
      answer: 'Absolutely! Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package in real-time and see exactly where your toys are in their delivery journey.',
    },
    {
      id: 'returns-1',
      category: 'Returns & Exchanges',
      emoji: '🌈',
      question: 'What is your return policy?',
      answer: 'We want you to be happy! You can return any item within 30 days of purchase for a full refund. Items must be in original condition and packaging. Simply contact our support team to start a return - we\'ll make it as easy as possible!',
    },
    {
      id: 'returns-2',
      category: 'Returns & Exchanges',
      emoji: '🌈',
      question: 'How do I exchange an item?',
      answer: 'If you\'d like to exchange a toy for a different one, just reach out to our support team with your order number. We\'ll arrange the exchange and make sure you get the toy of your dreams!',
    },
    {
      id: 'returns-3',
      category: 'Returns & Exchanges',
      emoji: '🌈',
      question: 'How long does a refund take?',
      answer: 'Once we receive and inspect your returned item, refunds are processed within 5-7 business days. The refund will appear in your original payment method. Processing may take a few additional days depending on your bank or credit card company.',
    },
    {
      id: 'products-1',
      category: 'Products & Inventory',
      emoji: '🎁',
      question: 'Are all toys age-appropriate?',
      answer: 'Yes! All our toys are carefully curated and come with age recommendations. We ensure that each toy meets safety standards and is appropriate for the recommended age group. Always check the product description for specific age guidelines.',
    },
    {
      id: 'products-2',
      category: 'Products & Inventory',
      emoji: '🎁',
      question: 'What if a toy is out of stock?',
      answer: 'If an item is out of stock, you\'ll see that on the product page. You can sign up for notifications to be alerted when it\'s back in stock. We regularly restock popular items, so check back often!',
    },
    {
      id: 'products-3',
      category: 'Products & Inventory',
      emoji: '🎁',
      question: 'Do you sell toys from specific brands?',
      answer: 'We carry a wonderful selection of toys from various brands, ensuring quality and variety. Check out our shop to browse through our curated collection. If you\'re looking for something specific, feel free to contact us and we\'ll help you find it!',
    },
    {
      id: 'account-1',
      category: 'Account & Orders',
      emoji: '👤',
      question: 'How do I create an account?',
      answer: 'Click on "Login" in the top menu and select "Sign Up" to create your account. You can sign up with your email or use Google OAuth for quick and secure registration. Once you\'re signed up, you\'ll have access to your order history and profile.',
    },
    {
      id: 'account-2',
      category: 'Account & Orders',
      emoji: '👤',
      question: 'Can I view my order history?',
      answer: 'Absolutely! Once you\'re logged in, go to your profile and click on "My Orders" to see all your past purchases. You can view order details, tracking information, and request returns directly from there.',
    },
    {
      id: 'account-3',
      category: 'Account & Orders',
      emoji: '👤',
      question: 'How do I reset my password?',
      answer: 'Click "Login" and then "Forgot Password" on the login page. Enter your email address and we\'ll send you instructions to reset your password. Follow the link in the email to create a new password and regain access to your account.',
    },
    {
      id: 'payment-1',
      category: 'Payment & Pricing',
      emoji: '💳',
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards, debit cards, and digital payment methods. All transactions are secured with encryption to protect your payment information. Your security is our top priority!',
    },
    {
      id: 'payment-2',
      category: 'Payment & Pricing',
      emoji: '💳',
      question: 'Is my payment information secure?',
      answer: 'Yes! We use industry-leading encryption and security protocols to protect your payment information. We never store complete credit card details on our servers. Your financial data is safe with us!',
    },
    {
      id: 'payment-3',
      category: 'Payment & Pricing',
      emoji: '💳',
      question: 'Do you offer discounts or promotional codes?',
      answer: 'We regularly offer promotions and special deals! Sign up for our newsletter to receive exclusive discount codes and be the first to know about sales and limited-time offers.',
    },
  ];

  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg">
            ❓
          </div>
          <h1 className="font-heading font-black text-5xl text-gray-800 mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Find answers to common questions about WonderLand and our magical toys!
          </p>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-4xl mx-auto space-y-12">
        {categories.map((category) => {
          const categoryItems = faqItems.filter((item) => item.category === category);
          const emoji = categoryItems[0]?.emoji;

          return (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl">{emoji}</div>
                <h2 className="font-heading font-black text-3xl text-gray-800 tracking-tight">
                  {category}
                </h2>
                <div className="flex-grow h-1 bg-gradient-to-r from-primary-200 to-transparent rounded-full"></div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full px-6 py-5 flex items-start justify-between gap-4 hover:bg-primary-50 transition-colors duration-200 text-left"
                    >
                      <span className="font-bold text-gray-800 text-lg leading-snug flex-1">
                        {item.question}
                      </span>
                      <ChevronDown
                        size={24}
                        className={`text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                          expandedId === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Expanded Answer */}
                    {expandedId === item.id && (
                      <div className="px-6 pb-5 border-t-2 border-gray-100 bg-primary-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-gray-700 font-medium leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Section */}
      <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-3xl border-3 border-primary-300 p-10 text-center shadow-lg">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-heading font-black text-2xl text-gray-800 mb-3">
          Still Have Questions?
        </h3>
        <p className="text-gray-700 font-medium mb-6">
          Can't find the answer you're looking for? Our helpful support team is here to help!
        </p>
        <button className="btn-funky bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 border-primary-800 shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2">
          <Sparkles size={20} />
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FAQs;
