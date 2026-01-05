
import React from 'react';

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for small CSV files and individual projects.',
      features: ['Up to 5,000 rows', 'Basic rule-based cleaning', 'CSV Export', '7-day history'],
      cta: 'Current Plan',
      highlight: false,
    },
    {
      name: 'Professional',
      price: '$49',
      description: 'Advanced AI features for marketing and operations teams.',
      features: ['Up to 100,000 rows', 'AI Anomaly Detection', 'Email Validation', 'Custom Schemas', 'API Access', 'Priority Support'],
      cta: 'Upgrade to Pro',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Secure, scalable solutions for large-scale data cleaning.',
      features: ['Unlimited rows', 'SSO & Advanced Security', 'Custom Integrations', 'Dedicated Manager', 'On-premise deployment'],
      cta: 'Contact Sales',
      highlight: false,
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-slate-600">Choose the plan that's right for your data needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative p-8 rounded-3xl border transition-all ${
              plan.highlight 
                ? 'border-indigo-600 ring-4 ring-indigo-50 bg-white shadow-xl scale-105 z-10' 
                : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-slate-500 ml-1">/mo</span>}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{plan.description}</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-4 px-6 rounded-2xl font-bold transition-all ${
                plan.highlight 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
