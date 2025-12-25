import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/impact", label: "Impact" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/blog", label: "Blog" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white border-b border-border transition-shadow duration-300 ${
          isScrolled ? "shadow-lg" : ""
        }`}
        style={{ height: "var(--nav-height)" }}
      >
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/assets/images/logo.png"
              alt="The Olanike Omopariola Foundation"
              className="h-[70px] w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block" aria-label="Primary">
            <ul className="flex gap-10 list-none m-0 p-0">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`uppercase font-semibold text-lg transition-colors hover:text-green ${
                      location.pathname === link.href
                        ? "text-green"
                        : "text-gray-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/donate"
              className="btn btn-green px-6 py-3 text-lg font-medium gap-2 hidden sm:flex"
              style={{ width: "180px", height: "60px", borderRadius: "111px" }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 21s-6.7-4.4-9.2-6.9A5.5 5.5 0 0 1 10.5 6.5L12 8l1.5-1.5a5.5 5.5 0 0 1 7.7 7.7C18.7 16.6 12 21 12 21z"
                />
              </svg>
              Donate
            </Link>

            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <img
                src="/assets/icons/menu-mobile.png"
                alt=""
                className="w-10 h-10"
              />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
      />
    </>
  );
};

export default Header;
