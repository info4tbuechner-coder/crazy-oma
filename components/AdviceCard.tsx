
import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import type { Advice } from '../types';
import { ChevronDownIcon } from './ui/Icons';

interface AdviceCardProps {
    advice: Advice;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ advice }) => {
    const priorityColor = advice.prioritaet === 'hoch' ? 'text-brand-accent' : (advice.prioritaet === 'mittel' ? 'text-brand-primary' : 'text-slate-500');
    const priorityBg = advice.prioritaet === 'hoch' ? 'bg-brand-accent/10 border-brand-accent/20' : (advice.prioritaet === 'mittel' ? 'bg-brand-primary/10 border-brand-primary/20' : 'bg-slate-800/30 border-slate-700/30');

    return (
        <Disclosure>
            {({ open }) => (
                <div className={`rounded-3xl md:rounded-[2rem] border transition-all duration-300 overflow-hidden ${open ? 'bg-slate-900/60 border-slate-700 shadow-xl' : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'}`}>
                    <Disclosure.Button className="flex justify-between items-center w-full px-6 py-5 md:px-8 md:py-6 text-left focus:outline-none group">
                        <div className="flex items-center gap-6">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${priorityBg} ${priorityColor}`}>
                                {advice.prioritaet}
                            </span>
                            <span className={`text-sm md:text-lg font-bold transition-colors font-display ${open ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {advice.titel}
                            </span>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-500 ${open ? 'rotate-180 text-brand-primary' : 'text-slate-600'}`} />
                    </Disclosure.Button>
                    <Transition
                        enter="transition duration-300 ease-out"
                        enterFrom="transform -translate-y-2 opacity-0"
                        enterTo="transform translate-y-0 opacity-100"
                        leave="transition duration-200 ease-in"
                        leaveFrom="transform translate-y-0 opacity-100"
                        leaveTo="transform -translate-y-2 opacity-0"
                    >
                        <Disclosure.Panel className="px-6 pb-6 md:px-8 md:pb-8 text-sm md:text-base text-slate-300 font-sans leading-relaxed border-t border-slate-800 pt-6">
                            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60 italic border-l-2 border-l-brand-primary/40">
                                {advice.text}
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    );
};

export default AdviceCard;
