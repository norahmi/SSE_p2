import { Metadata } from 'next'
import ParticleField from '@/components/ui/ParticleField'
import { Zap, Leaf, Trophy, Code2, Globe2, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About LeafCode - Training the Green Developers of Tomorrow',
  description: 'LeafCode gamifies energy-efficient coding, teaching developers to write sustainable software that reduces global carbon emissions at scale.'
}

export default function AboutPage() {
  return (
    <>
    <ParticleField/>
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-16">
        <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/60 mb-3">
          About LeafCode
        </p>
        <h1 className="font-['Space_Mono',monospace] text-4xl md:text-5xl font-bold text-slate-100 mb-6">
          Your Algorithm Is <span className="text-[#28eb70]">Melting Glaciers</span>.
          <br />
          We're Here To Fix That.
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-3xl leading-relaxed">
          Every inefficient loop, every wasteful recursive call, every unoptimized data structure — they all consume real energy in real data centers powered by real coal plants. LeafCode makes the invisible visible: your code has a carbon footprint, and it's bigger than you think.
        </p>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/60 mb-4 text-center">
          Built by
        </p>
        <div className="flex items-center justify-center gap-4 mb-3">
          
          {/* Team Member 1 */}
          <div className="group relative">
            <div className="w-30 h-30 rounded-full overflow-hidden transition-transform hover:scale-130">
              <img 
                src="/team/Medon.png" 
                alt="Team member 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <span className="font-['Space_Mono',monospace] text-sm text-slate-500 whitespace-nowrap transition-all group-hover:text-base group-hover:text-slate-300">
                Medon
              </span>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="group relative">
            <div className="w-30 h-30 rounded-full overflow-hidden transition-transform hover:scale-130">
              <img 
                src="/team/Norah.png" 
                alt="Team member 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 ">
              <span className="font-['Space_Mono',monospace] text-sm text-slate-500 whitespace-nowrap transition-all group-hover:text-base group-hover:text-slate-300">
                Norah
              </span>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="group relative">
            <div className="w-30 h-30 rounded-full overflow-hidden transition-transform hover:scale-130">
              <img 
                src="/team/Job.png" 
                alt="Team member 3"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <span className="font-['Space_Mono',monospace] text-sm text-slate-500 whitespace-nowrap transition-all group-hover:text-base group-hover:text-slate-300">
                Job
              </span>
            </div>
          </div>

          {/* Team Member 4 */}
          <div className="group relative">
            <div className="w-30 h-30 rounded-full overflow-hidden transition-transform hover:scale-130">
              <img 
                src="/team/Ayush.png" 
                alt="Team member 4"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <span className="font-['Space_Mono',monospace] text-sm text-slate-500 whitespace-nowrap transition-all group-hover:text-base group-hover:text-slate-300">
                Ayush
              </span>
            </div>
          </div>

          {/* Team Member 5 */}
          <div className="group relative">
            <div className="w-30 h-30 rounded-full overflow-hidden transition-transform hover:scale-130">
              <img 
                src="/team/Konstantinos.png" 
                alt="Team member 5"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <span className="font-['Space_Mono',monospace] text-sm text-slate-500 whitespace-nowrap transition-all group-hover:text-base group-hover:text-slate-300">
                 Konstantinos
              </span>
            </div>
          </div>

        </div>
        <p className="font-['Space_Mono',monospace] text-xs text-slate-500 text-center mt-16">
          A team of 5 students passionate about sustainable software
        </p>
      </div>
      {/* Mission Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="rounded-xl border border-[#1e3a2a] bg-[#0a1a10]/40 p-6">
          <div className="w-10 h-10 rounded-lg bg-[#28eb70]/10 border border-[#28eb70]/30 flex items-center justify-center mb-4">
            <Leaf className="h-5 w-5 text-[#28eb70]" />
          </div>
          <h3 className="font-['Space_Mono',monospace] text-lg font-bold text-slate-100 mb-2">
            Make Green Code The Default
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            We're building a generation of developers who instinctively optimize for sustainability — not as an afterthought, but as foundational practice.
          </p>
        </div>

        <div className="rounded-xl border border-[#1e3a2a] bg-[#0a1a10]/40 p-6">
          <div className="w-10 h-10 rounded-lg bg-[#28eb70]/10 border border-[#28eb70]/30 flex items-center justify-center mb-4">
            <Globe2 className="h-5 w-5 text-[#28eb70]" />
          </div>
          <h3 className="font-['Space_Mono',monospace] text-lg font-bold text-slate-100 mb-2">
            Scale Through Education
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            When millions of developers default to energy-efficient algorithms, we reduce global data center emissions and make computing accessible where energy is scarce.
          </p>
        </div>

        <div className="rounded-xl border border-[#1e3a2a] bg-[#0a1a10]/40 p-6">
          <div className="w-10 h-10 rounded-lg bg-[#28eb70]/10 border border-[#28eb70]/30 flex items-center justify-center mb-4">
            <Trophy className="h-5 w-5 text-[#28eb70]" />
          </div>
          <h3 className="font-['Space_Mono',monospace] text-lg font-bold text-slate-100 mb-2">
            Gamify The Future
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            By turning energy efficiency into competition, we make sustainable coding engaging, measurable, and rewarding for the next generation.
          </p>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="rounded-xl border border-[#1e3a2a] bg-[#0a1a10]/40 p-8 md:p-12 mb-16">
        <h2 className="font-['Space_Mono',monospace] text-2xl font-bold text-slate-100 mb-6">
          The Problem
        </h2>
        <div className="space-y-4 text-slate-400 leading-relaxed">
          <p>
            Software is responsible for a growing share of global energy consumption. Data centers consume approximately <span className="text-[#28eb70] font-semibold">1-2% of global electricity</span>, and that number is projected to triple by 2030. Yet most developers have no idea how much energy their code consumes.
          </p>
          <p>
            Traditional coding education focuses on correctness and speed, but ignores efficiency. Students learn to solve problems without understanding that a recursive Fibonacci implementation can consume <span className="text-[#28eb70] font-semibold">5-10× more energy</span> than an iterative one.
          </p>
          <p>
            The result? Millions of developers writing energy-wasteful code that gets executed billions of times daily across the internet, compounding into gigatons of unnecessary carbon emissions.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="font-['Space_Mono',monospace] text-2xl font-bold text-slate-100 mb-8">
          How LeafCode Works
        </h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#28eb70]/10 border border-[#28eb70]/30 flex items-center justify-center font-['Space_Mono',monospace] text-sm font-bold text-[#28eb70]">
              1
            </div>
            <div>
              <h3 className="font-['Space_Mono',monospace] text-base font-bold text-slate-100 mb-2">
                Real Energy Measurement
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Using machine learning models trained on real hardware data, we estimate the actual energy consumption of your code as it runs. No guesswork — real joules, real watts, real impact.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#28eb70]/10 border border-[#28eb70]/30 flex items-center justify-center font-['Space_Mono',monospace] text-sm font-bold text-[#28eb70]">
              2
            </div>
            <div>
              <h3 className="font-['Space_Mono',monospace] text-base font-bold text-slate-100 mb-2">
                Competitive Learning
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Solve the same challenges as LeetCode, but compete on energy efficiency instead of just speed. Climb the leaderboard by writing smarter, not just faster, code.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#28eb70]/10 border border-[#28eb70]/30 flex items-center justify-center font-['Space_Mono',monospace] text-sm font-bold text-[#28eb70]">
              3
            </div>
            <div>
              <h3 className="font-['Space_Mono',monospace] text-base font-bold text-slate-100 mb-2">
                Multi-Language Support
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Practice in Python, JavaScript, C, or C++. Compare how different languages and approaches affect energy consumption for the same algorithm.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#28eb70]/10 border border-[#28eb70]/30 flex items-center justify-center font-['Space_Mono',monospace] text-sm font-bold text-[#28eb70]">
              4
            </div>
            <div>
              <h3 className="font-['Space_Mono',monospace] text-base font-bold text-slate-100 mb-2">
                Instant Feedback
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                See your code's energy consumption in real-time. Learn which patterns waste power and which ones scale efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="rounded-xl border border-[#1e3a2a] bg-gradient-to-br from-[#28eb70]/5 to-transparent p-6 text-center">
          <div className="font-['Space_Mono',monospace] text-4xl font-bold text-[#28eb70] mb-2">
            5-10×
          </div>
          <p className="text-sm text-slate-500">
            Energy difference between optimized vs. naive algorithms
          </p>
        </div>

        <div className="rounded-xl border border-[#1e3a2a] bg-gradient-to-br from-[#28eb70]/5 to-transparent p-6 text-center">
          <div className="font-['Space_Mono',monospace] text-4xl font-bold text-[#28eb70] mb-2">
            4
          </div>
          <p className="text-sm text-slate-500">
            Programming languages supported for diverse learning
          </p>
        </div>

        <div className="rounded-xl border border-[#1e3a2a] bg-gradient-to-br from-[#28eb70]/5 to-transparent p-6 text-center">
          <div className="font-['Space_Mono',monospace] text-4xl font-bold text-[#28eb70] mb-2">
            Real-time
          </div>
          <p className="text-sm text-slate-500">
            Energy measurements using ML-based power estimation
          </p>
        </div>
      </div>

      {/* Vision Section */}
      <div className="rounded-xl border border-[#1e3a2a] bg-gradient-to-br from-[#28eb70]/5 via-transparent to-transparent p-8 md:p-12 mb-16">
        <h2 className="font-['Space_Mono',monospace] text-2xl font-bold text-slate-100 mb-6">
          Our Vision
        </h2>
        <div className="space-y-4 text-slate-400 leading-relaxed">
          <p>
            By 2030, we envision a world where energy-aware coding isn't a specialty — it's baseline literacy. Where every CS graduate understands that their algorithms have environmental impact. Where "Does it work?" becomes "Does it work <span className="text-[#28eb70] font-semibold">sustainably</span>?"
          </p>
          <p>
            We're not asking developers to sacrifice performance. We're showing them how marginal gains in efficiency create exponential environmental returns when deployed at internet scale. A 10% energy reduction seems trivial — until you multiply it by a billion users and a trillion compute cycles.
          </p>
          <p className="text-[#28eb70] font-semibold">
            Small optimizations. Exponential impact. That's the LeafCode way.
          </p>
        </div>
      </div>

      {/* Built By Section */}
      <div className="text-center">
        <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/60 mb-3">
          Built at TU Delft
        </p>
        <h2 className="font-['Space_Mono',monospace] text-xl font-bold text-slate-100 mb-4">
          A Sustainable Software Engineering Project
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          LeafCode was created as part of the CS4575 Sustainable Software Engineering course at TU Delft, combining machine learning, cloud infrastructure, and gamification to make energy-efficient coding accessible to everyone.
        </p>
      </div>

    </main>
    </>
  )
}