import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const Events = () => {
  const [showArchived, setShowArchived] = useState(false);

  // Fetch public events from Convex
  const events = useQuery(api.events.getPublicEvents);

  if (!events) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  const upcomingEvents = events.filter(
    (event: any) => event.status === "upcoming"
  );
  const archivedEvents = events.filter(
    (event: any) => event.status !== "upcoming"
  );

  const displayedEvents = showArchived ? archivedEvents : upcomingEvents;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/images/hero-get-involved.jpg"
            alt="Events"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-5xl lg:text-7xl font-coolvetica font-light">
            Events
          </h1>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12 lg:py-20">
        <div className="container">
          {/* Tabs */}
          <div className="flex gap-4 mb-12">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !showArchived
                  ? "bg-green text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                showArchived
                  ? "bg-green text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Archived ({archivedEvents.length})
            </button>
          </div>

          {displayedEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No {showArchived ? "archived" : "upcoming"} events at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedEvents.map((event: any) => (
                <article
                  key={event._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Event Card Body */}
                  <div className="p-6 lg:p-8">
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-green transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <svg
                          className="w-5 h-5 text-green"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-foreground font-medium">
                          {formatDate(event.start_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <svg
                          className="w-5 h-5 text-green"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-foreground font-medium">
                          {formatTime(event.start_date)}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-3 text-sm">
                          <svg
                            className="w-5 h-5 text-green"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-foreground font-medium">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Register Button */}
                    <Link
                      to={`/event/${event.slug}`}
                      className="inline-block px-6 py-2 bg-green text-white rounded-md font-medium hover:bg-green-dark transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;
