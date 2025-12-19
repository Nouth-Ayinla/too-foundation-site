import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const heroSlides = [
  '/assets/images/hero1.jpg',
  '/assets/images/hero2.jpg',
  '/assets/images/hero3.jpg',
  '/assets/images/hero4.jpg',
  '/assets/images/hero5.jpg',
];

const focusAreas = [
  { img: '/assets/images/area-gbv.jpg', title: 'GBV Advocacy & Awareness', desc: 'Fighting to end domestic violence' },
  { img: '/assets/images/area-education.jpg', title: 'Education for All', desc: 'Access to quality learning' },
  { img: '/assets/images/area-women.jpg', title: 'Women Empowerment', desc: 'Supporting women to thrive' },
  { img: '/assets/images/area-health.jpg', title: 'Health & Wellness', desc: 'Promoting holistic well-being' },
  { img: '/assets/images/area-youth.jpg', title: 'Youth Mentorship', desc: 'Guiding the next generation' },
  { img: '/assets/images/area-community.jpg', title: 'Community Development', desc: 'Building stronger communities' },
];

const stats = [
  { num: 3000, label: 'Survivors Supported', suffix: '+' },
  { num: 15, label: 'Partner Organizations' },
  { num: 43, label: 'Schools Reached', suffix: '+' },
  { num: 60, label: 'Volunteers & Mentors', suffix: '+' },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counters, setCounters] = useState(stats.map(() => 0));
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          stats.forEach((stat, index) => {
            let current = 0;
            const step = Math.max(1, Math.round(stat.num / 60));
            const animate = () => {
              current += step;
              if (current >= stat.num) {
                setCounters((prev) => {
                  const newCounters = [...prev];
                  newCounters[index] = stat.num;
                  return newCounters;
                });
              } else {
                setCounters((prev) => {
                  const newCounters = [...prev];
                  newCounters[index] = current;
                  return newCounters;
                });
                requestAnimationFrame(animate);
              }
            };
            animate();
          });
        }
      },
      { threshold: 0.4 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[600px] lg:h-[828px] overflow-hidden">
        {/* Slides */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${slide})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/75" />
        </div>

        {/* Content */}
        <div className="container relative h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="font-coolvetica text-5xl lg:text-8xl font-light leading-none mb-8">
              Together, We<br />Can Rebuild<br /><span className="text-green">Dreams</span>
            </h1>
            <p className="text-xl lg:text-3xl opacity-90 mb-12">
              Empowering women and young people through advocacy,<br className="hidden lg:block" />
              education, and hope.
            </p>
            <div className="flex gap-6 lg:gap-10">
              <Link
                to="/donate"
                className="btn btn-white btn-outline-green text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6"
              >
                Donate
              </Link>
              <Link
                to="/volunteer"
                className="btn btn-green text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6"
              >
                Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Founder Card */}
            <figure className="relative w-full max-w-[453px] h-[600px] lg:h-[812px] rounded-xl overflow-hidden mx-auto lg:mx-0 hover:-translate-y-2 transition-transform">
              <img
                src="/assets/images/founnder-story.jpg"
                alt="Oluwatoyin Omotayo"
                className="w-full h-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 h-[315px] bg-gradient-to-t from-black/90 to-transparent flex items-end p-8">
                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 rounded-full bg-green mt-2 flex-shrink-0" />
                  <div>
                    <span className="text-white text-3xl lg:text-4xl font-bold block">
                      Oluwatoyin Aanuoluwapo Omotayo Esq.
                    </span>
                    <span className="text-white/90 text-xl font-light block mt-1">FOUNDER</span>
                  </div>
                </div>
              </figcaption>
            </figure>

            {/* Copy */}
            <div className="lg:pl-8">
              <h2 className="section-title mb-6">About the<br />Foundation</h2>
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-6">
                The Olanike Omopariola Foundation (TOOF) is a non-profit organization dedicated
                to ending domestic and gender-based violence and transforming the lives
                of women and young people across Nigeria and the United Kingdom.
              </p>
              <Link
                to="/about"
                className="text-xl lg:text-2xl font-medium text-foreground hover:text-green transition-colors"
              >
                Read More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="container">
          <h2 className="section-title text-center mb-4">Our Focus Areas</h2>
          <p className="text-center text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            We work across multiple pillars to create lasting change in communities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((area) => (
              <article
                key={area.title}
                className="relative h-[350px] lg:h-[391px] rounded-xl overflow-hidden group cursor-pointer hover:-translate-y-2 hover:shadow-lg transition-all"
              >
                <img
                  src={area.img}
                  alt={area.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-t from-black/85 to-transparent" />
                <div className="absolute left-8 right-8 bottom-8 text-white">
                  <h3 className="text-xl font-bold mb-1">{area.title}</h3>
                  <p className="opacity-80">{area.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="bg-white py-16 lg:py-20">
        <div className="container">
          <div className="flex flex-wrap justify-between items-center gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex flex-col items-center text-center flex-1 min-w-[140px]">
                <span className="font-coolvetica text-4xl lg:text-5xl text-green leading-none">
                  {counters[index]}{stat.suffix || ''}
                </span>
                <span className="text-foreground mt-2">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <h2 className="section-title text-center mb-16">Featured Stories</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Story 1 */}
            <article>
              <Link
                to="/blog/chinonso-story"
                className="block relative h-[400px] lg:h-[622px] rounded-xl overflow-hidden group hover:-translate-y-2 transition-transform"
              >
                <img
                  src="/assets/images/story1.jpg"
                  alt="Chinonso's Story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <h3 className="absolute left-8 lg:left-12 bottom-16 lg:bottom-20 text-white text-xl lg:text-2xl font-semibold max-w-md">
                  From Survivor to Thriver: Chinonso's Story
                </h3>
              </Link>
              <p className="text-muted-foreground text-lg mt-8 leading-relaxed">
                After years of domestic abuse, Chinonso found the courage to leave and rebuild her life with support from TOOF.
              </p>
              <Link
                to="/blog/chinonso-story"
                className="text-green font-semibold text-lg hover:text-green-dark transition-colors"
              >
                Read Story →
              </Link>
            </article>

            {/* Story 2 */}
            <article>
              <Link
                to="/blog/samuel-story"
                className="block relative h-[400px] lg:h-[622px] rounded-xl overflow-hidden group hover:-translate-y-2 transition-transform"
              >
                <img
                  src="/assets/images/story2.jpg"
                  alt="Samuel's Journey"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <h3 className="absolute left-8 lg:left-12 bottom-16 lg:bottom-20 text-white text-xl lg:text-2xl font-semibold max-w-md">
                  Breaking Barriers: Samuel's Journey
                </h3>
              </Link>
              <p className="text-muted-foreground text-lg mt-8 leading-relaxed">
                Samuel overcame educational barriers through our mentorship program and is now pursuing his dreams.
              </p>
              <Link
                to="/blog/samuel-story"
                className="text-green font-semibold text-lg hover:text-green-dark transition-colors"
              >
                Read Story →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="bg-muted py-16 lg:py-20">
        <div className="container">
          <h2 className="section-title text-center mb-8">Upcoming Events</h2>
          <EventsGrid />
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <h2 className="section-title text-center mb-16">Gallery</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <img src="/assets/images/gallery1.jpg" alt="Gallery 1" className="w-full h-[300px] lg:h-[398px] object-cover" />
            <img src="/assets/images/gallery2.jpg" alt="Gallery 2" className="w-full h-full object-cover md:col-span-2 md:row-span-2" />
            <img src="/assets/images/gallery3.jpg" alt="Gallery 3" className="w-full h-[300px] lg:h-[398px] object-cover" />
            <img src="/assets/images/gallery4.jpg" alt="Gallery 4" className="w-full h-[300px] lg:h-[398px] object-cover" />
            <img src="/assets/images/gallery5.jpg" alt="Gallery 5" className="w-full h-[300px] lg:h-[398px] object-cover" />
            <img src="/assets/images/gallery6.jpg" alt="Gallery 6" className="w-full h-[300px] lg:h-[398px] object-cover" />
          </div>

          <div className="text-center mt-12">
            <Link
              to="/about#gallery"
              className="btn btn-white border-2 border-green text-green text-xl px-12 py-4 hover:bg-green hover:text-white transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#14248A] to-[#1A3A8E] py-16 lg:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <img
              src="/assets/images/cta.jpg"
              alt="Join our mission"
              className="w-full h-[400px] lg:h-[539px] rounded-xl object-cover"
            />

            <div className="text-white">
              <div className="space-y-6 mb-12">
                <Link
                  to="/volunteer"
                  className="flex items-center justify-between w-full max-w-lg bg-gradient-to-r from-[#3D5AFE] to-[#5C6BC0] rounded-full px-8 py-5 text-xl font-bold hover:opacity-90 transition-opacity"
                >
                  <span>Volunteer</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/donate"
                  className="flex items-center justify-between w-full max-w-lg bg-gradient-to-r from-[#673AB7] to-[#9575CD] rounded-full px-8 py-5 text-xl font-bold hover:opacity-90 transition-opacity"
                >
                  <span>Donate</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/about"
                  className="flex items-center justify-between w-full max-w-lg bg-gradient-to-r from-[#7E57C2] to-[#B39DDB] rounded-full px-8 py-5 text-xl font-bold hover:opacity-90 transition-opacity"
                >
                  <span>Learn More</span>
                  <span>→</span>
                </Link>
              </div>

              <h3 className="font-coolvetica text-4xl lg:text-5xl leading-tight mb-4">
                Be Part of the <span className="text-green">Change</span>
              </h3>
              <p className="text-xl opacity-90">
                Join us in rebuilding dreams and restoring hope for women and young people.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Events Grid Component
const EventsGrid = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch('/assets/data/events.json')
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setEvents([]));
  }, []);

  const displayEvents = showAll ? events : events.slice(0, 3);
  const colors = ['bg-green', 'bg-navy', 'bg-green'];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayEvents.map((event, index) => (
          <a
            key={event.title}
            href={event.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`${colors[index % 3]} relative flex flex-col justify-between min-h-[320px] p-8 text-white hover:-translate-y-1 hover:shadow-lg transition-all`}
          >
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div className="text-3xl font-bold">
                {new Date(event.date).getDate()}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-2xl font-bold leading-tight mb-3">{event.title}</h3>
              <p className="opacity-95">{event.location} • {event.time}</p>
            </div>

            <span className="absolute right-5 bottom-5 font-bold">→</span>
          </a>
        ))}
      </div>

      {events.length > 3 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn btn-green text-lg px-8 py-4"
          >
            {showAll ? 'Hide Events' : 'More Events'}
          </button>
        </div>
      )}
    </>
  );
};

export default Index;
