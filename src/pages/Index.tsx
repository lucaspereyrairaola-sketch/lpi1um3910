import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { mockEvents } from "@/data/mockEvents";
import { Layers } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">
              Multi-Perspective News
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Read the full picture.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Every story has multiple perspectives. MIDIA surfaces them all — so you can think critically, not reactively.
          </p>
        </motion.div>
      </section>

      {/* Event Feed */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Latest Events
          </h2>
          <span className="text-xs text-muted-foreground">
            {mockEvents.length} events
          </span>
        </div>

        <div className="space-y-4">
          {mockEvents.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
