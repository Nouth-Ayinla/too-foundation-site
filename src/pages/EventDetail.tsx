import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch the event by slug
  const event = useQuery(api.events.getEventBySlug, slug ? { slug } : "skip");

  if (event === undefined) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Event Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The event you're looking for doesn't exist.
        </p>
        <Link to="/events" className="btn btn-green px-8 py-4">
          Back to Events
        </Link>
      </div>
    );
  }

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

  const formatDateRange = () => {
    const startDate = formatDate(event.start_date);
    if (event.end_date) {
      const endDate = formatDate(event.end_date);
      return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    }
    return startDate;
  };

  return (
    <>
      {/* Event Hero Image */}
      <section className="w-full">
        <img
          src={event.image || "/assets/images/event-placeholder.jpg"}
          alt={event.title}
          className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
        />
      </section>

      {/* Event Header */}
      <section className="py-8 lg:py-12 border-b border-border">
        <div className="container max-w-4xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
            {event.title}
          </h1>

          {/* Event Meta Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-green flex-shrink-0"
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
              <div>
                <p className="font-medium text-foreground">
                  {formatDateRange()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(event.start_date)}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green flex-shrink-0"
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
                <p className="font-medium text-foreground">{event.location}</p>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-foreground">
                    Capacity: {event.registrations} / {event.capacity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.capacity - event.registrations} spots remaining
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Event Description */}
      <section className="py-8 lg:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            About This Event
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-8 lg:py-12 bg-muted">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Join?
            </h2>
            <p className="text-muted-foreground mb-6">
              Register now to secure your spot at this event.
            </p>
            <Link
              to={`/events?register=${event._id}`}
              className="btn btn-green px-8 py-4 inline-block"
            >
              Register for Event
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 lg:py-12">
        <div className="container max-w-4xl">
          <Link
            to="/events"
            className="flex items-center gap-2 text-lg font-medium text-foreground hover:text-green transition-colors"
          >
            <span className="text-2xl">‹</span>
            <span>Back to Events</span>
          </Link>
        </div>
      </section>
    </>
  );
};

export default EventDetail;
