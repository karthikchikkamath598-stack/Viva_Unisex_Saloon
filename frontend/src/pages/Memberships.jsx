import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiCheck, FiAward, FiShield, FiStar, FiArrowRight } from 'react-icons/fi';

const Memberships = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAction = (tierName) => {
    navigate('/contact');
  };

  const tiers = [
    {
      id: 'Student',
      name: 'Student Club',
      price: '999',
      duration: 'Year',
      description: 'Exclusive year-round savings for scholars. Valid student verification required.',
      icon: <FiAward className="text-3xl text-indigo-400" />,
      borderColor: 'border-indigo-500/20 hover:border-indigo-500/50',
      badgeBg: 'bg-indigo-500/10',
      badgeText: 'text-indigo-300',
      badgeBorder: 'border-indigo-500/30',
      features: [
        'Special student-only rates',
        'Valid student ID card upload required',
        'Yearly renewal subscription',
        'Priority appointment scheduling alerts'
      ]
    },
    {
      id: 'Silver',
      name: 'Silver Club',
      price: '2,999',
      duration: 'Year',
      description: 'Elevate your routine grooming rituals with immediate and consistent savings.',
      icon: <FiShield className="text-3xl text-zinc-300" />,
      borderColor: 'border-zinc-400/20 hover:border-zinc-400/50',
      badgeBg: 'bg-zinc-400/10',
      badgeText: 'text-zinc-300',
      badgeBorder: 'border-zinc-400/30',
      features: [
        'Instant 10% discount on all salon bookings',
        'No manual verification required',
        'Instant activation upon purchase',
        'Valid for one full calendar year',
        'Access to member-only styling events'
      ],
      popular: true
    },
    {
      id: 'Platinum',
      name: 'Platinum Club',
      price: '4,999',
      duration: 'Year',
      description: 'The ultimate luxury experience. Uncompromising benefits for regular patrons.',
      icon: <FiStar className="text-3xl text-amber-400" />,
      borderColor: 'border-amber-500/20 hover:border-amber-500/50',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      features: [
        'Instant 20% discount on all salon bookings',
        'No manual verification required',
        'Instant activation upon purchase',
        'Valid for one full calendar year',
        'Complimentary styling consultations',
        'Preferred choice of stylists (no fee)'
      ]
    }
  ];

  return (
    <div className="pt-28 min-h-screen bg-[#080809] pb-24 font-body text-viva-white relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(212,175,55,0.04)_0%,transparent_70%)] top-[-150px] left-[-200px] pointer-events-none" />
      <div className="absolute w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(212,175,55,0.03)_0%,transparent_70%)] bottom-[-200px] right-[-200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-viva-gold text-xs uppercase tracking-[0.3em] font-bold block">
            Exclusive Privilege Memberships
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-wider text-white">
            VIVA Privilege Club
          </h1>
          <p className="text-sm text-viva-gray font-light leading-relaxed">
            Unlock premium savings, consistent styling discounts, and priority access to VIVA's finest treatment rituals by choosing the tier that matches your grooming routine.
          </p>
        </div>

        {/* Membership Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {tiers.map((tier, idx) => {
            return (
              <div
                key={idx}
                className={`bg-zinc-900/60 border ${tier.borderColor} p-8 rounded-2xl flex flex-col justify-between relative transition-all duration-500 hover:translate-y-[-4px] ${
                  tier.popular ? 'md:scale-105 shadow-[0_10px_30px_rgba(212,175,55,0.06)]' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-viva-gold text-viva-black font-body font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-full shadow-gold-glow">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5">
                      {tier.icon}
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}>
                      {tier.name.split(' ')[0]}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">{tier.name}</h3>
                    <p className="text-xs text-viva-gray mt-2 font-light min-h-[48px]">{tier.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 py-4 border-y border-white/5">
                    <span className="font-heading text-4xl font-extrabold text-viva-gold">₹{tier.price}</span>
                    <span className="text-xs text-viva-gray uppercase tracking-wider">/ {tier.duration}</span>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Included Privileges</span>
                    {tier.features.map((feat, fidx) => (
                      <div key={fidx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <FiCheck className="text-viva-gold text-sm mt-0.5 flex-shrink-0" />
                        <span className="font-light">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleAction(tier.id)}
                    className={`w-full py-3 rounded-xl font-body font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                      tier.popular
                        ? 'bg-viva-gold hover:bg-viva-gold/90 text-viva-black shadow-gold-glow hover:scale-[1.02]'
                        : 'bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-viva-gold/40 text-viva-gold hover:scale-[1.02]'
                    }`}
                  >
                    Inquire Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Comparison Grid */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 sm:p-12">
          <div className="text-center max-w-md mx-auto mb-10 space-y-2">
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold">Benefits Comparison</h3>
            <p className="text-xs text-viva-gray font-light">A detailed side-by-side view of our club memberships.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 font-bold">Privilege Feature</th>
                  <th className="py-4 px-4 font-bold text-center text-indigo-300">Student</th>
                  <th className="py-4 px-4 font-bold text-center text-zinc-300">Silver</th>
                  <th className="py-4 px-4 font-bold text-center text-amber-300">Platinum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-zinc-900/25">
                  <td className="py-4 font-semibold text-white">Yearly Club Cost</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-indigo-300">₹999</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-zinc-300">₹2,999</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-amber-300">₹4,999</td>
                </tr>
                <tr className="hover:bg-zinc-900/25">
                  <td className="py-4 font-semibold text-white">Discount on All Bookings</td>
                  <td className="py-4 px-4 text-center text-viva-gold font-bold">5% Off</td>
                  <td className="py-4 px-4 text-center text-viva-gold font-bold">10% Off</td>
                  <td className="py-4 px-4 text-center text-viva-gold font-bold">20% Off</td>
                </tr>
                <tr className="hover:bg-zinc-900/25">
                  <td className="py-4 font-semibold text-white">Manual ID Approval Needed</td>
                  <td className="py-4 px-4 text-center text-viva-gold font-bold">Yes (ID Upload)</td>
                  <td className="py-4 px-4 text-center text-zinc-500">No (Instant)</td>
                  <td className="py-4 px-4 text-center text-zinc-500">No (Instant)</td>
                </tr>
                <tr className="hover:bg-zinc-900/25">
                  <td className="py-4 font-semibold text-white">Membership Validity</td>
                  <td className="py-4 px-4 text-center text-zinc-300">1 Year</td>
                  <td className="py-4 px-4 text-center text-zinc-300">1 Year</td>
                  <td className="py-4 px-4 text-center text-zinc-300">1 Year</td>
                </tr>
                <tr className="hover:bg-zinc-900/25">
                  <td className="py-4 font-semibold text-white">Priority Stylist Selection</td>
                  <td className="py-4 px-4 text-center text-zinc-500">Standard</td>
                  <td className="py-4 px-4 text-center text-zinc-300">Standard</td>
                  <td className="py-4 px-4 text-center text-viva-gold font-bold">Yes (Complimentary)</td>
                </tr>
                <tr className="hover:bg-zinc-900/25">
                  <td className="py-4 font-semibold text-white">Styling Consultations</td>
                  <td className="py-4 px-4 text-center text-zinc-500">—</td>
                  <td className="py-4 px-4 text-center text-zinc-500">—</td>
                  <td className="py-4 px-4 text-center text-viva-gold font-bold">Complimentary</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CTA Section */}
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">Ready to join the VIVA Privilege Club or have questions?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-viva-gold hover:bg-viva-gold/90 text-viva-black font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-gold-glow"
                >
                  Contact Us <FiArrowRight />
                </Link>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 bg-zinc-950 border border-white/10 hover:border-viva-gold/40 text-viva-gold font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-xl transition-all"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Memberships;


