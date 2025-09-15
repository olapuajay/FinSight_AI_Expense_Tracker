import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="px-6 py-12 h-[80vh] text-center md:py-20 bg-gradient-to-b from-white to-[#F9FAFB]">
      <h1 className="md:text-6xl text-4xl font-extrabold text-[#111827] leading-tight">
        Smarter Money Management <br />
        <span className="text-[#2563EB]">Starts Here</span>
      </h1>

      <p className="mt-4 text-sm text-[#6B7280] md:text-lg md:mt-6 max-w-xl mx-auto">
        Take control of your spending, manage budgets, and stay on top of your money with ease.
        Your personal AI-finance companion, built for you.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/register" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#2563EB] text-white shadow-md hover:opacity-90 transition duration-300">
          Get Started
        </Link>
        <a href="#preview" className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition duration-300">
          Preview
        </a>
      </div>
    </section>
  )
}

export default Hero
